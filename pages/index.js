import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load guests from localStorage on initial load
  useEffect(() => {
    const loadGuests = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('weddingGuests');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setGuests(parsed);
          } catch (err) {
            console.error('Failed to parse guests from localStorage:', err);
            setGuests([]);
          }
        }
      }
    };

    loadGuests();
  }, []);

  // Save guests to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('weddingGuests', JSON.stringify(guests));
    }
  }, [guests]);

  // Handle adding a new guest
  const handleAddGuest = (newGuest) => {
    setGuests((prev) => [...prev, newGuest]);
  };

  // Handle deleting a guest
  const handleDeleteGuest = (id) => {
    setGuests((prev) => prev.filter((guest) => guest.id !== id));
  };

  // Handle toggling reminder
  const handleToggleReminder = (id) => {
    setGuests((prev) =>
      prev.map((guest) =>
        guest.id === id
          ? {
              ...guest,
              reminderSet: !guest.reminderSet,
              reminderSent: false, // Reset sent status when toggling
            }
          : guest
      )
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
            Wedding Guest Tracker
          </h1>
          <p className="text-lg text-gray-300 max-w-xl mx-auto">
            Track your wedding guests' travel details, PNR status, and set arrival reminders
          </p>
          <div className="mt-6">
            <a
              href="/add"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Guest
            </a>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="flex items-center justify-center mb-4">
              <div className="h-8 w-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400">Loading guests...</p>
          </div>
        ) : (
          <Dashboard
            guests={guests}
            onDelete={handleDeleteGuest}
            onToggleReminder={handleToggleReminder}
          />
        )}
      </div>
    </main>
  );
}