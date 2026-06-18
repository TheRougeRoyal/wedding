import { NextResponse } from 'next/server';

// Mock in-memory store for SSR/API compatibility
// In production, the client uses localStorage directly
let guests = [];

export async function GET() {
  return NextResponse.json({ guests, success: true });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, type, pnr, arrival, departure, reminderHoursBefore } = body;

    if (!name || !type || !pnr || !arrival || !departure) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, pnr, arrival, departure' },
        { status: 400 }
      );
    }

    if (!['train', 'flight'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "train" or "flight"' },
        { status: 400 }
      );
    }

    const guest = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      pnr: pnr.toUpperCase(),
      arrival,
      departure,
      reminderSet: false,
      reminderHoursBefore: reminderHoursBefore || 2,
      reminderSent: false,
      createdAt: new Date().toISOString(),
    };

    guests.push(guest);
    return NextResponse.json({ guest, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
