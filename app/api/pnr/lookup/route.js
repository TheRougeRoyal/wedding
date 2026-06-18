import { NextResponse } from 'next/server';

const MOCK_TRAIN_DATA = {
  'PNR001': {
    trainNumber: '12301',
    trainName: 'Rajdhani Express',
    from: 'New Delhi',
    to: 'Mumbai Central',
    departure: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    arrival: new Date(Date.now() + 2.7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Confirmed',
    coach: 'A1',
    berth: '42',
  },
  'PNR002': {
    trainNumber: '12951',
    trainName: 'Mumbai Rajdhani',
    from: 'Mumbai Central',
    to: 'New Delhi',
    departure: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    arrival: new Date(Date.now() + 3.7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Confirmed',
    coach: 'B2',
    berth: '15',
  },
  'PNR003': {
    trainNumber: '12259',
    trainName: 'Sealdah Duronto',
    from: 'Sealdah',
    to: 'New Delhi',
    departure: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    arrival: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Waiting List',
    coach: 'S5',
    berth: '63',
  },
};

const MOCK_FLIGHT_DATA = {
  'FLT001': {
    flightNumber: 'AI-101',
    airline: 'Air India',
    from: 'Delhi (DEL)',
    to: 'Mumbai (BOM)',
    departure: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    arrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000).toISOString(),
    status: 'Confirmed',
    terminal: 'T3',
    gate: 'G12',
  },
  'FLT002': {
    flightNumber: '6E-204',
    airline: 'IndiGo',
    from: 'Bangalore (BLR)',
    to: 'Delhi (DEL)',
    departure: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    arrival: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    status: 'Confirmed',
    terminal: 'T1',
    gate: 'G5',
  },
  'FLT003': {
    flightNumber: 'SG-8169',
    airline: 'SpiceJet',
    from: 'Chennai (MAA)',
    to: 'Delhi (DEL)',
    departure: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    arrival: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 2.75 * 60 * 60 * 1000).toISOString(),
    status: 'Confirmed',
    terminal: 'T2',
    gate: 'G8',
  },
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pnr = searchParams.get('pnr')?.toUpperCase();
  const type = searchParams.get('type')?.toLowerCase();

  if (!pnr) {
    return NextResponse.json(
      { error: 'PNR number is required' },
      { status: 400 }
    );
  }

  if (!type || !['train', 'flight'].includes(type)) {
    return NextResponse.json(
      { error: 'Type must be "train" or "flight"' },
      { status: 400 }
    );
  }

  const data = type === 'train' ? MOCK_TRAIN_DATA[pnr] : MOCK_FLIGHT_DATA[pnr];

  if (!data) {
    // Generate random mock data for unknown PNRs
    const now = Date.now();
    const randomDays = Math.floor(Math.random() * 7) + 1;
    const departureTime = new Date(now + randomDays * 24 * 60 * 60 * 1000);
    const arrivalTime = new Date(departureTime.getTime() + (type === 'train' ? 12 : 3) * 60 * 60 * 1000);

    const generatedData = type === 'train' 
      ? {
          trainNumber: `1${Math.floor(Math.random() * 9000 + 1000)}`,
          trainName: 'Express Special',
          from: 'Origin Station',
          to: 'Destination Station',
          departure: departureTime.toISOString(),
          arrival: arrivalTime.toISOString(),
          status: 'Confirmed',
          coach: `S${Math.floor(Math.random() * 10 + 1)}`,
          berth: `${Math.floor(Math.random() * 72 + 1)}`,
        }
      : {
          flightNumber: `XX-${Math.floor(Math.random() * 9000 + 1000)}`,
          airline: 'Airlines',
          from: 'Origin Airport',
          to: 'Destination Airport',
          departure: departureTime.toISOString(),
          arrival: arrivalTime.toISOString(),
          status: 'Confirmed',
          terminal: `T${Math.floor(Math.random() * 3 + 1)}`,
          gate: `G${Math.floor(Math.random() * 20 + 1)}`,
        };

    return NextResponse.json({
      success: true,
      pnr,
      type,
      data: generatedData,
      isMock: true,
    });
  }

  return NextResponse.json({
    success: true,
    pnr,
    type,
    data,
    isMock: true,
  });
}
