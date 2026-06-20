import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.AVIATIONSTACK_KEY) {
    return res.status(500).json({ error: 'Aviationstack API key not configured' });
  }

  const { flightNumber } = req.body;

  if (!flightNumber) {
    return res.status(400).json({ error: 'Flight number is required' });
  }

  try {
    const response = await axios.get('http://api.aviationstack.com/v1/flights', {
      params: {
        access_key: process.env.AVIATIONSTACK_KEY,
        flight_iata: flightNumber.trim(),
      },
      timeout: 15000,
    });

    const data = response.data;

    if (!data || data.data === undefined) {
      return res.status(404).json({ error: data?.error?.info || 'Flight not found' });
    }

    if (!data.data || data.data.length === 0) {
      return res.status(404).json({ error: 'No flights found for this number' });
    }

    const flight = data.data[0];

    return res.status(200).json({
      success: true,
      data: {
        flightNumber: flight.flight?.iata || flightNumber,
        flightIcao: flight.flight?.icao || '',
        airline: flight.airline?.name || '',
        airlineIata: flight.airline?.iata || '',
        origin: flight.airport?.origin?.iata || '',
        originName: flight.airport?.origin?.name || '',
        destination: flight.airport?.destination?.iata || '',
        destinationName: flight.airport?.destination?.name || '',
        departureTime: flight.departure?.scheduled || '',
        arrivalTime: flight.arrival?.scheduled || '',
        departureTerminal: flight.departure?.terminal || '',
        departureGate: flight.departure?.gate || '',
        arrivalTerminal: flight.arrival?.terminal || '',
        arrivalGate: flight.arrival?.gate || '',
        status: flight.flight_status || 'unknown',
        delayMinutes: (flight.departure?.delay || 0),
        aircraft: flight.aircraft?.iata || '',
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Flight status error:', error.message);

    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    return res.status(500).json({
      error: error.message || 'Failed to fetch flight status',
    });
  }
}
