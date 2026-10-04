import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Order } from '../../types/order';

describe('Order Service', () => {
  beforeEach(() => {
    // The service keeps module-level state and persists to localStorage;
    // reset both so every test starts from a fresh seed.
    vi.resetModules();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('initialization', () => {
    it('seeds demo orders on first run', async () => {
      const service = await import('../../services/orders/orderService');
      const orders = service.getOrders();
      expect(orders.length).toBeGreaterThan(0);
      expect(orders.some((o) => o.id === 'ORD-001')).toBe(true);
    });

    it('migrates legacy "delivered" status to "completed"', async () => {
      const legacyOrder: Order = {
        id: 'ORD-LEGACY',
        date: '2026-01-01',
        status: 'delivered' as Order['status'],
        items: [],
        subtotal: 10,
        shipping: 0,
        discount: 0,
        total: 10,
      };
      localStorage.setItem(
        'vyro_orders_repository',
        JSON.stringify({ orders: [legacyOrder], version: 1 })
      );

      const service = await import('../../services/orders/orderService');
      const found = service.getOrderById('ORD-LEGACY');
      expect(found?.status).toBe('completed');
    });
  });

  describe('createOrder', () => {
    it('creates a pending order with customer info and correct totals', async () => {
      const module = await import('../../services/orders/orderService');
      const result = module.createOrder({
        items: [{ productId: 'hat-001', quantity: 1, color: 'Black', size: 'One Size' }],
        customer: {
          firstName: 'Sara',
          lastName: 'Karimi',
          email: 'sara@example.com',
          phone: '+98 912 000 0000',
          city: 'Tehran',
        },
      });

      expect(result.success).toBe(true);
      expect(result.order?.status).toBe('pending');
      expect(result.order?.customer?.email).toBe('sara@example.com');
      expect(result.order?.subtotal).toBe(34);
      // subtotal < 75 → default shipping cost applies
      expect(result.order?.shipping).toBe(6);
      expect(result.order?.total).toBe(40);
    });

    it('uses free shipping at the threshold', async () => {
      const module = await import('../../services/orders/orderService');
      // hat-005 "Luxury Leather Cap" costs 120 USD (>= 75)
      const result = module.createOrder({
        items: [{ productId: 'hat-005', quantity: 1, color: 'Black', size: 'One Size' }],
        customer: { firstName: 'Ali', lastName: 'Rezaei', email: 'ali@example.com' },
      });

      expect(result.success).toBe(true);
      expect(result.order?.shipping).toBe(0);
      expect(result.order?.total).toBe(result.order?.subtotal);
    });

    it('resolves product name, price and image from the catalog', async () => {
      const module = await import('../../services/orders/orderService');
      const result = module.createOrder({
        items: [{ productId: 'hat-001', quantity: 2, color: 'Black', size: 'One Size' }],
        customer: { firstName: 'A', lastName: 'B', email: 'a@b.com' },
      });

      expect(result.order?.items[0].name).toBe('Urban Black Cap');
      expect(result.order?.items[0].price).toBe(34);
      expect(result.order?.items[0].image).toContain('/images/products/');
    });

    it('decrements product stock after order placement', async () => {
      const module = await import('../../services/orders/orderService');
      const productService = await import('../../services/catalog/productService');

      const before = productService.getProductById('hat-001')?.stock ?? 0;
      module.createOrder({
        items: [{ productId: 'hat-001', quantity: 2, color: 'Black', size: 'One Size' }],
        customer: { firstName: 'A', lastName: 'B', email: 'a@b.com' },
      });
      const after = productService.getProductById('hat-001')?.stock ?? 0;

      expect(after).toBe(Math.max(0, before - 2));
    });

    it('rejects empty item lists', async () => {
      const module = await import('../../services/orders/orderService');
      const result = module.createOrder({
        items: [],
        customer: { firstName: 'A', lastName: 'B', email: 'a@b.com' },
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing customer info', async () => {
      const module = await import('../../services/orders/orderService');
      const result = module.createOrder({
        items: [{ productId: 'hat-001', quantity: 1, color: 'Black', size: 'One Size' }],
        customer: { firstName: '', lastName: '', email: '' },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateOrderStatus', () => {
    it('updates to each of the six statuses and persists', async () => {
      const module = await import('../../services/orders/orderService');
      const statuses: Order['status'][] = [
        'pending',
        'paid',
        'processing',
        'shipped',
        'completed',
        'cancelled',
      ];

      for (const status of statuses) {
        const result = module.updateOrderStatus('ORD-001', status);
        expect(result.success).toBe(true);
        expect(module.getOrderById('ORD-001')?.status).toBe(status);
      }
    });

    it('rejects invalid statuses', async () => {
      const module = await import('../../services/orders/orderService');
      const result = module.updateOrderStatus('ORD-001', 'delivered' as Order['status']);
      expect(result.success).toBe(false);
    });

    it('fails for unknown order ids', async () => {
      const module = await import('../../services/orders/orderService');
      const result = module.updateOrderStatus('ORD-NOPE', 'paid');
      expect(result.success).toBe(false);
    });
  });

  describe('customer lookups and stats', () => {
    it('finds orders by customer email', async () => {
      const module = await import('../../services/orders/orderService');
      module.createOrder({
        items: [{ productId: 'hat-001', quantity: 1, color: 'Black', size: 'One Size' }],
        customer: { firstName: 'Sara', lastName: 'Karimi', email: 'sara@example.com' },
      });

      const found = module.getOrdersByCustomerEmail('SARA@example.com');
      expect(found.length).toBe(1);
      expect(found[0].customer?.email).toBe('sara@example.com');
    });

    it('searches by customer name and email', async () => {
      const module = await import('../../services/orders/orderService');
      expect(module.searchOrders('jane').length).toBeGreaterThan(0);
      expect(module.searchOrders('jane.smith@example.com').length).toBeGreaterThan(0);
    });

    it('excludes pending and cancelled orders from revenue', async () => {
      const module = await import('../../services/orders/orderService');
      const stats = module.getOrderStats();

      const expectedRevenue = module
        .getOrders()
        .filter((o) => ['paid', 'processing', 'shipped', 'completed'].includes(o.status))
        .reduce((sum, o) => sum + o.total, 0);

      expect(stats.revenue).toBe(expectedRevenue);
      expect(stats.pending).toBe(module.getOrders().filter((o) => o.status === 'pending').length);
      expect(stats.completed).toBe(module.getOrders().filter((o) => o.status === 'completed').length);
    });
  });

  describe('deleteOrder', () => {
    it('removes an order', async () => {
      const module = await import('../../services/orders/orderService');
      const result = module.deleteOrder('ORD-001');
      expect(result.success).toBe(true);
      expect(module.getOrderById('ORD-001')).toBeUndefined();
    });
  });
});
