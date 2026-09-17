import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../../features/cart/store/cartStore';

describe('Cart Store', () => {
  beforeEach(() => {
    const store = useCartStore.getState();
    store.clearCart();
  });

  describe('addItem', () => {
    it('adds an item to the cart', () => {
      const { addItem } = useCartStore.getState();
      addItem({ productId: 'hat-001', color: 'Black', size: 'One Size', quantity: 1 });
      expect(useCartStore.getState().items.length).toBe(1);
    });

    it('increments quantity for duplicate items', () => {
      const { addItem } = useCartStore.getState();
      addItem({ productId: 'hat-001', color: 'Black', size: 'One Size', quantity: 1 });
      addItem({ productId: 'hat-001', color: 'Black', size: 'One Size', quantity: 1 });
      const { items } = useCartStore.getState();
      expect(items.length).toBe(1);
      expect(items[0].quantity).toBe(2);
    });

    it('treats items with different options as separate', () => {
      const { addItem } = useCartStore.getState();
      addItem({ productId: 'hat-001', color: 'Black', size: 'One Size', quantity: 1 });
      addItem({ productId: 'hat-001', color: 'White', size: 'One Size', quantity: 1 });
      const { items } = useCartStore.getState();
      expect(items.length).toBe(2);
    });
  });

  describe('removeItem', () => {
    it('removes an item from the cart', () => {
      const { addItem, removeItem } = useCartStore.getState();
      addItem({ productId: 'hat-001', color: 'Black', size: 'One Size', quantity: 1 });
      expect(useCartStore.getState().items.length).toBe(1);
      removeItem('hat-001', 'Black', 'One Size');
      expect(useCartStore.getState().items.length).toBe(0);
    });
  });

  describe('updateQuantity', () => {
    it('updates item quantity', () => {
      const { addItem, updateQuantity } = useCartStore.getState();
      addItem({ productId: 'hat-001', color: 'Black', size: 'One Size', quantity: 1 });
      updateQuantity('hat-001', 'Black', 'One Size', 5);
      const { items } = useCartStore.getState();
      expect(items[0].quantity).toBe(5);
    });

    it('removes item when quantity is less than 1', () => {
      const { addItem, updateQuantity } = useCartStore.getState();
      addItem({ productId: 'hat-001', color: 'Black', size: 'One Size', quantity: 1 });
      updateQuantity('hat-001', 'Black', 'One Size', 0);
      expect(useCartStore.getState().items.length).toBe(0);
    });
  });

  describe('getTotalItems', () => {
    it('returns correct total item count', () => {
      const { addItem, getTotalItems } = useCartStore.getState();
      addItem({ productId: 'hat-001', color: 'Black', size: 'One Size', quantity: 2 });
      addItem({ productId: 'hat-002', color: 'Beige', size: 'S/M', quantity: 3 });
      expect(getTotalItems()).toBe(5);
    });
  });

  describe('getSubtotal', () => {
    it('calculates correct subtotal', () => {
      const { addItem, getSubtotal } = useCartStore.getState();
      addItem({ productId: 'hat-001', color: 'Black', size: 'One Size', quantity: 1 });
      addItem({ productId: 'hat-002', color: 'Beige', size: 'S/M', quantity: 1 });
      const subtotal = getSubtotal();
      expect(subtotal).toBeGreaterThan(0);
    });

    it('returns 0 for empty cart', () => {
      const { getSubtotal } = useCartStore.getState();
      expect(getSubtotal()).toBe(0);
    });
  });

  describe('clearCart', () => {
    it('removes all items from cart', () => {
      const { addItem, clearCart } = useCartStore.getState();
      addItem({ productId: 'hat-001', color: 'Black', size: 'One Size', quantity: 1 });
      addItem({ productId: 'hat-002', color: 'Beige', size: 'S/M', quantity: 1 });
      clearCart();
      expect(useCartStore.getState().items.length).toBe(0);
    });
  });
});
