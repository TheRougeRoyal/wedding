'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GuestForm from '@/components/GuestForm';
import { addGuest } from '@/lib/localStorage';

export default function AddGuestPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const handleAddGuest = (guestData) => {
    const newGuest = addGuest(guestData);

    if (newGuest) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8 animate-fade-in">
        <Link
          href="/"
          className="group mb-6 inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-gray-400 transition-all hover:bg-white/10 hover:text-white"
        >
          <svg
            className="h-4 w-4 transition-transform group-hover:-translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 text-2xl">
            ✨
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-white">
              Add New{' '}
              <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                Guest
              </span>
            </h1>
            <p className="mt-0.5 text-sm text-gray-400">
              Enter travel details and PNR to track their journey
            </p>
          </div>
        </div>

        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
      </header>

      {/* Success overlay */}
      {success ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 py-20 animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">
            🎉
          </div>
          <h2 className="mt-4 text-xl font-semibold text-emerald-300">
            Guest Added Successfully!
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Redirecting to dashboard...
          </p>
          <div className="mt-4 h-1 w-32 overflow-hidden rounded-full bg-white/10">
            <div className="h-full animate-[shimmer_1.5s_ease-in-out] rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" 
              style={{ animation: 'fillBar 1.5s ease-out forwards' }}
            />
          </div>
        </div>
      ) : (
        /* Form Card */
        <div className="animate-slide-up rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl sm:p-8">
          {/* Mock PNR hint */}
          <div className="mb-6 rounded-xl border border-rose-500/10 bg-rose-500/5 px-4 py-3">
            <p className="text-xs text-rose-300/80">
              <span className="font-semibold">💡 Tip:</span> Try these mock PNRs
              for auto-fill — Trains:{' '}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-amber-300">
                PNR001
              </code>{' '}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-amber-300">
                PNR002
              </code>{' '}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-amber-300">
                PNR003
              </code>{' '}
              | Flights:{' '}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-sky-300">
                FLT001
              </code>{' '}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-sky-300">
                FLT002
              </code>{' '}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-sky-300">
                FLT003
              </code>
            </p>
          </div>

          <GuestForm onAddGuest={handleAddGuest} onCancel={handleCancel} />
        </div>
      )}
    </main>
  );
}
