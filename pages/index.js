import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Dashboard from '@/components/Dashboard';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { subscribeToGuests, deleteGuest, updateGuest } from '@/lib/firestore-storage';
import { assignRoomToGuest } from '@/lib/rooms';
import { Plus } from 'lucide-react';

export default function Home() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToGuests((g) => {
      setGuests(g);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleDeleteGuest = async (id) => {
    try {
      await deleteGuest(id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleRefreshGuest = useCallback(async (id) => {
    const guest = guests.find((g) => g.id === id);
    if (!guest) return;

    const isFlight = guest.travelMode === 'flight';
    const endpoint = isFlight ? '/api/flight/status' : '/api/train/status';
    const body = isFlight
      ? { flightNumber: guest.flightNumber }
      : { trainNumber: guest.trainNumber };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const updates = isFlight
          ? {
              airline: data.data.airline,
              status: data.data.status,
              delayMinutes: data.data.delayMinutes,
              departureTime: data.data.departureTime,
              arrivalTime: data.data.arrivalTime,
              departureTerminal: data.data.departureTerminal,
              departureGate: data.data.departureGate,
              arrivalTerminal: data.data.arrivalTerminal,
              arrivalGate: data.data.arrivalGate,
              lastUpdated: data.data.lastUpdated,
            }
          : {
              currentStation: data.data.currentStation,
              nextStop: data.data.nextStop,
              nextStopTime: data.data.nextStopTime,
              status: data.data.status,
              delayMinutes: data.data.delayMinutes,
              lastUpdated: data.data.lastUpdated,
            };
        await updateGuest(id, updates);
      }
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  }, [guests]);

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading guests...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between sm:mb-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <Logo className="h-7 w-7 sm:h-8 sm:w-8" />
            <div>
              <h1 className="text-lg font-bold tracking-tight sm:text-2xl">Wedding Guest Tracker</h1>
              <p className="text-xs text-muted-foreground sm:text-sm">Track train & flight arrivals</p>
            </div>
          </div>
          <Link href="/add">
            <Button size="sm" className="sm:h-9 sm:px-4">
              <Plus className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Add Guest</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        </div>

        <Dashboard
          guests={guests}
          onDelete={handleDeleteGuest}
          onRefreshGuest={handleRefreshGuest}
        />
      </div>
    </main>
  );
}
