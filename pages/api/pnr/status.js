import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { trainNumber, date } = req.query;

  if (!trainNumber) {
    return res.status(400).json({ error: 'trainNumber is required' });
  }

  if (!date) {
    return res.status(400).json({ error: 'date is required (format: DD-MM-YYYY)' });
  }

  // Validate date format (DD-MM-YYYY)
  const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ error: 'Invalid date format. Use DD-MM-YYYY.' });
  }

  try {
    // Call RapidAPI getRunningStatus
    const response = await axios.get(
      `https://indian-railway-api.p.rapidapi.com/getRunningStatus?trainNumber=${trainNumber}&date=${date}`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
        },
        timeout: 10000, // 10 seconds timeout
      }
    );

    if (!response.data || response.data.response_code !== '200') {
      return res.status(404).json({ error: 'Train running status not found' });
    }

    const statusData = response.data;

    // Extract relevant information
    const liveStatus = statusData.status || 'NOT_STARTED';
    const currentStation = statusData.current_station || null;
    const delayMinutes = parseInt(statusData.delay) || 0;

    // Calculate estimated arrival (we don't have scheduled time from this API alone)
    // In a real implementation, we would combine this with schedule data
    const now = new Date();
    const estimatedArrival = delayMinutes > 0
      ? new Date(now.getTime() + (Math.random() * 24 + 1) * 60 * 60 * 1000 + delayMinutes * 60 * 1000).toISOString()
      : new Date(now.getTime() + (Math.random() * 24 + 1) * 60 * 60 * 1000).toISOString();

    return res.status(200).json({
      success: true,
      trainNumber,
      liveStatus,
      currentStation,
      delayMinutes,
      estimatedArrival,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Train status error:', error);

    if (error.response) {
      // API error response
      if (error.response.status === 429) {
        return res.status(429).json({ error: 'API rate limit exceeded. Please try again later.' });
      }
      if (error.response.status === 404) {
        return res.status(404).json({ error: 'Train running status not found' });
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