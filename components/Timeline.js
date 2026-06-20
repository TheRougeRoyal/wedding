'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, TrainFront, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Timeline({ guests }) {
  const arrivals = guests
    .filter((g) => {
      if (g.travelMode === 'flight') return g.arrivalTime;
      return g.lastUpdated;
    })
    .map((g) => {
      const isFlight = g.travelMode === 'flight';
      let time;
      if (isFlight && g.arrivalTime) {
        time = new Date(g.arrivalTime);
      } else if (g.lastUpdated) {
        time = new Date(g.lastUpdated);
      } else {
        time = new Date(g.createdAt);
      }
      return { ...g, _time: time, _isFlight: isFlight };
    })
    .sort((a, b) => a._time - b._time);

  if (arrivals.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm sm:text-base">Arrival Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {/* Vertical line */}
          <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />

          {arrivals.map((g, i) => {
            const isDelayed = g.delayMinutes > 0;
            return (
              <div key={g.id} className="relative flex items-start gap-3 py-2.5">
                {/* Dot */}
                <div
                  className={cn(
                    'relative z-10 mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full border-2',
                    isDelayed
                      ? 'border-destructive bg-destructive/30'
                      : g.status === 'landed' || g.status === 'ARRIVED'
                        ? 'border-emerald-500 bg-emerald-500/30'
                        : 'border-primary bg-primary/30'
                  )}
                />
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {g._isFlight ? (
                      <Plane className="h-3 w-3 shrink-0 text-blue-400" />
                    ) : (
                      <TrainFront className="h-3 w-3 shrink-0 text-amber-400" />
                    )}
                    <span className="truncate text-xs font-medium">{g.name}</span>
                    {isDelayed && (
                      <Clock className="h-3 w-3 shrink-0 text-destructive" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground sm:text-xs">
                    {g._time.toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {isDelayed && ` · ${g.delayMinutes}m late`}
                  </p>
                  {(g.origin || g.destination) && (
                    <p className="text-[10px] text-muted-foreground sm:text-xs">
                      {g.origin || '?'} → {g.destination || '?'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
