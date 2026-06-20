import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export function waitForAuth() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}
