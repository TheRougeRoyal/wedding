export const TOTAL_ROOMS = 23;
export const BASE_ROOMS = 18;
export const EXTRA_ROOMS = 5;
export const CAPACITY_PER_ROOM = 2;

export function getTotalCapacity(guests) {
  const assignedRooms = new Set();
  for (const g of guests) {
    if (g.rooms) g.rooms.forEach((r) => assignedRooms.add(r));
  }
  return TOTAL_ROOMS * CAPACITY_PER_ROOM;
}

export function getOccupancy(guests) {
  let beds = 0;
  for (const g of guests) {
    beds += g.peopleCount || 0;
  }
  return beds;
}

export function getRoomOccupancy(guests) {
  const occupied = new Set();
  for (const g of guests) {
    if (g.rooms) g.rooms.forEach((r) => occupied.add(r));
  }
  return occupied;
}

export function getAvailableRooms(guests) {
  const occupied = getRoomOccupancy(guests);
  const available = [];
  for (let i = 1; i <= TOTAL_ROOMS; i++) {
    if (!occupied.has(i)) available.push(i);
  }
  return available;
}

export function findBestRooms(guests, peopleCount) {
  const occupied = getRoomOccupancy(guests);
  const roomsNeeded = Math.ceil(peopleCount / CAPACITY_PER_ROOM);

  if (roomsNeeded > TOTAL_ROOMS) return null;

  let bestStart = -1;
  let bestGap = Infinity;

  for (let start = 1; start <= TOTAL_ROOMS - roomsNeeded + 1; start++) {
    let fits = true;
    let gap = 0;

    for (let r = start; r < start + roomsNeeded; r++) {
      if (occupied.has(r)) {
        fits = false;
        break;
      }
    }

    if (fits) {
      for (let r = start; r < start + roomsNeeded; r++) {
        if (occupied.has(r - 1) || occupied.has(r + 1)) gap++;
      }
      if (gap < bestGap) {
        bestGap = gap;
        bestStart = start;
      }
    }
  }

  if (bestStart === -1) return null;

  const rooms = [];
  for (let r = bestStart; r < bestStart + roomsNeeded; r++) {
    rooms.push(r);
  }
  return rooms;
}

export function assignRoomToGuest(guest, guests) {
  const peopleCount = guest.peopleCount || 1;
  const rooms = findBestRooms(guests, peopleCount);

  if (!rooms) return { ...guest, rooms: [], roomError: true };

  return { ...guest, rooms, roomError: false };
}

export function getRoomStatus(rooms) {
  const floor = rooms[0] <= 12 ? 'Ground Floor' : 'First Floor';
  return { rooms, floor, count: rooms.length };
}

export function getRoomLayout(guests) {
  const layout = [];
  for (let i = 1; i <= TOTAL_ROOMS; i++) {
    const assignedTo = guests.find(
      (g) => g.rooms && g.rooms.includes(i)
    );
    layout.push({
      number: i,
      floor: i <= 12 ? 'ground' : 'first',
      occupied: !!assignedTo,
      guest: assignedTo || null,
      isExtra: i > BASE_ROOMS,
    });
  }
  return layout;
}
