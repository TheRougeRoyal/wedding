'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Dialog from '@/components/Dialog';
import { useToast } from '@/components/Toast';
import { RefreshCw, Trash2, Plane, TrainFront, Clock, MapPin, BedDouble } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  active: { label: 'En Route', variant: 'default' },
  'IN_TRANSIT': { label: 'In Transit', variant: 'default' },
  'en-route': { label: 'En Route', variant: 'default' },
  landed: { label: 'Arrived', variant: 'secondary' },
  'ARRIVED': { label: 'Arrived', variant: 'secondary' },
  scheduled: { label: 'Scheduled', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  delayed: { label: 'Delayed', variant: 'destructive' },
  'NOT_STARTED': { label: 'Not Started', variant: 'outline' },
};

export default function GuestCard({ guest, onDelete, onRefresh }) {
  const [showDelete, setShowDelete] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toast = useToast();

  const isFlight = guest.travelMode === 'flight';
  const status = statusConfig[guest.status] || { label: guest.status || 'Unknown', variant: 'outline' };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh(guest.id);
      toast('Status refreshed', 'success');
    } catch {
      toast('Refresh failed', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(guest.id);
      toast(`${guest.name} removed`, 'success');
    } catch {
      toast('Delete failed', 'error');
    }
    setShowDelete(false);
  };

  const statusVariant = guest.delayMinutes > 0 ? 'destructive' : status.variant;

  return (
    <>
      <Card className="group relative overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg sm:h-10 sm:w-10',
                isFlight ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
              )}>
                {isFlight ? <Plane className="h-4 w-4 sm:h-5 sm:w-5" /> : <TrainFront className="h-4 w-4 sm:h-5 sm:w-5" />}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold leading-none truncate">{guest.name}</h3>
                <p className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">
                  {isFlight
                    ? `${guest.airline || 'Airline'} · ${guest.flightNumber}`
                    : `${guest.trainName || 'Train'} · ${guest.trainNumber}`
                  }
                </p>
              </div>
            </div>
            <Badge variant={statusVariant} className="shrink-0 text-[10px] sm:text-xs">
              {guest.delayMinutes > 0 && <Clock className="mr-1 h-3 w-3" />}
              {guest.delayMinutes > 0 ? `${guest.delayMinutes}m late` : status.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
          <div className="space-y-1.5 text-xs sm:text-sm">
            <div className="flex items-center text-muted-foreground">
              <MapPin className="mr-2 h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
              <span className="truncate">
                {isFlight
                  ? `${guest.originName || guest.origin} → ${guest.destinationName || guest.destination}`
                  : `${guest.origin} → ${guest.destination}`
                }
              </span>
            </div>

            {isFlight ? (
              <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground sm:text-xs">
                {guest.departureTime && (
                  <div>
                    <span className="text-foreground font-medium">Departs</span>
                    <br />
                    {new Date(guest.departureTime).toLocaleString('en-IN', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                    {guest.departureTerminal && ` · T${guest.departureTerminal}`}
                  </div>
                )}
                {guest.arrivalTime && (
                  <div>
                    <span className="text-foreground font-medium">Arrives</span>
                    <br />
                    {new Date(guest.arrivalTime).toLocaleString('en-IN', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                    {guest.arrivalTerminal && ` · T${guest.arrivalTerminal}`}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-0.5 text-[11px] text-muted-foreground sm:space-y-1 sm:text-xs">
                {guest.currentStation && (
                  <p>Current: <span className="text-foreground">{guest.currentStation}</span></p>
                )}
                {guest.nextStop && (
                  <p>Next: <span className="text-foreground">{guest.nextStop}</span> {guest.nextStopTime}</p>
                )}
              </div>
            )}

            {guest.journeyDate && (
              <p className="text-xs text-muted-foreground">
                {new Date(guest.journeyDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </p>
            )}

            {guest.rooms && guest.rooms.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <BedDouble className="h-3 w-3 shrink-0 text-primary sm:h-3.5 sm:w-3.5" />
                <span className="text-[11px] font-medium text-primary sm:text-xs">
                  Room {guest.rooms.length === 1
                    ? guest.rooms[0]
                    : `${guest.rooms[0]}–${guest.rooms[guest.rooms.length - 1]}`
                  }
                </span>
                <span className="text-[9px] text-muted-foreground sm:text-[10px]">
                  ({guest.peopleCount || 1} {guest.peopleCount === 1 ? 'person' : 'people'})
                </span>
              </div>
            )}
            {guest.roomError && (
              <p className="text-[10px] text-destructive">No rooms available</p>
            )}
          </div>

          <div className="mt-3 flex items-center gap-1.5 border-t pt-2.5 sm:mt-4 sm:gap-2 sm:pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-7 px-2 sm:h-8"
            >
              <RefreshCw className={cn('h-3 w-3 sm:h-3.5 sm:w-3.5', isRefreshing && 'animate-spin')} />
              <span className="ml-1 text-[10px] sm:text-xs">{isRefreshing ? 'Refreshing' : 'Refresh'}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-7 w-7 text-muted-foreground hover:text-destructive sm:h-8 sm:w-8"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onClose={() => setShowDelete(false)} title="Delete Guest">
        <p className="text-sm text-muted-foreground mb-4">
          Remove <span className="font-medium text-foreground">{guest.name}</span> from the guest list?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Dialog>
    </>
  );
}
