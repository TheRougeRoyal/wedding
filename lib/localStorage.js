/**
 * localStorage utility for Wedding Guest Tracker
 * Handles all CRUD operations for guest data persistence
 */

const STORAGE_KEY = 'wedding_guests';

/**
 * Get all guests from localStorage
 * @returns {Array} Array of guest objects
 */
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

/**
 * Save guests array to localStorage
 * @param {Array} guests - Array of guest objects
 */
export function saveGuests(guests) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
  } catch (error) {
    console.error('Error saving guests to localStorage:', error);
  }
}

/**
 * Add a new guest to localStorage
 * @param {Object} guest - Guest data from PNR lookup + user input
 * @returns {Object} The saved guest with generated ID and defaults
 */
export function addGuest(guest) {
  const guests = getGuests();
  const now = new Date().toISOString();

  const newGuest = {
    // Auto-generated fields
    id: guest.id || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,

    // User-provided fields
    name: guest.name || '',
    pnr: guest.pnr || '',

    // Train details (from PNR lookup)
    trainNumber: guest.trainNumber || '',
    trainName: guest.trainName || '',
    fromStation: guest.fromStation || { code: '', name: '' },
    toStation: guest.toStation || { code: '', name: '' },
    scheduledDeparture: guest.scheduledDeparture || now,
    scheduledArrival: guest.scheduledArrival || now,

    // Live tracking fields
    liveStatus: guest.liveStatus || 'NOT_STARTED',
    currentStation: guest.currentStation || '',
    delayMinutes: guest.delayMinutes || 0,
    estimatedArrival: guest.estimatedArrival || guest.scheduledArrival || now,
    lastUpdated: guest.lastUpdated || now,

    // Reminder fields
    reminderSet: guest.reminderSet ?? false,
    reminderHoursBefore: guest.reminderHoursBefore ?? 2,
    reminderSent: false,
  };

  guests.push(newGuest);
  saveGuests(guests);
  return newGuest;
}

/**
 * Remove a guest from localStorage by ID
 * @param {string} id - Guest ID to remove
 * @returns {Array} Updated guests array
 */
export function removeGuest(id) {
  const guests = getGuests();
  const filtered = guests.filter((g) => g.id !== id);
  saveGuests(filtered);
  return filtered;
}

/**
 * Update a guest's fields in localStorage
 * @param {string} id - Guest ID to update
 * @param {Object} updates - Partial guest object with fields to update
 * @returns {Object|null} Updated guest or null if not found
 */
export function updateGuest(id, updates) {
  const guests = getGuests();
  const index = guests.findIndex((g) => g.id === id);
  if (index === -1) return null;
  guests[index] = { ...guests[index], ...updates };
  saveGuests(guests);
  return guests[index];
}

/**
 * Get a single guest by ID
 * @param {string} id - Guest ID
 * @returns {Object|null} Guest object or null
 */
export function getGuestById(id) {
  const guests = getGuests();
  return guests.find((g) => g.id === id) || null;
}
