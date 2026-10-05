import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  isUserAuthenticated,
  getUserSession,
  subscribeToUserSession,
} from '../../features/account/services/userAuth';

async function registerTestUser(overrides: Partial<Parameters<typeof registerUser>[0]> = {}) {
  return registerUser({
    username: 'nika',
    email: 'nika@example.com',
    password: 'secret123',
    confirmPassword: 'secret123',
    ...overrides,
  });
}

describe('User Auth (frontend prototype)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('registers a new account and hashes the password', async () => {
    const result = await registerTestUser();
    expect(result.success).toBe(true);

    const raw = localStorage.getItem('vyro_users_repository')!;
    expect(raw).not.toContain('secret123');
    const stored = JSON.parse(raw) as { users: { passwordHash: string }[] };
    expect(stored.users[0].passwordHash).toMatch(/^(s256|fb):[0-9a-f]+:/);
  });

  it('rejects duplicate username or email', async () => {
    await registerTestUser();
    const dupUsername = await registerTestUser({ email: 'other@example.com' });
    const dupEmail = await registerTestUser({ username: 'nika2' });
    expect(dupUsername.error).toBe('username-taken');
    expect(dupEmail.error).toBe('email-taken');
  });

  it('rejects invalid input', async () => {
    expect((await registerTestUser({ username: 'ab' })).error).toBe('username-invalid');
    expect((await registerTestUser({ email: 'not-an-email' })).error).toBe('email-invalid');
    expect((await registerTestUser({ password: '12345', confirmPassword: '12345' })).error).toBe('password-short');
    expect((await registerTestUser({ confirmPassword: 'different' })).error).toBe('password-mismatch');
  });

  it('logs in with the registered credentials', async () => {
    await registerTestUser();
    expect(isUserAuthenticated()).toBe(false);

    const result = await loginUser('Nika', 'secret123');
    expect(result.success).toBe(true);
    expect(isUserAuthenticated()).toBe(true);
    expect(getUserSession()?.username).toBe('nika');
  });

  it('rejects wrong credentials', async () => {
    await registerTestUser();
    const wrongPassword = await loginUser('nika', 'wrong-pass');
    const wrongUser = await loginUser('nobody', 'secret123');
    expect(wrongPassword.error).toBe('invalid-credentials');
    expect(wrongUser.error).toBe('invalid-credentials');
    expect(isUserAuthenticated()).toBe(false);
  });

  it('clears the session on logout', async () => {
    await registerTestUser();
    await loginUser('nika', 'secret123');
    expect(isUserAuthenticated()).toBe(true);

    logoutUser();
    expect(isUserAuthenticated()).toBe(false);
    expect(getUserSession()).toBeNull();
  });

  it('notifies subscribers on login and logout', async () => {
    await registerTestUser();

    const events: (null | { username: string })[] = [];
    const unsubscribe = subscribeToUserSession((session) => {
      events.push(session ? { username: session.username } : null);
    });

    await loginUser('nika', 'secret123');
    logoutUser();
    unsubscribe();

    // initial call + login + logout
    expect(events.length).toBe(3);
    expect(events[0]).toBeNull();
    expect(events[1]?.username).toBe('nika');
    expect(events[2]).toBeNull();
  });

  it('resets the password when username and email match', async () => {
    await registerTestUser();

    const result = await resetPassword({
      username: 'nika',
      email: 'NIKA@example.com',
      password: 'newpass456',
      confirmPassword: 'newpass456',
    });
    expect(result.success).toBe(true);

    // Old password no longer works, new one does.
    expect((await loginUser('nika', 'secret123')).success).toBe(false);
    expect((await loginUser('nika', 'newpass456')).success).toBe(true);
  });

  it('rejects a reset when the email does not match the account', async () => {
    await registerTestUser();
    const result = await resetPassword({
      username: 'nika',
      email: 'wrong@example.com',
      password: 'newpass456',
      confirmPassword: 'newpass456',
    });
    expect(result.error).toBe('account-not-found');
    expect((await loginUser('nika', 'secret123')).success).toBe(true);
  });

  it('rejects invalid new passwords on reset', async () => {
    await registerTestUser();
    const result = await resetPassword({
      username: 'nika',
      email: 'nika@example.com',
      password: '12345',
      confirmPassword: '12345',
    });
    expect(result.error).toBe('password-short');
  });
});
