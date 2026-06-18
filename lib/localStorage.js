const STORAGE_KEY = 'wedding_guests';

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
  const newGuest = {
    ...guest,
    id: guest.id || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    reminderSet: guest.reminderSet ?? false,
    reminderHoursBefore: guest.reminderHoursBefore ?? 2,
    reminderSent: false,
    createdAt: new Date().toISOString(),
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

export function getGuestById(id) {
  const guests = getGuests();
  return guests.find((g) => g.id === id) || null;
}
