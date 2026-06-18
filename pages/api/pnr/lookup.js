import axios from 'axios';

export default async function handler(req, res) {
  // Log environment variables (remove in production)
  console.log('RAPIDAPI_KEY exists:', !!process.env.RAPIDAPI_KEY);
  console.log('RAPIDAPI_HOST exists:', !!process.env.RAPIDAPI_HOST);
  console.log('RAPIDAPI_HOST value:', process.env.RAPIDAPI_HOST);

  // Check if env vars are set
  if (!process.env.RAPIDAPI_KEY || !process.env.RAPIDAPI_HOST) {
    console.error('Missing RapidAPI credentials in environment variables');
    return res.status(500).json({ 
      error: 'API credentials not configured. Please set RAPIDAPI_KEY and RAPIDAPI_HOST in .env.local',
      debug: {
        hasKey: !!process.env.RAPIDAPI_KEY,
        hasHost: !!process.env.RAPIDAPI_HOST
      }
    });
  }

  if (req.method === 'POST') {
    const { pnr } = req.body;

    if (!pnr) {
      return res.status(400).json({ error: 'PNR number is required' });
    }

    const pnrRegex = /^\d{10}$/;
    if (!pnrRegex.test(pnr)) {
      return res.status(400).json({ error: 'Invalid PNR format. PNR must be a 10-digit number.' });
    }

    try {
      console.log(`Looking up PNR: ${pnr}`);
      
      const pnrResponse = await axios.get(
        `https://indian-railway-api.p.rapidapi.com/getPNRDetails?pnrNumber=${pnr}`,
        {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
          },
          timeout: 10000,
        }
      );

      console.log('PNR Response status:', pnrResponse.status);
      console.log('PNR Response code:', pnrResponse.data.response_code);

      if (!pnrResponse.data || pnrResponse.data.response_code !== '200') {
        return res.status(404).json({ error: 'PNR not found or invalid' });
      }

      const pnrData = pnrResponse.data;

      const trainNumber = pnrData.train_number || '';
      const trainName = pnrData.train_name || '';
      const fromStationCode = pnrData.from_station_code || '';
      const toStationCode = pnrData.to_station_code || '';
      const dateOfJourney = pnrData.do_j || '';

      const scheduledDeparture = new Date(
        `${dateOfJourney.split('-').reverse().join('-')}T00:00:00`
      ).toISOString();

      const scheduledArrival = new Date(
        `${dateOfJourney.split('-').reverse().join('-')}T23:59:59`
      ).toISOString();

      console.log(`Getting running status for train: ${trainNumber}, date: ${dateOfJourney}`);

      const statusResponse = await axios.get(
        `https://indian-railway-api.p.rapidapi.com/getRunningStatus?trainNumber=${trainNumber}&date=${dateOfJourney}`,
        {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
          },
          timeout: 10000,
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
            name: fromStationCode,
          },
          toStation: {
            code: toStationCode,
            name: toStationCode,
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
      console.error('PNR lookup error:', error.message);
      console.error('Error details:', error);

      if (error.response) {
        console.error('API Response error:', error.response.status);
        if (error.response.status === 429) {
          return res.status(429).json({ error: 'API rate limit exceeded. Please try again later.' });
        }
        if (error.response.status === 404) {
          return res.status(404).json({ error: 'PNR not found' });
        }
        return res.status(error.response.status || 500).json({
          error: error.response.data?.error || 'API error occurred',
          details: error.response.data
        });
      } else if (error.request) {
        console.error('No response from API');
        return res.status(500).json({ error: 'Network error. Please check your connection and try again.' });
      } else {
        return res.status(500).json({ error: error.message || 'An unexpected error occurred. Please try again.' });
      }
    }
  }

  if (req.method === 'GET') {
    const { pnr } = req.query;

    if (!pnr) {
      return res.status(400).json({ error: 'PNR number is required' });
    }

    const pnrRegex = /^\d{10}$/;
    if (!pnrRegex.test(pnr)) {
      return res.status(400).json({ error: 'Invalid PNR format. PNR must be a 10-digit number.' });
    }

    try {
      console.log(`GET: Looking up PNR: ${pnr}`);
      
      const pnrResponse = await axios.get(
        `https://indian-railway-api.p.rapidapi.com/getPNRDetails?pnrNumber=${pnr}`,
        {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
          },
          timeout: 10000,
        }
      );

      if (!pnrResponse.data || pnrResponse.data.response_code !== '200') {
        return res.status(404).json({ error: 'PNR not found or invalid' });
      }

      const pnrData = pnrResponse.data;

      const trainNumber = pnrData.train_number || '';
      const trainName = pnrData.train_name || '';
      const fromStationCode = pnrData.from_station_code || '';
      const toStationCode = pnrData.to_station_code || '';
      const dateOfJourney = pnrData.do_j || '';

      const scheduledDeparture = new Date(
        `${dateOfJourney.split('-').reverse().join('-')}T00:00:00`
      ).toISOString();

      const scheduledArrival = new Date(
        `${dateOfJourney.split('-').reverse().join('-')}T23:59:59`
      ).toISOString();

      const statusResponse = await axios.get(
        `https://indian-railway-api.p.rapidapi.com/getRunningStatus?trainNumber=${trainNumber}&date=${dateOfJourney}`,
        {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
          },
          timeout: 10000,
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
            name: fromStationCode,
          },
          toStation: {
            code: toStationCode,
            name: toStationCode,
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
      console.error('GET PNR lookup error:', error.message);

      if (error.response) {
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
        return res.status(500).json({ error: 'Network error. Please check your connection and try again.' });
      } else {
        return res.status(500).json({ error: error.message || 'An unexpected error occurred' });
      }
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}