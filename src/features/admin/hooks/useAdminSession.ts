import { useSyncExternalStore } from 'react';
import {
  subscribeToAdminSession,
  getAdminSession,
  type AdminSession,
} from '../services/adminAuth';

const subscribe = (listener: () => void) => subscribeToAdminSession(listener);

/** Reactive current admin session (null when signed out of the panel). */
export function useAdminSession(): AdminSession | null {
  return useSyncExternalStore(subscribe, getAdminSession);
}
