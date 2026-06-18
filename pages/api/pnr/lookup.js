import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { pnr } = req.body;

    if (!pnr) {
      return res.status(400).json({ error: 'PNR number is required' });
    }

    // Validate PNR format (10 digits)
    const pnrRegex = /^\d{10}$/;
    if (!pnrRegex.test(pnr)) {
      return res.status(400).json({ error: 'Invalid PNR format. PNR must be a 10-digit number.' });
    }

    try {
      // Call RapidAPI getPNRDetails
      const pnrResponse = await axios.get(
        `https://indian-railway-api.p.rapidapi.com/getPNRDetails?pnrNumber=${pnr}`,
        {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
          },
          timeout: 10000, // 10 seconds timeout
        }
      );

      if (!pnrResponse.data || pnrResponse.data.response_code !== '200') {
        return res.status(404).json({ error: 'PNR not found or invalid' });
      }

      const pnrData = pnrResponse.data;

      // Extract required fields from PNR response
      const trainNumber = pnrData.train_number || '';
      const trainName = pnrData.train_name || '';
      const fromStationCode = pnrData.from_station_code || '';
      const toStationCode = pnrData.to_station_code || '';
      const dateOfJourney = pnrData.do_j || ''; // Date of journey in DD-MM-YYYY format

      // Get station names from codes (we'll need to map these)
      const fromStation = { code: fromStationCode, name: fromStationCode }; // We'll enhance this if needed
      const toStation = { code: toStationCode, name: toStationCode };

      // Calculate scheduled departure and arrival from PNR data
      // The PNR API typically provides journey date, but not exact times
      // We'll need to estimate or get from another source
      // For now, we'll use the date of journey and set default times
      const scheduledDeparture = new Date(
        `${dateOfJourney.split('-').reverse().join('-')}T00:00:00`
      ).toISOString(); // Default to midnight, should be enhanced

      const scheduledArrival = new Date(
        `${dateOfJourney.split('-').reverse().join('-')}T23:59:59`
      ).toISOString(); // Default to end of day, should be enhanced

      // Now get running status for the train
      const statusResponse = await axios.get(
        `https://indian-railway-api.p.rapidapi.com/getRunningStatus?trainNumber=${trainNumber}&date=${dateOfJourney}`,
        {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
          },
          timeout: 10000, // 10 seconds timeout
        }
      );

      let liveStatus = 'NOT_STARTED';
      let currentStation = null;
      let delayMinutes = 0;

      if (statusResponse.data && statusResponse.data.response_code === '200') {
        const statusData = statusResponse.data;
        liveStatus = statusData.status || 'NOT_STARTED';
        currentStation = statusData.current_station || null;
        delayMinutes = parseInt(statusData.delay) || 0;
      }

      // Calculate estimated arrival based on delay
      const scheduledArrivalDate = new Date(scheduledArrival);
      const estimatedArrival = new Date(
        scheduledArrivalDate.getTime() + delayMinutes * 60 * 1000
      ).toISOString();

      return res.status(200).json({
        success: true,
        pnr: pnr.toUpperCase(),
        data: {
          trainNumber,
          trainName,
          fromStation: {
            code: fromStationCode,
            name: fromStationCode, // In a real app, we'd map codes to names
          },
          toStation: {
            code: toStationCode,
            name: toStationCode, // In a real app, we'd map codes to names
          },
          scheduledDeparture,
          scheduledArrival,
          liveStatus,
          currentStation,
          delayMinutes,
          estimatedArrival,
          lastUpdated: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('PNR lookup error:', error);

      if (error.response) {
        // API error response
        if (error.response.status === 429) {
          return res.status(429).json({ error: 'API rate limit exceeded. Please try again later.' });
        }
        if (error.response.status === 404) {
          return res.status(404).json({ error: 'PNR not found' });
        }
        return res.status(error.response.status || 500).json({
          error: error.response.data?.error || 'API error occurred'
        });
      } else if (error.request) {
        // No response received
        return res.status(500).json({ error: 'Network error. Please check your connection and try again.' });
      } else {
        // Other error
        return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
      }
    }
  }

  // GET method for backward compatibility
  if (req.method === 'GET') {
    const pnr = req.query.pnr?.toUpperCase();

    if (!pnr) {
      return res.status(400).json({ error: 'PNR number is required' });
    }

    // Same logic as POST but using query params
    return handler({ method: 'POST', body: { pnr } });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}