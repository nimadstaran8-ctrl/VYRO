import { describe, it, expect, beforeEach } from 'vitest';
import {
  loginAdmin,
  logoutAdmin,
  isAdminAuthenticated,
  getAdminSession,
  subscribeToAdminSession,
  DEMO_ADMIN_CREDENTIALS,
} from '../../features/admin/services/adminAuth';

describe('Admin Auth (frontend prototype)', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('is unauthenticated by default', () => {
    expect(isAdminAuthenticated()).toBe(false);
    expect(getAdminSession()).toBeNull();
  });

  it('logs in with the demo credentials', () => {
    const result = loginAdmin(DEMO_ADMIN_CREDENTIALS.username, DEMO_ADMIN_CREDENTIALS.password);
    expect(result.success).toBe(true);
    expect(isAdminAuthenticated()).toBe(true);
    expect(getAdminSession()?.username).toBe(DEMO_ADMIN_CREDENTIALS.username);
  });

  it('rejects wrong credentials', () => {
    const wrongPassword = loginAdmin(DEMO_ADMIN_CREDENTIALS.username, 'wrong');
    const wrongUser = loginAdmin('nobody', DEMO_ADMIN_CREDENTIALS.password);
    expect(wrongPassword.success).toBe(false);
    expect(wrongUser.success).toBe(false);
    expect(isAdminAuthenticated()).toBe(false);
  });

  it('clears the session on logout', () => {
    loginAdmin(DEMO_ADMIN_CREDENTIALS.username, DEMO_ADMIN_CREDENTIALS.password);
    expect(isAdminAuthenticated()).toBe(true);

    logoutAdmin();
    expect(isAdminAuthenticated()).toBe(false);
    expect(getAdminSession()).toBeNull();
  });

  it('notifies subscribers on login and logout', () => {
    const events: (null | { username: string })[] = [];
    const unsubscribe = subscribeToAdminSession((session) => {
      events.push(session ? { username: session.username } : null);
    });

    loginAdmin(DEMO_ADMIN_CREDENTIALS.username, DEMO_ADMIN_CREDENTIALS.password);
    logoutAdmin();
    unsubscribe();

    // initial call + login + logout
    expect(events.length).toBe(3);
    expect(events[0]).toBeNull();
    expect(events[1]?.username).toBe(DEMO_ADMIN_CREDENTIALS.username);
    expect(events[2]).toBeNull();
  });
});
