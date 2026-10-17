import { create } from 'zustand';
import { getProducts } from '../../../services/catalog/productService';
import { getAIStylistSettings } from '../../../services/settings/settingsService';
import {
  generateRecommendations,
  getBudgetRange,
} from '../services/recommendationEngine';
import type {
  Budget,
  Occasion,
  ShoppingFor,
  StyleFinderAnswers,
  ScoredRecommendation,
  OutfitSet,
} from '../types';
import type { Color, Style } from '../../../types';

interface StyleFinderState {
  answers: StyleFinderAnswers;
  step: number;
  results: ScoredRecommendation[];
  outfits: OutfitSet[];
  relaxationHints: string[];
  setStyle: (style: Style) => void;
  setShoppingFor: (value: ShoppingFor) => void;
  toggleColor: (color: Color) => void;
  setBudget: (budget: Budget) => void;
  setOccasion: (occasion: Occasion) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  findMatches: () => ScoredRecommendation[];
  goToStep: (step: number) => void;
}

const initialAnswers: StyleFinderAnswers = {
  colors: [],
};

export const useStyleFinderStore = create<StyleFinderState>((set, get) => ({
  answers: { ...initialAnswers },
  step: 0,
  results: [],
  outfits: [],
  relaxationHints: [],

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
  setOccasion: (occasion) => set((state) => ({ answers: { ...state.answers, occasion } })),

  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 5) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 0) })),
  goToStep: (step) => set(() => ({ step: Math.max(0, Math.min(step, 5)) })),

  reset: () =>
    set({
      answers: { ...initialAnswers },
      step: 0,
      results: [],
      outfits: [],
      relaxationHints: [],
    }),

  findMatches: () => {
    const { answers } = get();
    const products = getProducts();
    const settings = getAIStylistSettings();
    const result = generateRecommendations(products, answers, settings);

    set({
      results: result.items,
      outfits: result.outfits,
      relaxationHints: result.relaxationHints,
    });

    return result.items;
  },
}));

export type { Budget, Occasion, ShoppingFor };
export { getBudgetRange };
