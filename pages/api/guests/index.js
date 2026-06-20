export default async function handler(req, res) {
  switch (req.method) {
    case 'GET': {
      return res.status(200).json({
        success: true,
        message: 'Guests are managed client-side via localStorage',
      });
    }

    case 'POST': {
      const body = req.body;

      if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Request body is empty or not valid JSON.',
        });
      }

      const errors = [];
      if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
        errors.push('name is required.');
      }
      if (!body.trainNumber) {
        errors.push('trainNumber is required.');
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed.',
          details: errors,
        });
      }

      const id = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const validatedGuest = {
        id,
        createdAt: new Date().toISOString(),
        name: body.name.trim(),
        travelMode: body.travelMode || 'train',
        trainNumber: body.trainNumber || '',
        trainName: body.trainName || '',
        flightNumber: body.flightNumber || '',
        flightIcao: body.flightIcao || '',
        airline: body.airline || '',
        airlineIata: body.airlineIata || '',
        origin: body.origin || '',
        originName: body.originName || '',
        destination: body.destination || '',
        destinationName: body.destinationName || '',
        currentStation: body.currentStation || '',
        nextStop: body.nextStop || '',
        nextStopTime: body.nextStopTime || '',
        departureTime: body.departureTime || '',
        arrivalTime: body.arrivalTime || '',
        departureTerminal: body.departureTerminal || '',
        departureGate: body.departureGate || '',
        arrivalTerminal: body.arrivalTerminal || '',
        arrivalGate: body.arrivalGate || '',
        aircraft: body.aircraft || '',
        status: body.status || 'UNKNOWN',
        delayMinutes: body.delayMinutes || 0,
        lastUpdated: body.lastUpdated || new Date().toISOString(),
        reminderSet: body.reminderSet ?? false,
        reminderHoursBefore: body.reminderHoursBefore ?? 2,
        journeyDate: body.journeyDate || '',
        peopleCount: body.peopleCount || 1,
        rooms: [],
        roomError: false,
      };

      return res.status(201).json({
        success: true,
        guest: validatedGuest,
      });
    }

    default: {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} Not Allowed.`,
      });
    }
  }
}
