import { describe, it, expect, beforeEach } from 'vitest';
import { useWishlistStore } from '../../features/wishlist/store/wishlistStore';

describe('Wishlist Store', () => {
  beforeEach(() => {
    const store = useWishlistStore.getState();
    store.clearWishlist();
  });

  describe('addItem', () => {
    it('adds an item to the wishlist', () => {
      const { addItem } = useWishlistStore.getState();
      addItem('hat-001');
      expect(useWishlistStore.getState().items).toContain('hat-001');
    });

    it('prevents duplicates', () => {
      const { addItem } = useWishlistStore.getState();
      addItem('hat-001');
      addItem('hat-001');
      expect(useWishlistStore.getState().items.filter((id) => id === 'hat-001').length).toBe(1);
    });
  });

  describe('removeItem', () => {
    it('removes an item from the wishlist', () => {
      const { addItem, removeItem } = useWishlistStore.getState();
      addItem('hat-001');
      removeItem('hat-001');
      expect(useWishlistStore.getState().items).not.toContain('hat-001');
    });
  });

  describe('toggleItem', () => {
    it('adds item if not in wishlist', () => {
      const { toggleItem } = useWishlistStore.getState();
      toggleItem('hat-001');
      expect(useWishlistStore.getState().items).toContain('hat-001');
    });

    it('removes item if already in wishlist', () => {
      const { addItem, toggleItem } = useWishlistStore.getState();
      addItem('hat-001');
      toggleItem('hat-001');
      expect(useWishlistStore.getState().items).not.toContain('hat-001');
    });
  });

  describe('isInWishlist', () => {
    it('returns true if item is in wishlist', () => {
      const { addItem, isInWishlist } = useWishlistStore.getState();
      addItem('hat-001');
      expect(isInWishlist('hat-001')).toBe(true);
    });

    it('returns false if item is not in wishlist', () => {
      const { isInWishlist } = useWishlistStore.getState();
      expect(isInWishlist('hat-001')).toBe(false);
    });
  });

  describe('clearWishlist', () => {
    it('removes all items from wishlist', () => {
      const { addItem, clearWishlist } = useWishlistStore.getState();
      addItem('hat-001');
      addItem('hat-002');
      clearWishlist();
      expect(useWishlistStore.getState().items.length).toBe(0);
    });
  });
});
