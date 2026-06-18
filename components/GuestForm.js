'use client';

import { useState } from 'react';

export default function GuestForm({ onAddGuest, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'train',
    pnr: '',
    arrival: '',
    departure: '',
    reminderHoursBefore: 2,
  });
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lookupResult, setLookupResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleTypeToggle = (type) => {
    setFormData((prev) => ({ ...prev, type }));
    setLookupResult(null);
  };

  const handlePNRLookup = async () => {
    if (!formData.pnr.trim()) {
      setError('Please enter a PNR number');
      return;
    }

    setIsLookingUp(true);
    setError('');
    setLookupResult(null);

    try {
      const res = await fetch(
        `/api/pnr/lookup?pnr=${encodeURIComponent(formData.pnr)}&type=${formData.type}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'PNR lookup failed');
      }

      setLookupResult(data);

      // Auto-fill arrival and departure
      if (data.data) {
        const arrivalLocal = new Date(data.data.arrival).toISOString().slice(0, 16);
        const departureLocal = new Date(data.data.departure).toISOString().slice(0, 16);
        setFormData((prev) => ({
          ...prev,
          arrival: arrivalLocal,
          departure: departureLocal,
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to lookup PNR');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Please enter the guest name');
      return;
    }
    if (!formData.pnr.trim()) {
      setError('Please enter the PNR number');
      return;
    }
    if (!formData.arrival) {
      setError('Please set arrival time');
      return;
    }
    if (!formData.departure) {
      setError('Please set departure time');
      return;
    }
    if (new Date(formData.departure) <= new Date(formData.arrival)) {
      setError('Departure must be after arrival');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const guest = {
        ...formData,
        pnr: formData.pnr.toUpperCase(),
        arrival: new Date(formData.arrival).toISOString(),
        departure: new Date(formData.departure).toISOString(),
        reminderHoursBefore: Number(formData.reminderHoursBefore),
      };

      onAddGuest(guest);
    } catch (err) {
      setError(err.message || 'Failed to add guest');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTrain = formData.type === 'train';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Toggle */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Travel Type</label>
          <div className="flex gap-2 rounded-xl bg-white/[0.03] p-1.5">
            <button
              type="button"
              onClick={() => handleTypeToggle('train')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all duration-300 ${
                isTrain
                  ? 'bg-amber-500/20 text-amber-300 shadow-lg shadow-amber-500/10'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              🚂 Train
            </button>
            <button
              type="button"
              onClick={() => handleTypeToggle('flight')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all duration-300 ${
                !isTrain
                  ? 'bg-sky-500/20 text-sky-300 shadow-lg shadow-sky-500/10'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              ✈️ Flight
            </button>
          </div>
        </div>

        {/* Guest Name */}
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-300">
            Guest Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter guest name"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-rose-400/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-rose-400/20"
          />
        </div>

        {/* PNR with Lookup */}
        <div>
          <label htmlFor="pnr" className="mb-2 block text-sm font-medium text-gray-300">
            PNR Number
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="pnr"
              name="pnr"
              value={formData.pnr}
              onChange={handleChange}
              placeholder={isTrain ? 'e.g. PNR001' : 'e.g. FLT001'}
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white uppercase placeholder-gray-500 outline-none transition-all focus:border-rose-400/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-rose-400/20"
            />
            <button
              type="button"
              onClick={handlePNRLookup}
              disabled={isLookingUp}
              className={`rounded-xl px-5 py-3 text-sm font-medium transition-all duration-300 ${
                isTrain
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 disabled:opacity-50'
                  : 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 disabled:opacity-50'
              }`}
            >
              {isLookingUp ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Looking up...
                </span>
              ) : (
                '🔍 Lookup'
              )}
            </button>
          </div>
          {/* Lookup Result */}
          {lookupResult?.data && (
            <div className={`mt-3 rounded-xl border p-3 text-sm ${
              isTrain
                ? 'border-amber-500/20 bg-amber-500/5 text-amber-200'
                : 'border-sky-500/20 bg-sky-500/5 text-sky-200'
            }`}>
              <p className="font-medium">
                {lookupResult.data.trainName || lookupResult.data.airline} • {lookupResult.data.trainNumber || lookupResult.data.flightNumber}
              </p>
              <p className="mt-1 text-xs opacity-70">
                {lookupResult.data.from} → {lookupResult.data.to} • Status: {lookupResult.data.status}
              </p>
              {lookupResult.isMock && (
                <p className="mt-1 text-xs opacity-50">📋 Mock data — times auto-filled below</p>
              )}
            </div>
          )}
        </div>

        {/* Arrival / Departure */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="arrival" className="mb-2 block text-sm font-medium text-gray-300">
              Arrival Time
            </label>
            <input
              type="datetime-local"
              id="arrival"
              name="arrival"
              value={formData.arrival}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition-all focus:border-rose-400/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-rose-400/20 [color-scheme:dark]"
            />
          </div>
          <div>
            <label htmlFor="departure" className="mb-2 block text-sm font-medium text-gray-300">
              Departure Time
            </label>
            <input
              type="datetime-local"
              id="departure"
              name="departure"
              value={formData.departure}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition-all focus:border-rose-400/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-rose-400/20 [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Reminder Hours */}
        <div>
          <label htmlFor="reminderHoursBefore" className="mb-2 block text-sm font-medium text-gray-300">
            Remind me (hours before arrival)
          </label>
          <select
            id="reminderHoursBefore"
            name="reminderHoursBefore"
            value={formData.reminderHoursBefore}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition-all focus:border-rose-400/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-rose-400/20 [color-scheme:dark]"
          >
            <option value="0.5" className="bg-gray-900">30 minutes</option>
            <option value="1" className="bg-gray-900">1 hour</option>
            <option value="2" className="bg-gray-900">2 hours</option>
            <option value="3" className="bg-gray-900">3 hours</option>
            <option value="6" className="bg-gray-900">6 hours</option>
            <option value="12" className="bg-gray-900">12 hours</option>
            <option value="24" className="bg-gray-900">1 day</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/30 hover:brightness-110 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding Guest...' : '💒 Add Guest'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-medium text-gray-400 transition-all hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
