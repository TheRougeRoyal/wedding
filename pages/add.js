import { useState } from 'react';
import GuestForm from '@/components/GuestForm';
import { useRouter } from 'next/router';

export default function AddGuest() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddGuest = (guestData) => {
    setLoading(true);
    setError('');

    // Send guest data to API for validation and ID generation
    fetch('/api/guests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(guestData),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => Promise.reject(err));
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && data.guest) {
          // Add guest to localStorage
          const existingGuests = JSON.parse(localStorage.getItem('weddingGuests') || '[]');
          const updatedGuests = [...existingGuests, data.guest];
          localStorage.setItem('weddingGuests', JSON.stringify(updatedGuests));

          // Redirect to dashboard
          router.push('/');
        } else {
          throw new Error(data.error || 'Failed to add guest');
        }
      })
      .catch((err) => {
        setError(err.message || 'An error occurred while adding the guest');
        setLoading(false);
      });
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
              Add Wedding Guest
            </h1>
            <a
              href="/"
              className="text-sm text-gray-400 hover:text-white"
            >
              ← Back to Dashboard
            </a>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10">
              ⚠️ {error}
            </div>
          )}

          <GuestForm
            onAddGuest={handleAddGuest}
            onCancel={handleCancel}
            className={`${loading ? 'opacity-80' : ''}`}
          />
        </div>
      </div>
    </main>
  );
}