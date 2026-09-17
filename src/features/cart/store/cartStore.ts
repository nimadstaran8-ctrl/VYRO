import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getProductById } from '../../../services/catalog/productService';
import type { CartItem } from '../../../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.color === item.color && i.size === item.size
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.color === item.color && i.size === item.size
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
        get().openCart();
      },

      removeItem: (productId, color, size) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.color === color && i.size === size)
          ),
        }));
      },

      updateQuantity: (productId, color, size, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId, color, size);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.color === color && i.size === size
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const product = getProductById(item.productId);
          return total + (product?.priceUSD ?? 0) * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'vyro-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
