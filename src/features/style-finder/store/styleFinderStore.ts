import { create } from 'zustand';
import { getProducts } from '../../../services/catalog/productService';
import type { Color, Style } from '../../../types';

export type ShoppingFor = 'hat' | 'glasses' | 'both';
export type Budget = 'under-30' | '30-60' | '60-100' | '100-plus';

interface StyleFinderAnswers {
  style?: Style;
  shoppingFor?: ShoppingFor;
  colors: Color[];
  budget?: Budget;
}

interface StyleFinderState {
  answers: StyleFinderAnswers;
  step: number;
  results: string[];
  setStyle: (style: Style) => void;
  setShoppingFor: (value: ShoppingFor) => void;
  toggleColor: (color: Color) => void;
  setBudget: (budget: Budget) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  findMatches: () => string[];
}

const budgetRanges: Record<Budget, [number, number]> = {
  'under-30': [0, 30],
  '30-60': [30, 60],
  '60-100': [60, 100],
  '100-plus': [100, 1000],
};

export const useStyleFinderStore = create<StyleFinderState>((set, get) => ({
  answers: { colors: [] },
  step: 0,
  results: [],

  setStyle: (style) => set((state) => ({ answers: { ...state.answers, style } })),
  setShoppingFor: (shoppingFor) => set((state) => ({ answers: { ...state.answers, shoppingFor } })),
  toggleColor: (color) =>
    set((state) => ({
      answers: {
        ...state.answers,
        colors: state.answers.colors.includes(color)
          ? state.answers.colors.filter((c) => c !== color)
          : [...state.answers.colors, color],
      },
    })),
  setBudget: (budget) => set((state) => ({ answers: { ...state.answers, budget } })),

  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 4) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 0) })),

  reset: () => set({ answers: { colors: [] }, step: 0, results: [] }),

  findMatches: () => {
    const { answers } = get();
    const products = getProducts();
    const scored = products
      .filter((p) => {
        if (answers.shoppingFor && answers.shoppingFor !== 'both') {
          if (p.category !== answers.shoppingFor) return false;
        }
        if (answers.budget) {
          const [min, max] = budgetRanges[answers.budget];
          if (p.priceUSD < min || p.priceUSD > max) return false;
        }
        return true;
      })
      .map((p) => {
        let score = 0;
        if (answers.style && p.style === answers.style) score += 40;
        if (answers.colors.length > 0) {
          const matchingColors = p.colors.filter((c) => answers.colors.includes(c)).length;
          score += (matchingColors / Math.max(p.colors.length, 1)) * 30;
        }
        if (p.rating >= 4.8) score += 15;
        if (p.isBestSeller) score += 10;
        if (p.featured) score += 5;
        return { productId: p.id, score: Math.min(100, Math.round(score)) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const resultIds = scored.map((s) => s.productId);
    set({ results: resultIds });
    return resultIds;
  },
}));
