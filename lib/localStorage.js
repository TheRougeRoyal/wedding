const STORAGE_KEY = 'weddingGuests';

export function getGuests() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading guests from localStorage:', error);
    return [];
  }
}

export function saveGuests(guests) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
  } catch (error) {
    console.error('Error saving guests to localStorage:', error);
  }
}

export function addGuest(guest) {
  const guests = getGuests();
  const now = new Date().toISOString();

  const isFlight = guest.travelMode === 'flight';

  const newGuest = {
    id: guest.id || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    name: guest.name || '',
    travelMode: guest.travelMode || 'train',
    trainNumber: guest.trainNumber || '',
    trainName: guest.trainName || '',
    flightNumber: guest.flightNumber || '',
    flightIcao: guest.flightIcao || '',
    airline: guest.airline || '',
    airlineIata: guest.airlineIata || '',
    origin: guest.origin || '',
    originName: guest.originName || '',
    destination: guest.destination || '',
    destinationName: guest.destinationName || '',
    currentStation: guest.currentStation || '',
    nextStop: guest.nextStop || '',
    nextStopTime: guest.nextStopTime || '',
    departureTime: guest.departureTime || '',
    arrivalTime: guest.arrivalTime || '',
    departureTerminal: guest.departureTerminal || '',
    departureGate: guest.departureGate || '',
    arrivalTerminal: guest.arrivalTerminal || '',
    arrivalGate: guest.arrivalGate || '',
    aircraft: guest.aircraft || '',
    status: guest.status || 'UNKNOWN',
    delayMinutes: guest.delayMinutes || 0,
    lastUpdated: guest.lastUpdated || now,
    reminderSet: guest.reminderSet ?? false,
    reminderHoursBefore: guest.reminderHoursBefore ?? 2,
    reminderSent: false,
    journeyDate: guest.journeyDate || '',
    peopleCount: guest.peopleCount || 1,
    rooms: guest.rooms || [],
    roomError: guest.roomError || false,
  };

  guests.push(newGuest);
  saveGuests(guests);
  return newGuest;
}

export function removeGuest(id) {
  const guests = getGuests();
  const filtered = guests.filter((g) => g.id !== id);
  saveGuests(filtered);
  return filtered;
}

export function updateGuest(id, updates) {
  const guests = getGuests();
  const index = guests.findIndex((g) => g.id === id);
  if (index === -1) return null;
  guests[index] = { ...guests[index], ...updates };
  saveGuests(guests);
  return guests[index];
}
