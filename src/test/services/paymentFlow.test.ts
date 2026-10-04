import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Card-to-card payment flow', () => {
  beforeEach(() => {
    // Services keep module-level state and persist to localStorage; reset both
    // so every test starts from a fresh seed.
    vi.resetModules();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('payment settings', () => {
    it('defaults to an unconfigured card', async () => {
      const settings = await import('../../services/settings/settingsService');
      expect(settings.getPaymentSettings()).toEqual({ cardNumber: '', cardHolder: '' });
    });

    it('stores and returns the shop card details', async () => {
      const settings = await import('../../services/settings/settingsService');
      const result = settings.updatePaymentSettings({
        cardNumber: '6037997512345678',
        cardHolder: 'Nima',
      });

      expect(result.success).toBe(true);
      expect(settings.getPaymentSettings().cardNumber).toBe('6037997512345678');
      expect(settings.getPaymentSettings().cardHolder).toBe('Nima');
    });

    it('preserves an existing card when merging partial updates', async () => {
      const settings = await import('../../services/settings/settingsService');
      settings.updatePaymentSettings({ cardNumber: '6037997512345678', cardHolder: 'Nima' });
      settings.updatePaymentSettings({ cardHolder: 'Ali' });

      expect(settings.getPaymentSettings().cardNumber).toBe('6037997512345678');
      expect(settings.getPaymentSettings().cardHolder).toBe('Ali');
    });
  });

  describe('order creation', () => {
    it('creates card-to-card orders as awaiting-approval with the receipt id', async () => {
      const orders = await import('../../services/orders/orderService');
      const result = orders.createOrder({
        items: [{ productId: 'hat-001', quantity: 1, color: 'Black', size: 'One Size' }],
        customer: { firstName: 'Sara', lastName: 'Karimi', email: 'sara@example.com' },
        payment: { method: 'card-to-card', receiptId: 'img_test_1' },
      });

      expect(result.success).toBe(true);
      expect(result.order?.status).toBe('awaiting-approval');
      expect(result.order?.payment).toEqual({ method: 'card-to-card', receiptId: 'img_test_1' });
    });

    it('creates orders without card-to-card payment as pending', async () => {
      const orders = await import('../../services/orders/orderService');
      const result = orders.createOrder({
        items: [{ productId: 'hat-001', quantity: 1, color: 'Black', size: 'One Size' }],
        customer: { firstName: 'Sara', lastName: 'Karimi', email: 'sara@example.com' },
      });

      expect(result.success).toBe(true);
      expect(result.order?.status).toBe('pending');
      expect(result.order?.payment).toBeUndefined();
    });
  });

  describe('payment confirmation', () => {
    it('confirms an awaiting-approval order to paid', async () => {
      const orders = await import('../../services/orders/orderService');
      const created = orders.createOrder({
        items: [{ productId: 'hat-001', quantity: 1, color: 'Black', size: 'One Size' }],
        customer: { firstName: 'Sara', lastName: 'Karimi', email: 'sara@example.com' },
        payment: { method: 'card-to-card', receiptId: 'img_test_1' },
      });

      const result = orders.confirmOrderPayment(created.order!.id);
      expect(result.success).toBe(true);
      expect(orders.getOrderById(created.order!.id)?.status).toBe('paid');
    });

    it('rejects confirmation for orders not awaiting approval', async () => {
      const orders = await import('../../services/orders/orderService');
      const result = orders.confirmOrderPayment('ORD-001');
      expect(result.success).toBe(false);
    });
  });

  describe('payment rejection', () => {
    it('cancels the order and restores the reserved stock', async () => {
      const orders = await import('../../services/orders/orderService');
      const products = await import('../../services/catalog/productService');

      const stockBefore = products.getProductById('hat-001')!.stock;
      const created = orders.createOrder({
        items: [{ productId: 'hat-001', quantity: 2, color: 'Black', size: 'One Size' }],
        customer: { firstName: 'Sara', lastName: 'Karimi', email: 'sara@example.com' },
        payment: { method: 'card-to-card', receiptId: 'img_test_1' },
      });

      const stockAfterOrder = products.getProductById('hat-001')!.stock;
      expect(stockAfterOrder).toBe(stockBefore - 2);

      const result = orders.rejectOrderPayment(created.order!.id);
      expect(result.success).toBe(true);
      expect(orders.getOrderById(created.order!.id)?.status).toBe('cancelled');
      expect(products.getProductById('hat-001')!.stock).toBe(stockBefore);
    });

    it('rejects rejection for orders not awaiting approval', async () => {
      const orders = await import('../../services/orders/orderService');
      const result = orders.rejectOrderPayment('ORD-001');
      expect(result.success).toBe(false);
    });
  });

  describe('activity log integration', () => {
    it('logs the awaiting-approval → paid transition on confirmation', async () => {
      const orders = await import('../../services/orders/orderService');
      const logs = await import('../../services/logs/logService');

      const created = orders.createOrder({
        items: [{ productId: 'hat-001', quantity: 1, color: 'Black', size: 'One Size' }],
        customer: { firstName: 'Sara', lastName: 'Karimi', email: 'sara@example.com' },
        payment: { method: 'card-to-card', receiptId: 'img_test_1' },
      });
      orders.confirmOrderPayment(created.order!.id);

      const entries = logs.getActivityLogsByType('order-status');
      const confirmEntry = entries.find((entry) => entry.entityId === created.order!.id);
      expect(confirmEntry?.detail?.from).toBe('awaiting-approval');
      expect(confirmEntry?.detail?.to).toBe('paid');
    });
  });
});
