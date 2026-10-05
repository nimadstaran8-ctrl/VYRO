import { useSyncExternalStore } from 'react';
import {
  subscribeToUserSession,
  getUserSession,
  type UserSession,
} from '../services/userAuth';

const subscribe = (listener: () => void) => subscribeToUserSession(listener);

/** Reactive current customer session (null when signed out). */
export function useUserSession(): UserSession | null {
  return useSyncExternalStore(subscribe, getUserSession);
}
