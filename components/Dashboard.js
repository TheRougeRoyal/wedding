'use client';

import { useState, useMemo } from 'react';
import GuestCard from './GuestCard';

export default function Dashboard({ guests, onDelete, onToggleReminder }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('arrival');

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    return {
      total: guests.length,
      arrivingToday: guests.filter((g) => {
        const arrival = new Date(g.arrival);
        return arrival >= today && arrival < tomorrow;
      }).length,
      byTrain: guests.filter((g) => g.type === 'train').length,
      byFlight: guests.filter((g) => g.type === 'flight').length,
      remindersActive: guests.filter((g) => g.reminderSet && !g.reminderSent).length,
      arrived: guests.filter((g) => new Date(g.arrival) <= now).length,
    };
  }, [guests]);

  const filteredGuests = useMemo(() => {
    let result = [...guests];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.pnr.toLowerCase().includes(query)
      );
    }

    if (filterType !== 'all') {
      result = result.filter((g) => g.type === filterType);
    }

    result.sort((a, b) => {
      if (sortBy === 'arrival') return new Date(a.arrival) - new Date(b.arrival);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

    return result;
  }, [guests, searchQuery, filterType, sortBy]);

  const statCards = [
    { label: 'Total Guests', value: stats.total, icon: '👥', color: 'from-rose-500/20 to-pink-500/20 border-rose-500/20', textColor: 'text-rose-300' },
    { label: 'Arriving Today', value: stats.arrivingToday, icon: '📅', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20', textColor: 'text-emerald-300' },
    { label: 'By Train', value: stats.byTrain, icon: '🚂', color: 'from-amber-500/20 to-orange-500/20 border-amber-500/20', textColor: 'text-amber-300' },
    { label: 'By Flight', value: stats.byFlight, icon: '✈️', color: 'from-sky-500/20 to-blue-500/20 border-sky-500/20', textColor: 'text-sky-300' },
    { label: 'Reminders', value: stats.remindersActive, icon: '🔔', color: 'from-violet-500/20 to-purple-500/20 border-violet-500/20', textColor: 'text-violet-300' },
    { label: 'Arrived', value: stats.arrived, icon: '✅', color: 'from-teal-500/20 to-cyan-500/20 border-teal-500/20', textColor: 'text-teal-300' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border bg-gradient-to-br ${stat.color} p-4 backdrop-blur-xl transition-all duration-300 hover:scale-105`}
          >
            <div className="text-2xl">{stat.icon}</div>
            <div className={`mt-2 text-2xl font-bold ${stat.textColor}`}>{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search guests or PNR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-rose-400/50 focus:ring-2 focus:ring-rose-400/20"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'train', 'flight'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                filterType === type
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-white/5 text-gray-500 hover:text-gray-300'
              }`}
            >
              {type === 'all' ? 'All' : type === 'train' ? '🚂 Train' : '✈️ Flight'}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs text-gray-300 outline-none [color-scheme:dark]"
        >
          <option value="arrival" className="bg-gray-900">Sort: Arrival</option>
          <option value="name" className="bg-gray-900">Sort: Name</option>
          <option value="newest" className="bg-gray-900">Sort: Newest</option>
        </select>
      </div>

      {/* Guest Grid */}
      {filteredGuests.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredGuests.map((guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              onDelete={onDelete}
              onToggleReminder={onToggleReminder}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] py-20">
          <div className="text-6xl">💒</div>
          <h3 className="mt-4 text-lg font-medium text-gray-300">
            {guests.length === 0 ? 'No guests yet' : 'No matching guests'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {guests.length === 0
              ? 'Add your first wedding guest to get started'
              : 'Try a different search or filter'}
          </p>
        </div>
      )}
    </div>
  );
}
