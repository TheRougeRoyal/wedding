'use client';

import { useState, useEffect } from 'react';
import { formatTimeUntil } from '@/lib/reminders';

export default function GuestCard({ guest, onDelete, onToggleReminder }) {
  const [timeUntil, setTimeUntil] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    setTimeUntil(formatTimeUntil(guest.arrival));
    const interval = setInterval(() => {
      setTimeUntil(formatTimeUntil(guest.arrival));
    }, 60000);
    return () => clearInterval(interval);
  }, [guest.arrival]);

  const isArrived = new Date(guest.arrival) <= new Date();
  const isTrain = guest.type === 'train';

  const formatDateTime = (iso) => {
    return new Date(iso).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
        isTrain
          ? 'border-amber-500/20 bg-gradient-to-br from-amber-950/40 via-stone-900/60 to-stone-950/80 hover:border-amber-400/40 hover:shadow-amber-500/10'
          : 'border-sky-500/20 bg-gradient-to-br from-sky-950/40 via-slate-900/60 to-slate-950/80 hover:border-sky-400/40 hover:shadow-sky-500/10'
      } backdrop-blur-xl`}
    >
      {/* Decorative gradient orb */}
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-60 ${
          isTrain ? 'bg-amber-500/20 opacity-30' : 'bg-sky-500/20 opacity-30'
        }`}
      />

      <div className="relative p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
                isTrain
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-sky-500/15 text-sky-400'
              }`}
            >
              {isTrain ? '🚂' : '✈️'}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{guest.name}</h3>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isTrain
                    ? 'bg-amber-500/15 text-amber-300'
                    : 'bg-sky-500/15 text-sky-300'
                }`}
              >
                {isTrain ? 'Train' : 'Flight'} • {guest.pnr}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <div
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isArrived
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-rose-500/15 text-rose-300'
            }`}
          >
            {isArrived ? '✓ Arrived' : timeUntil}
          </div>
        </div>

        {/* Schedule Info */}
        <div className="mb-4 space-y-2 rounded-xl bg-white/[0.03] p-3">
          <div className="flex items-center gap-2 text-sm">
            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-400">Arrives:</span>
            <span className="text-gray-200">{formatDateTime(guest.arrival)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <svg className="h-4 w-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-400">Departs:</span>
            <span className="text-gray-200">{formatDateTime(guest.departure)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleReminder(guest.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
              guest.reminderSet
                ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <svg className="h-4 w-4" fill={guest.reminderSet ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {guest.reminderSet ? 'Reminder On' : 'Set Reminder'}
          </button>

          {showConfirmDelete ? (
            <div className="flex gap-1">
              <button
                onClick={() => {
                  onDelete(guest.id);
                  setShowConfirmDelete(false);
                }}
                className="rounded-xl bg-red-500/20 px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="rounded-xl bg-white/5 px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="rounded-xl bg-white/5 p-2.5 text-gray-500 transition-all hover:bg-red-500/10 hover:text-red-400"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
