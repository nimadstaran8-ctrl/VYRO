/**
 * Frontend-only admin authentication prototype.
 *
 * ⚠️ NOT PRODUCTION-SECURE: this only gates the admin UI in the browser.
 * There is no backend, no real credential verification, and any user can
 * clear session state or call the store functions directly. A real
 * deployment must replace this with server-side authentication
 * (e.g. signed session tokens / OAuth) and enforce authorization on the API.
 *
 * The demo credentials below exist so the prototype is usable; they are not
 * real credentials and grant nothing beyond this browser session.
 */

import { logActivity } from '../../../services/logs/logService';

const SESSION_KEY = 'vyro_admin_session';

export const DEMO_ADMIN_CREDENTIALS = {
  username: 'nima1389',
  password: '898989',
} as const;

export interface AdminSession {
  username: string;
  loginTime: string;
}

function readSession(): AdminSession | null {
  // Snapshot identity must stay stable for useSyncExternalStore consumers,
  // so the parsed session is cached and rebuilt only when the raw value changes.
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw === cachedRaw) return cachedSession;
    if (!raw) {
      cachedRaw = null;
      cachedSession = null;
      return null;
    }
    const parsed = JSON.parse(raw) as AdminSession;
    cachedSession = parsed.username ? parsed : null;
    cachedRaw = raw;
    return cachedSession;
  } catch {
    cachedRaw = null;
    cachedSession = null;
    return null;
  }
}

let cachedRaw: string | null = null;
let cachedSession: AdminSession | null = null;

function writeSession(session: AdminSession | null): void {
  try {
    // localStorage (not sessionStorage) so the owner stays signed in across
    // browser restarts — this is what keeps the admin entry button theirs.
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Storage unavailable (private mode etc.) — session simply won't persist.
  }
  cachedRaw = null;
  cachedSession = null;
}

const listeners = new Set<(session: AdminSession | null) => void>();

function notify(): void {
  const session = readSession();
  listeners.forEach((listener) => listener(session));
}

export function getAdminSession(): AdminSession | null {
  return readSession();
}

export function isAdminAuthenticated(): boolean {
  return readSession() !== null;
}

export function loginAdmin(username: string, password: string): { success: boolean; error?: string } {
  if (username.trim() !== DEMO_ADMIN_CREDENTIALS.username || password !== DEMO_ADMIN_CREDENTIALS.password) {
    return { success: false, error: 'invalid-credentials' };
  }

  writeSession({
    username: username.trim(),
    loginTime: new Date().toISOString(),
  });
  logActivity({ type: 'admin-login', detail: { actor: username.trim() } });
  notify();
  return { success: true };
}

export function logoutAdmin(): void {
  const actor = readSession()?.username;
  writeSession(null);
  if (actor) {
    logActivity({ type: 'admin-logout', detail: { actor } });
  }
  notify();
}

export function subscribeToAdminSession(listener: (session: AdminSession | null) => void): () => void {
  listeners.add(listener);
  listener(readSession());
  return () => {
    listeners.delete(listener);
  };
}
