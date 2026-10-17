import type { Style, Color, Category } from '../../types';

export type ShoppingFor = 'hat' | 'glasses' | 'both';
export type Budget = 'under-30' | '30-60' | '60-100' | '100-plus';
export type Occasion = 'everyday' | 'travel' | 'outdoor' | 'special';

export interface StyleFinderAnswers {
  style?: Style;
  shoppingFor?: ShoppingFor;
  colors: Color[];
  budget?: Budget;
  occasion?: Occasion;
}

export interface ScoringWeights {
  styleMatch: number;
  colorMatch: number;
  categoryMatch: number;
  budgetFit: number;
  occasionMatch: number;
  rating: number;
  bestSeller: number;
  featured: number;
  inStock: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  styleMatch: 25,
  colorMatch: 20,
  categoryMatch: 10,
  budgetFit: 15,
  occasionMatch: 10,
  rating: 10,
  bestSeller: 5,
  featured: 5,
  inStock: 0,
};

export interface AIStylistSettings {
  enabled: boolean;
  enabledStyles: Style[];
  requireStock: boolean;
  maxRecommendations: number;
  weights: ScoringWeights;
}

export const DEFAULT_AI_STYLIST_SETTINGS: AIStylistSettings = {
  enabled: true,
  enabledStyles: ['Street', 'Minimal', 'Classic', 'Sport', 'Luxury', 'Casual'],
  requireStock: false,
  maxRecommendations: 6,
  weights: { ...DEFAULT_WEIGHTS },
};

export interface ScoredRecommendation {
  productId: string;
  score: number;
  maxScore: number;
  reasons: string[];
}

export interface OutfitSet {
  hatId: string;
  glassesId: string;
  score: number;
  reasons: string[];
}

export interface RecommendationResult {
  items: ScoredRecommendation[];
  outfits: OutfitSet[];
  relaxationHints: string[];
  appliedFilters: {
    category?: Category | 'both';
    budgetRange?: [number, number];
    style?: Style;
    colors: Color[];
    occasion?: Occasion;
  };
}

export interface MissingAttributeReport {
  productId: string;
  name: string;
  missing: string[];
}
