/**
 * Frontend-only customer account system.
 *
 * ⚠️ NOT PRODUCTION-SECURE: accounts live in the browser's localStorage and
 * the auth check only gates the UI. A real deployment must move registration,
 * login and password reset to a server so credentials are never stored in
 * (or recoverable from) the client.
 *
 * Passwords are stored salted + hashed (SHA-256 via Web Crypto, with a
 * fallback hash for non-secure contexts) — never in plain text.
 */

import { logActivity } from '../../../services/logs/logService';

const USERS_STORAGE_KEY = 'vyro_users_repository';
const SESSION_KEY = 'vyro_user_session';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  /** "<algo>:<salt>:<hex>" — never the plain password. */
  passwordHash: string;
  createdAt: string;
}

interface UserStorageData {
  users: UserAccount[];
  version: number;
}

export interface UserSession {
  userId: string;
  username: string;
  loginTime: string;
}

function readUsers(): UserStorageData {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UserStorageData;
      return {
        version: parsed.version ?? 1,
        users: Array.isArray(parsed.users) ? parsed.users : [],
      };
    }
  } catch {
  }
  return { users: [], version: 1 };
}

function writeUsers(data: UserStorageData): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable (private mode, quota) — the caller surfaces the error.
  }
}

function persistUser(user: UserAccount): void {
  const data = readUsers();
  const index = data.users.findIndex((u) => u.id === user.id);
  if (index === -1) {
    data.users.push(user);
  } else {
    data.users[index] = user;
  }
  writeUsers(data);
}

function generateUserId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `USER-${timestamp}-${random}`.toUpperCase();
}

// ---------------------------------------------------------------------------
// Password hashing
// ---------------------------------------------------------------------------

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(text: string): Promise<string | null> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return toHex(digest);
    }
  } catch {
    // Insecure context (e.g. file://) — fall through to the fallback hash.
  }
  return null;
}

