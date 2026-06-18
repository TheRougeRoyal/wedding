'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Dashboard from '@/components/Dashboard';
import {
  getGuests,
  removeGuest,
  updateGuest,
} from '@/lib/localStorage';
import {
  requestNotificationPermission,
  checkReminders,
} from '@/lib/reminders';

export default function HomePage() {
  const [guests, setGuests] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState(null);

  // Load guests from localStorage
  useEffect(() => {
    const loadedGuests = getGuests();
    setGuests(loadedGuests);
    setIsLoaded(true);
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Reminder checker — runs every 60 seconds
  useEffect(() => {
    if (!isLoaded) return;

    const handleReminderTriggered = (guestId) => {
      updateGuest(guestId, { reminderSent: true });
      setGuests((prev) =>
        prev.map((g) =>
          g.id === guestId ? { ...g, reminderSent: true } : g
        )
      );
      const guest = guests.find((g) => g.id === guestId);
      if (guest) {
        showToast(`🔔 Reminder sent for ${guest.name}!`, 'info');
      }
    };

    // Check immediately
    checkReminders(guests, handleReminderTriggered);

    // Then every 60 seconds
    const interval = setInterval(() => {
      const currentGuests = getGuests();
      checkReminders(currentGuests, handleReminderTriggered);
    }, 60000);

    return () => clearInterval(interval);
  }, [isLoaded, guests, showToast]);

  const handleDelete = useCallback(
    (id) => {
      const guest = guests.find((g) => g.id === id);
      removeGuest(id);
      setGuests((prev) => prev.filter((g) => g.id !== id));
      showToast(`${guest?.name || 'Guest'} removed successfully`);
    },
    [guests, showToast]
  );

  const handleToggleReminder = useCallback(
    (id) => {
      const guest = guests.find((g) => g.id === id);
      if (!guest) return;

      const newReminderSet = !guest.reminderSet;
      updateGuest(id, {
        reminderSet: newReminderSet,
        reminderSent: newReminderSet ? false : guest.reminderSent,
      });
      setGuests((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                reminderSet: newReminderSet,
                reminderSent: newReminderSet ? false : g.reminderSent,
              }
            : g
        )
      );

      if (newReminderSet) {
        requestNotificationPermission();
        showToast(`⏰ Reminder set for ${guest.name}`, 'info');
      } else {
        showToast(`Reminder removed for ${guest.name}`);
      }
    },
    [guests, showToast]
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-10 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-3xl">💍</span>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Shaadi Guest
                <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-rose-300 bg-clip-text text-transparent">
                  {' '}
                  Tracker
                </span>
              </h1>
            </div>
            <p className="mt-2 text-base text-gray-400">
              Keep track of every guest&apos;s travel — so no one&apos;s left
              waiting at the station.
            </p>
          </div>

          <Link
            href="/add"
            className="btn-shine group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/30 hover:brightness-110"
          >
            <svg
              className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Guest
          </Link>
        </div>

        {/* Divider */}
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
      </header>

      {/* Loading State */}
      {!isLoaded ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-rose-500/20 border-t-rose-500" />
          <p className="mt-4 text-sm text-gray-500">Loading guests...</p>
        </div>
      ) : (
        <div className="animate-slide-up">
          <Dashboard
            guests={guests}
            onDelete={handleDelete}
            onToggleReminder={handleToggleReminder}
          />
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 toast-in">
          <div
            className={`flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-2xl backdrop-blur-xl ${
              toast.type === 'info'
                ? 'border-sky-500/20 bg-sky-950/90 text-sky-200'
                : toast.type === 'error'
                ? 'border-red-500/20 bg-red-950/90 text-red-200'
                : 'border-emerald-500/20 bg-emerald-950/90 text-emerald-200'
            }`}
          >
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white/50 transition-colors hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-white/5 pt-8 text-center">
        <p className="text-xs text-gray-600">
          💒 Made with love for your special day • Data stored locally in your
          browser
        </p>
      </footer>
    </main>
  );
}
