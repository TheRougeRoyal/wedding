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

export function checkReminders(guests, onReminderTriggered) {
  const now = new Date();

  guests.forEach((guest) => {
    if (!guest.reminderSet || guest.reminderSent) return;

    const arrivalTime = new Date(guest.arrival);
    const reminderTime = new Date(
      arrivalTime.getTime() - (guest.reminderHoursBefore || 2) * 60 * 60 * 1000
    );

    if (now >= reminderTime && now < arrivalTime) {
      const hoursLeft = Math.round(
        (arrivalTime.getTime() - now.getTime()) / (1000 * 60 * 60) * 10
      ) / 10;

      const typeEmoji = guest.type === 'train' ? '🚂' : '✈️';
      showNotification(
        `${typeEmoji} Guest Arriving Soon!`,
        `${guest.name} arrives in ~${hoursLeft} hours via ${guest.type} (PNR: ${guest.pnr})`,
        { tag: `reminder-${guest.id}` }
      );

      if (onReminderTriggered) {
        onReminderTriggered(guest.id);
      }
    }
  });
}

export function formatTimeUntil(isoString) {
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
