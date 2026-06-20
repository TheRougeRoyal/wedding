'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import GuestCard from './GuestCard';
import RoomMap from './RoomMap';
import Timeline from './Timeline';
import { Search, RefreshCw, Users, BedDouble, Clock, Download } from 'lucide-react';
import { TOTAL_ROOMS } from '@/lib/rooms';

export default function Dashboard({ guests, onDelete, onRefreshGuest }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterMode, setFilterMode] = useState('all');
  const [showRooms, setShowRooms] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  const totalPeople = guests.reduce((sum, g) => sum + (g.peopleCount || 1), 0);
  const usedRooms = new Set();
  for (const g of guests) {
    if (g.rooms) g.rooms.forEach((r) => usedRooms.add(r));
  }

  const stats = [
    { label: 'Guests', value: guests.length, icon: Users, color: 'text-foreground' },
    { label: 'People', value: totalPeople, icon: Users, color: 'text-foreground' },
    { label: 'Rooms', value: `${usedRooms.size}/${TOTAL_ROOMS}`, icon: BedDouble, color: 'text-primary' },
    { label: 'Delayed', value: guests.filter(g => g.delayMinutes > 0).length, icon: Clock, color: 'text-destructive' },
  ];

  const filteredGuests = guests
    .filter((g) => {
      if (filterMode === 'trains' && g.travelMode === 'flight') return false;
      if (filterMode === 'flights' && g.travelMode !== 'flight') return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.trainNumber?.includes(q) ||
        g.trainName?.toLowerCase().includes(q) ||
        g.flightNumber?.toLowerCase().includes(q) ||
        g.airline?.toLowerCase().includes(q) ||
        g.origin?.toLowerCase().includes(q) ||
        g.destination?.toLowerCase().includes(q) ||
        g.originName?.toLowerCase().includes(q) ||
        g.destinationName?.toLowerCase().includes(q) ||
        (g.rooms && g.rooms.some(r => String(r).includes(q)))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'number') return (a.trainNumber || a.flightNumber || '').localeCompare(b.trainNumber || b.flightNumber || '');
      if (sortBy === 'room') {
        const ra = a.rooms?.[0] || 999;
        const rb = b.rooms?.[0] || 999;
        return ra - rb;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const handleExport = () => {
    const headers = ['Name', 'Travel', 'Number', 'Origin', 'Destination', 'Status', 'Delay', 'Rooms', 'People', 'Journey Date'];
    const rows = filteredGuests.map((g) => [
      g.name,
      g.travelMode === 'flight' ? 'Flight' : 'Train',
      g.flightNumber || g.trainNumber || '',
      g.originName || g.origin || '',
      g.destinationName || g.destination || '',
      g.status || '',
      g.delayMinutes || 0,
      g.rooms?.join(', ') || '',
      g.peopleCount || 1,
      g.journeyDate || '',
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wedding-guests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="py-2 sm:py-3">
            <CardContent className="flex items-center gap-2 p-2 sm:gap-3 sm:p-3">
              <s.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${s.color}`} />
              <div>
                <p className="text-base font-bold leading-none sm:text-xl">{s.value}</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRooms(!showRooms)}
          className="flex-1"
        >
          <BedDouble className="mr-1.5 h-4 w-4" />
          {showRooms ? 'Hide' : 'Rooms'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTimeline(!showTimeline)}
          className="flex-1"
        >
          <Clock className="mr-1.5 h-4 w-4" />
          {showTimeline ? 'Hide' : 'Timeline'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="flex-1"
        >
          <Download className="mr-1.5 h-4 w-4" />
          Export
        </Button>
      </div>

      {showRooms && <RoomMap guests={guests} />}
      {showTimeline && <Timeline guests={guests} />}

      {/* Search & Filters */}
      <div className="space-y-3 sm:flex sm:items-center sm:gap-3 sm:space-y-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search guests, number, route, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-9 sm:h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-1 rounded-md border p-0.5 sm:flex-initial">
            {[
              { value: 'all', label: 'All' },
              { value: 'trains', label: 'Trains' },
              { value: 'flights', label: 'Flights' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterMode(f.value)}
                className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors sm:flex-initial sm:py-1 ${
                  filterMode === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              for (const g of filteredGuests) {
                onRefreshGuest(g.id);
              }
            }}
            className="h-9 shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="ml-1.5 hidden sm:inline">Refresh</span>
          </Button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 shrink-0 rounded-md border border-input bg-transparent px-2 text-xs"
          >
            <option value="newest">Newest</option>
            <option value="name">Name</option>
            <option value="number">Number</option>
            <option value="room">Room</option>
          </select>
        </div>
      </div>

      {/* Guest Grid */}
      {filteredGuests.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredGuests.map((guest) => (
            <GuestCard
              key={guest.id}
              guest={guest}
              onDelete={onDelete}
              onRefresh={onRefreshGuest}
            />
          ))}
        </div>
      ) : (
        <Card className="py-12 sm:py-20">
          <CardContent className="flex flex-col items-center text-center px-4">
            <Users className="h-10 w-10 text-muted-foreground/30 sm:h-12 sm:w-12 mb-3 sm:mb-4" />
            <p className="text-base font-medium text-muted-foreground sm:text-lg">
              {guests.length === 0 ? 'No guests yet' : 'No matching guests'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60 sm:text-sm">
              {guests.length === 0
                ? 'Add your first wedding guest to get started'
                : 'Try a different search or filter'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
