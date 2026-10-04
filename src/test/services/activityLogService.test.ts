import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Activity Log Service', () => {
  beforeEach(() => {
    // Services keep module-level state and persist to localStorage; reset both
    // so every test starts from a fresh seed.
    vi.resetModules();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('logActivity', () => {
    it('stores an entry with a generated id and ISO timestamp', async () => {
      const service = await import('../../services/logs/logService');
      service.logActivity({ type: 'product-created', entityId: 'hat-001', detail: { name: 'Urban Black Cap' } });

      const logs = service.getActivityLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].type).toBe('product-created');
      expect(logs[0].entityId).toBe('hat-001');
      expect(logs[0].detail?.name).toBe('Urban Black Cap');
      expect(logs[0].id).toMatch(/^LOG-/);
      expect(() => new Date(logs[0].createdAt).getTime()).not.toBeNull();
      expect(Number.isNaN(new Date(logs[0].createdAt).getTime())).toBe(false);
    });

    it('returns entries newest first', async () => {
      const service = await import('../../services/logs/logService');
      service.logActivity({ type: 'product-created', detail: { name: 'first' } });
      service.logActivity({ type: 'product-updated', detail: { name: 'second' } });

      const logs = service.getActivityLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0].detail?.name).toBe('second');
      expect(logs[1].detail?.name).toBe('first');
    });

    it('caps stored entries at 500', async () => {
      const service = await import('../../services/logs/logService');
      for (let i = 0; i < 505; i++) {
        service.logActivity({ type: 'settings-updated', detail: { name: `event-${i}` } });
      }

      const logs = service.getActivityLogs();
      expect(logs).toHaveLength(500);
      // Oldest entries are dropped, newest kept.
      expect(logs[0].detail?.name).toBe('event-504');
      expect(logs.some((entry) => entry.detail?.name === 'event-0')).toBe(false);
    });

    it('filters by type', async () => {
      const service = await import('../../services/logs/logService');
      service.logActivity({ type: 'admin-login', detail: { actor: 'nima1389' } });
      service.logActivity({ type: 'product-created', detail: { name: 'A' } });
      service.logActivity({ type: 'admin-login', detail: { actor: 'other' } });

      const logins = service.getActivityLogsByType('admin-login');
      expect(logins).toHaveLength(2);
      expect(logins.every((entry) => entry.type === 'admin-login')).toBe(true);
    });

    it('clears all entries', async () => {
      const service = await import('../../services/logs/logService');
      service.logActivity({ type: 'admin-logout' });
      expect(service.getActivityLogs()).toHaveLength(1);

      service.clearActivityLogs();
      expect(service.getActivityLogs()).toHaveLength(0);
    });

    it('tolerates corrupted storage data', async () => {
      localStorage.setItem('vyro_logs_repository', 'not-json{{');
      const service = await import('../../services/logs/logService');
      expect(service.getActivityLogs()).toHaveLength(0);

      service.logActivity({ type: 'admin-login' });
      expect(service.getActivityLogs()).toHaveLength(1);
    });
  });

  describe('integration with existing services', () => {
    it('logs order-created when an order is placed', async () => {
      const orders = await import('../../services/orders/orderService');
      const logs = await import('../../services/logs/logService');

      const result = orders.createOrder({
        items: [{ productId: 'hat-001', quantity: 1, color: 'Black', size: 'One Size' }],
        customer: { firstName: 'Sara', lastName: 'Karimi', email: 'sara@example.com' },
      });

      expect(result.success).toBe(true);
      const entries = logs.getActivityLogsByType('order-created');
      expect(entries).toHaveLength(1);
      expect(entries[0].entityId).toBe(result.order?.id);
      expect(entries[0].detail?.name).toBe('Sara Karimi');
      expect(entries[0].detail?.total).toBe(40);
    });

    it('does not log seeded demo data', async () => {
      const orders = await import('../../services/orders/orderService');
      const logs = await import('../../services/logs/logService');

      orders.getOrders(); // triggers seeding
      expect(logs.getActivityLogs()).toHaveLength(0);
    });

    it('logs order-status changes with from and to', async () => {
      const orders = await import('../../services/orders/orderService');
      const logs = await import('../../services/logs/logService');

      expect(orders.updateOrderStatus('ORD-001', 'shipped').success).toBe(true);

      const entries = logs.getActivityLogsByType('order-status');
      expect(entries).toHaveLength(1);
      expect(entries[0].entityId).toBe('ORD-001');
      expect(entries[0].detail?.from).toBe('processing');
      expect(entries[0].detail?.to).toBe('shipped');
    });

    it('does not log a status change when the status is unchanged', async () => {
      const orders = await import('../../services/orders/orderService');
      const logs = await import('../../services/logs/logService');

      expect(orders.updateOrderStatus('ORD-001', 'processing').success).toBe(true);
      expect(logs.getActivityLogsByType('order-status')).toHaveLength(0);
    });

    it('logs customer-deleted when a customer is removed', async () => {
      const customers = await import('../../services/customers/customerService');
      const logs = await import('../../services/logs/logService');

      expect(customers.deleteCustomer('CUST-001').success).toBe(true);

      const entries = logs.getActivityLogsByType('customer-deleted');
      expect(entries).toHaveLength(1);
      expect(entries[0].entityId).toBe('CUST-001');
      expect(entries[0].detail?.name).toBe('John Doe');
    });

    it('logs admin-login and admin-logout with the username', async () => {
      const auth = await import('../../features/admin/services/adminAuth');
      const logs = await import('../../services/logs/logService');

      expect(auth.loginAdmin('nima1389', '898989').success).toBe(true);
      auth.logoutAdmin();

      const logins = logs.getActivityLogsByType('admin-login');
      const logouts = logs.getActivityLogsByType('admin-logout');
      expect(logins).toHaveLength(1);
      expect(logins[0].detail?.actor).toBe('nima1389');
      expect(logouts).toHaveLength(1);
      expect(logouts[0].detail?.actor).toBe('nima1389');
    });

    it('does not log failed login attempts', async () => {
      const auth = await import('../../features/admin/services/adminAuth');
      const logs = await import('../../services/logs/logService');

      expect(auth.loginAdmin('nima1389', 'wrong').success).toBe(false);
      expect(logs.getActivityLogs()).toHaveLength(0);
    });
  });
});
