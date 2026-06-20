import { db, auth } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';

const GUESTS = 'guests';
const EVENT_CODE = 'wedding-2026';

export async function ensureAuth() {
  try {
    if (!auth.currentUser) {
      const { signInAnonymously } = await import('firebase/auth');
      await signInAnonymously(auth);
    }
    return auth.currentUser?.uid || null;
  } catch (e) {
    console.warn('Auth failed (enable Anonymous Auth in Firebase Console):', e.message);
    return null;
  }
}

export function addGuest(data) {
  return addDoc(collection(db, GUESTS), {
    ...data,
    eventId: EVENT_CODE,
    createdAt: Timestamp.now(),
  }).then((ref) => ({ id: ref.id, ...data }));
}

export function getAllGuests() {
  return getDocs(
    query(collection(db, GUESTS), where('eventId', '==', EVENT_CODE))
  ).then((snap) =>
    snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() || new Date(),
    }))
  );
}

export function subscribeToGuests(cb) {
  return onSnapshot(
    query(collection(db, GUESTS), where('eventId', '==', EVENT_CODE)),
    (snap) => {
      const guests = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date(),
      }));
      cb(guests);
    },
    (err) => {
      console.error('Firestore listener error:', err);
      cb([]);
    }
  );
}

export function updateGuest(id, updates) {
  return updateDoc(doc(db, GUESTS, id), {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export function deleteGuest(id) {
  return deleteDoc(doc(db, GUESTS, id));
}
