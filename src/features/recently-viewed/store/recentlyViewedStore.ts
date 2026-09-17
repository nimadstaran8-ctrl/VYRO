import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RecentlyViewedItem } from '../../../types';

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  addItem: (productId: string) => void;
  getRecentIds: (limit?: number) => string[];
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId) => {
        set((state) => {
          const filtered = state.items.filter((i) => i.productId !== productId);
          return {
            items: [{ productId, viewedAt: Date.now() }, ...filtered].slice(0, 20),
          };
        });
      },
      getRecentIds: (limit = 8) => {
        return get()
          .items.sort((a, b) => b.viewedAt - a.viewedAt)
          .slice(0, limit)
          .map((i) => i.productId);
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: 'vyro-recently-viewed',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