/** Deterministic fallback for contexts where Web Crypto is unavailable. */
function fallbackHash(text: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

function randomSalt(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const bytes = new Uint8Array(8);
      crypto.getRandomValues(bytes);
      return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
  }
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const sha = await sha256Hex(`${salt}:${password}`);
  if (sha) return `s256:${salt}:${sha}`;
  return `fb:${salt}:${fallbackHash(`${salt}:${password}`)}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, salt] = stored.split(':');
  if (!algo || !salt) return false;
  const candidate = await hashPassword(password, salt);
  // If the browser context changed since the hash was written (Web Crypto
  // availability), retry with the other algorithm before failing.
  if (candidate === stored) return true;
  const otherAlgo = algo === 's256' ? 'fb' : 's256';
  return `${otherAlgo}:${salt}:${otherAlgo === 'fb' ? fallbackHash(`${salt}:${password}`) : await sha256Hex(`${salt}:${password}`)}` === stored;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/** 3–32 chars: latin letters, digits, underscore or Persian letters. */
const USERNAME_PATTERN = /^[a-zA-Z0-9_\u0600-\u06FF]{3,32}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN_LENGTH = 6;

/** Validates a username; returns an error code or undefined when valid. */
export function validateUsername(username: string): AuthResult['error'] {
  if (!username.trim()) return 'username-required';
  if (!USERNAME_PATTERN.test(username.trim())) return 'username-invalid';
  return undefined;
}

/** Validates an email; returns an error code or undefined when valid. */
export function validateEmail(email: string): AuthResult['error'] {
  if (!email.trim()) return 'email-required';
  if (!EMAIL_PATTERN.test(email.trim())) return 'email-invalid';
  return undefined;
}

/** Validates a password; returns an error code or undefined when valid. */
export function validatePassword(password: string): AuthResult['error'] {
  if (!password) return 'password-required';
  if (password.length < PASSWORD_MIN_LENGTH) return 'password-short';
  return undefined;
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

// Snapshot identity must be stable for useSyncExternalStore consumers, so the
// parsed session is cached and only rebuilt when the raw value changes.
let cachedRaw: string | null = null;
let cachedSession: UserSession | null = null;

function readSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw === cachedRaw) return cachedSession;
    if (!raw) {
      cachedRaw = null;
      cachedSession = null;
      return null;
    }
    const parsed = JSON.parse(raw) as UserSession;
    cachedSession = parsed.userId && parsed.username ? parsed : null;
    cachedRaw = raw;
    return cachedSession;
  } catch {
    cachedRaw = null;
    cachedSession = null;
    return null;
  }
}

function writeSession(session: UserSession | null): void {
  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Storage unavailable — session simply won't persist.
  }
}

const listeners = new Set<(session: UserSession | null) => void>();

function notify(): void {
  const session = readSession();
  listeners.forEach((listener) => listener(session));
}

export function getUserSession(): UserSession | null {
  return readSession();
}

export function isUserAuthenticated(): boolean {
  return readSession() !== null;
}

export function subscribeToUserSession(listener: (session: UserSession | null) => void): () => void {
  listeners.add(listener);
  listener(readSession());
  return () => {
    listeners.delete(listener);
  };
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export interface AuthResult {
  success: boolean;
  error?:
    | 'username-required'
    | 'username-invalid'
    | 'username-taken'
    | 'email-required'
    | 'email-invalid'
    | 'email-taken'
    | 'password-required'
    | 'password-short'
    | 'password-mismatch'
    | 'invalid-credentials'
    | 'account-not-found'
    | 'storage-unavailable';
  username?: string;
}

export async function registerUser(input: {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}): Promise<AuthResult> {
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();

  const usernameError = validateUsername(username);
  if (usernameError) return { success: false, error: usernameError };
  const emailError = validateEmail(email);
  if (emailError) return { success: false, error: emailError };
  const passwordError = validatePassword(input.password);
  if (passwordError) return { success: false, error: passwordError };
  if (input.confirmPassword !== undefined && input.confirmPassword !== input.password) {
    return { success: false, error: 'password-mismatch' };
  }

  const data = readUsers();
  if (data.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, error: 'username-taken' };
  }
  if (data.users.some((u) => u.email.toLowerCase() === email)) {
    return { success: false, error: 'email-taken' };
  }

  const user: UserAccount = {
    id: generateUserId(),
    username,
    email,
    passwordHash: await hashPassword(input.password, randomSalt()),
    createdAt: new Date().toISOString(),
  };

  const before = readUsers().users.length;
  persistUser(user);
  if (readUsers().users.length === before) {
    return { success: false, error: 'storage-unavailable' };
  }

  logActivity({
    type: 'user-registered',
    entityId: user.id,
    detail: { name: user.username, actor: user.username },
  });

  return { success: true, username: user.username };
}

export async function loginUser(username: string, password: string): Promise<AuthResult> {
  const data = readUsers();
  const user = data.users.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase()
  );
  if (!user || !password) {
    return { success: false, error: 'invalid-credentials' };
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    return { success: false, error: 'invalid-credentials' };
  }

  writeSession({
    userId: user.id,
    username: user.username,
    loginTime: new Date().toISOString(),
  });
  logActivity({ type: 'user-login', detail: { actor: user.username } });
  notify();
  return { success: true, username: user.username };
}

export function logoutUser(): void {
  const session = readSession();
  writeSession(null);
  if (session) {
    logActivity({ type: 'user-logout', detail: { actor: session.username } });
  }
  notify();
}

/**
 * "I forgot my password" flow: the account is identified by username + the
 * registered email; on match the password is replaced. Without a backend
 * there is nothing to send a reset link to, so identity is verified against
 * the stored email directly.
 */
export async function resetPassword(input: {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}): Promise<AuthResult> {
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();

  const passwordError = validatePassword(input.password);
  if (passwordError) return { success: false, error: passwordError };
  if (input.confirmPassword !== undefined && input.confirmPassword !== input.password) {
    return { success: false, error: 'password-mismatch' };
  }

  const data = readUsers();
  const user = data.users.find(
    (u) =>
      u.username.toLowerCase() === username.toLowerCase() && u.email.toLowerCase() === email
  );
  if (!user) {
    return { success: false, error: 'account-not-found' };
  }

  user.passwordHash = await hashPassword(input.password, randomSalt());
  persistUser(user);

  logActivity({
    type: 'user-password-reset',
    entityId: user.id,
    detail: { actor: user.username },
  });

  return { success: true, username: user.username };
}
