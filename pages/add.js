import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import GuestForm from '@/components/GuestForm';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { addGuest as addGuestToFirestore, getAllGuests } from '@/lib/firestore-storage';
import { assignRoomToGuest } from '@/lib/rooms';
import { ArrowLeft } from 'lucide-react';

export default function AddGuest() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddGuest = async (guestData) => {
    setError('');
    setIsSubmitting(true);

    try {
      const existing = await getAllGuests();
      const withRoom = assignRoomToGuest(guestData, existing);
      await addGuestToFirestore(withRoom);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Failed to add guest');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-lg px-4 py-6 sm:px-4 sm:py-12">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <Logo className="h-5 w-5 sm:h-6 sm:w-6" />
            <h1 className="text-base font-bold tracking-tight sm:text-xl">Add Guest</h1>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
              <span className="sm:hidden">←</span>
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Guest</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <GuestForm
              onAddGuest={handleAddGuest}
              onCancel={() => router.push('/')}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
