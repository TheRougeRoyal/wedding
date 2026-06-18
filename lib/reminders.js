/**
 * Reminder and notification utilities for Wedding Guest Tracker
 * Handles browser notifications and time formatting
 */

/**
 * Request browser notification permission
 * @returns {Promise<string>} Permission status
 */
export function requestNotificationPermission() {
  if (typeof window === 'undefined') return Promise.resolve('denied');
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return Promise.resolve('denied');
  }
  if (Notification.permission === 'granted') {
    return Promise.resolve('granted');
  }
  return Notification.requestPermission();
}

/**
 * Show a browser notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body text
 * @param {Object} options - Additional notification options
 */
export function showNotification(title, body, options = {}) {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: options.tag || 'wedding-guest-reminder',
      requireInteraction: true,
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 30 seconds
    setTimeout(() => notification.close(), 30000);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

/**
 * Check all guests for pending reminders and trigger notifications
 * @param {Array} guests - Array of guest objects
 * @param {Function} onReminderTriggered - Callback when a reminder fires
 */
export function checkReminders(guests, onReminderTriggered) {
  const now = new Date();

  guests.forEach((guest) => {
    if (!guest.reminderSet || guest.reminderSent) return;

    // Use estimatedArrival if available, otherwise scheduledArrival
    const arrivalTime = new Date(guest.estimatedArrival || guest.scheduledArrival);
    const reminderTime = new Date(
      arrivalTime.getTime() - (guest.reminderHoursBefore || 2) * 60 * 60 * 1000
    );

    if (now >= reminderTime && now < arrivalTime) {
      const hoursLeft = Math.round(
        (arrivalTime.getTime() - now.getTime()) / (1000 * 60 * 60) * 10
      ) / 10;

      const statusText = guest.liveStatus === 'DELAYED'
        ? ` (Delayed ${guest.delayMinutes} min)`
        : '';

      showNotification(
        `🚂 Guest Arriving Soon!`,
        `${guest.name} arrives in ~${hoursLeft} hours via ${guest.trainName}${statusText} (PNR: ${guest.pnr})`,
        { tag: `reminder-${guest.id}` }
      );

      if (onReminderTriggered) {
        onReminderTriggered(guest.id);
      }
    }
  });
}

/**
 * Format a time duration until a target date in human-readable form
 * @param {string} isoString - Target ISO datetime string
 * @returns {string} Formatted time remaining (e.g., "2d 5h", "3h 20m", "15m")
 */
export function formatTimeUntil(isoString) {
  if (!isoString) return 'Unknown';
  
  const now = new Date();
  const target = new Date(isoString);
  const diff = target.getTime() - now.getTime();

  if (diff < 0) return 'Already arrived';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Format an ISO datetime as a locale-friendly string
 * @param {string} isoString - ISO datetime string
 * @returns {string} Formatted date/time
 */
export function formatDateTime(isoString) {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Format relative time (e.g., "5 min ago", "2 hours ago")
 * @param {string} isoString - ISO datetime string
 * @returns {string} Relative time string
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return '';
  
  const now = new Date();
  const target = new Date(isoString);
  const diff = now.getTime() - target.getTime();

  if (diff < 0) return 'just now';

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return formatDateTime(isoString);
}
