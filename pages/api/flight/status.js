import axios from 'axios';

const OPENSKY_AUTH_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';
const OPENSKY_API_URL = 'https://opensky-network.org/api';

let cachedToken = null;
let tokenExpiry = 0;

async function getOpenSkyToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.OPENSKY_CLIENT_ID;
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('OpenSky credentials not configured');
  }

  const response = await axios.post(OPENSKY_AUTH_URL,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000,
    }
  );

  cachedToken = response.data.access_token;
  tokenExpiry = now + (response.data.expires_in - 60) * 1000;
  return cachedToken;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { flightNumber } = req.body;

  if (!flightNumber) {
    return res.status(400).json({ error: 'Flight number is required' });
  }

  try {
    const token = await getOpenSkyToken();
    const callsign = flightNumber.trim().toUpperCase();

    const now = Math.floor(Date.now() / 1000);
    const begin = now - 24 * 60 * 60;

    const response = await axios.get(`${OPENSKY_API_URL}/flights/callsign`, {
      params: { callsign, begin, end: now },
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000,
    });

    const flights = response.data;

    if (!flights || flights.length === 0) {
      return res.status(404).json({ error: 'No flights found for this number' });
    }

    const flight = flights[flights.length - 1];

    return res.status(200).json({
      success: true,
      data: {
        flightNumber: callsign,
        flightIcao: callsign,
        airlineIata: '',
        origin: flight.estDepartureAirport || '',
        destination: flight.estArrivalAirport || '',
        departureTime: flight.firstSeen
          ? new Date(flight.firstSeen * 1000).toISOString()
          : '',
        arrivalTime: flight.lastSeen
          ? new Date(flight.lastSeen * 1000).toISOString()
          : '',
        departureTerminal: '',
        departureGate: '',
        arrivalTerminal: '',
        arrivalGate: '',
        status: flight.estArrivalAirport ? 'landed' : 'en-route',
        delayMinutes: 0,
        aircraft: '',
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Flight status error:', error.message);

    if (error.response?.status === 401) {
      cachedToken = null;
      tokenExpiry = 0;
      return res.status(401).json({ error: 'Authentication failed' });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    return res.status(500).json({
      error: error.message || 'Failed to fetch flight status',
    });
  }
}
