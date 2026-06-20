import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RAPIDAPI_KEY || !process.env.RAPIDAPI_HOST) {
    return res.status(500).json({ error: 'API credentials not configured' });
  }

  const { trainNumber } = req.body;

  if (!trainNumber) {
    return res.status(400).json({ error: 'Train number is required' });
  }

  try {
    const response = await axios.get(
      `https://irctc1.p.rapidapi.com/api/v1/liveTrainStatus?trainNo=${trainNumber}&startDay=1`,
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': process.env.RAPIDAPI_HOST,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const data = response.data;

    if (!data || !data.status || !data.data) {
      return res.status(404).json({ error: data?.message || 'Train not found' });
    }

    const result = data.data;

    return res.status(200).json({
      success: true,
      trainNumber: result.train_number || trainNumber,
      data: {
        trainNumber: result.train_number || trainNumber,
        trainName: result.train_name || '',
        origin: result.source_stn_name || '',
        destination: result.dest_stn_name || '',
        currentStation: result.current_station_name || '',
        nextStop: result.next_stoppage_info?.next_stoppage || '',
        nextStopTime: result.next_stoppage_info?.next_stoppage_time_diff || '',
        status: result.status || 'UNKNOWN',
        delayMinutes: parseInt(result.delay) || 0,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Train status error:', error.message);

    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Train not found' });
    }

    return res.status(500).json({
      error: error.message || 'Failed to fetch train status',
    });
  }
}
