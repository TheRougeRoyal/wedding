'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TOTAL_ROOMS, BASE_ROOMS, CAPACITY_PER_ROOM } from '@/lib/rooms';

export default function RoomMap({ guests }) {
  const occupied = {};
  for (const g of guests) {
    if (g.rooms) {
      for (const r of g.rooms) {
        occupied[r] = g;
      }
    }
  }

  const groundRooms = [];
  const firstRooms = [];

  for (let i = 1; i <= TOTAL_ROOMS; i++) {
    const isExtra = i > BASE_ROOMS;
    const guest = occupied[i] || null;
    const room = { number: i, isExtra, guest, occupied: !!guest };

    if (i <= 12) {
      groundRooms.push(room);
    } else {
      firstRooms.push(room);
    }
  }

  const usedCount = Object.keys(occupied).length;
  const usedBeds = Object.values(occupied).reduce((sum, g) => sum + (g.peopleCount || 1), 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base">Room Layout</CardTitle>
          <p className="text-xs text-muted-foreground">
            {usedCount}/{TOTAL_ROOMS} rooms · {usedBeds}/{TOTAL_ROOMS * CAPACITY_PER_ROOM} beds
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ground Floor */}
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
            Ground Floor
          </p>
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 sm:gap-2">
            {groundRooms.map((room) => (
              <RoomTile key={room.number} room={room} />
            ))}
          </div>
        </div>

        {/* First Floor */}
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
            First Floor
          </p>
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 sm:gap-2">
            {firstRooms.map((room) => (
              <RoomTile key={room.number} room={room} />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 border-t pt-3 text-[10px] text-muted-foreground sm:text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-primary/10 border border-primary/30" />
            <span>Assigned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-destructive/10 border border-destructive/30" />
            <span>Full</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm border border-dashed border-muted-foreground/30" />
            <span>Empty</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm border border-dashed border-amber-500/30" />
            <span>Extra</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RoomTile({ room }) {
  const { number, isExtra, guest, occupied } = room;

  const isFull = guest && (guest.peopleCount || 1) >= CAPACITY_PER_ROOM;
  const isEmpty = !guest;

  let bg = 'border-dashed border-muted-foreground/20 bg-transparent';
  if (occupied && isFull) bg = 'bg-destructive/10 border-destructive/30';
  else if (occupied) bg = 'bg-primary/10 border-primary/30';

  const extraBorder = isExtra && !occupied ? 'border-dashed border-amber-500/30' : '';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-md border p-1.5 transition-colors sm:p-2',
        bg,
        extraBorder,
        'min-h-[40px] sm:min-h-[48px]'
      )}
      title={guest ? `${guest.name} (${guest.peopleCount} people)` : `Room ${number}`}
    >
      <span className="text-[10px] font-bold sm:text-xs">{number}</span>
      {occupied && (
        <span className="max-w-full truncate text-[8px] text-muted-foreground sm:text-[9px]">
          {guest.name.split(' ')[0]}
        </span>
      )}
      {occupied && (
        <span className="text-[7px] text-muted-foreground/60 sm:text-[8px]">
          {guest.peopleCount || 1}/{CAPACITY_PER_ROOM}
        </span>
      )}
    </div>
  );
}
