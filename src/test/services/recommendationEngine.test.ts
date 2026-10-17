import { describe, it, expect } from 'vitest';
import {
  generateRecommendations,
  findProductsWithMissingAttributes,
  getBudgetRange,
  getReasonMessage,
  getRelaxationHintMessage,
} from '../../features/style-finder/services/recommendationEngine';
import { getProducts } from '../../services/catalog/productService';
import type { Product, Style, Color } from '../../types';
import type { StyleFinderAnswers, AIStylistSettings } from '../../features/style-finder/types';
import { DEFAULT_AI_STYLIST_SETTINGS } from '../../features/style-finder/types';

function makeAnswer(partial: Partial<StyleFinderAnswers> = {}): StyleFinderAnswers {
  return {
    colors: [],
    ...partial,
  };
}

describe('Recommendation Engine', () => {
  const products = getProducts();

  describe('getBudgetRange', () => {
    it('returns correct ranges', () => {
      expect(getBudgetRange('under-30')).toEqual([0, 30]);
      expect(getBudgetRange('30-60')).toEqual([30, 60]);
      expect(getBudgetRange('60-100')).toEqual([60, 100]);
      expect(getBudgetRange('100-plus')[0]).toBe(100);
      expect(getBudgetRange('100-plus')[1]).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('style matching', () => {
    it('ranks products matching the selected style higher', () => {
      const answers = makeAnswer({ style: 'Street' as Style, shoppingFor: 'hat' as const });
      const result = generateRecommendations(products, answers, DEFAULT_AI_STYLIST_SETTINGS);
      const top = result.items[0];
      const topProduct = products.find((p) => p.id === top.productId);
      expect(topProduct?.style).toBe('Street');
    });

    it('respects disabled style categories in settings', () => {
      const settings: AIStylistSettings = {
        ...DEFAULT_AI_STYLIST_SETTINGS,
        enabledStyles: ['Minimal'],
      };
      const answers = makeAnswer({ style: 'Street' as Style });
      const result = generateRecommendations(products, answers, settings);
      expect(result.items).toEqual([]);
    });
  });

  describe('color matching', () => {
    it('includes products with at least one matching color', () => {
      const answers = makeAnswer({ colors: ['Gold' as Color], shoppingFor: 'glasses' as const });
      const result = generateRecommendations(products, answers, DEFAULT_AI_STYLIST_SETTINGS);
      expect(result.items.length).toBeGreaterThan(0);
      const first = products.find((p) => p.id === result.items[0].productId);
      expect(first?.colors).toContain('Gold');
    });

    it('does not add color-match reason when no products match selected color', () => {
      const answers = makeAnswer({ colors: ['Gold' as Color], shoppingFor: 'hat' as const });
      const result = generateRecommendations(products, answers, DEFAULT_AI_STYLIST_SETTINGS);
      expect(result.items.length).toBeGreaterThan(0);
      const top = result.items[0];
      expect(top.reasons).not.toContain('color-match');
      expect(top.reasons).not.toContain('colors-match');
    });
  });

  describe('budget filtering', () => {
    it('excludes products outside the selected budget', () => {
      const answers = makeAnswer({ budget: 'under-30' as const, shoppingFor: 'hat' as const });
      const result = generateRecommendations(products, answers, DEFAULT_AI_STYLIST_SETTINGS);
      result.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        expect(product?.priceUSD).toBeLessThanOrEqual(30);
      });
    });

    it('includes products inside the selected budget', () => {
      const answers = makeAnswer({ budget: '30-60' as const, shoppingFor: 'hat' as const });
      const result = generateRecommendations(products, answers, DEFAULT_AI_STYLIST_SETTINGS);
      expect(result.items.length).toBeGreaterThan(0);
    });
  });

  describe('category filtering', () => {
    it('returns only hats when shopping for hats', () => {
      const answers = makeAnswer({ shoppingFor: 'hat' as const });
      const result = generateRecommendations(products, answers, DEFAULT_AI_STYLIST_SETTINGS);
      result.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        expect(product?.category).toBe('hat');
      });
    });

    it('returns only glasses when shopping for glasses', () => {
      const answers = makeAnswer({ shoppingFor: 'glasses' as const });
      const result = generateRecommendations(products, answers, DEFAULT_AI_STYLIST_SETTINGS);
      result.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        expect(product?.category).toBe('glasses');
      });
    });

    it('returns both categories when shopping for both', () => {
      const answers = makeAnswer({ shoppingFor: 'both' as const });
      const result = generateRecommendations(products, answers, DEFAULT_AI_STYLIST_SETTINGS);
      const categories = new Set(result.items.map((item) => products.find((p) => p.id === item.productId)?.category));
      expect(categories.size).toBe(2);
    });
  });

  describe('stock handling', () => {
    it('excludes out-of-stock products when requireStock is true', () => {
      const outOfStockProduct = products.find((p) => p.stock === 0);
      if (!outOfStockProduct) {
        // All mock products are in stock; test the filter logic directly.
        const settings: AIStylistSettings = { ...DEFAULT_AI_STYLIST_SETTINGS, requireStock: true };
        const answers = makeAnswer({ shoppingFor: 'hat' as const });
        const result = generateRecommendations(products, answers, settings);
        result.items.forEach((item) => {
          const product = products.find((p) => p.id === item.productId);
          expect(product!.stock).toBeGreaterThan(0);
        });
        return;
      }

      const settings: AIStylistSettings = { ...DEFAULT_AI_STYLIST_SETTINGS, requireStock: true };
      const answers = makeAnswer({ shoppingFor: outOfStockProduct.category });
      const result = generateRecommendations(products, answers, settings);
      expect(result.items.every((item) => item.productId !== outOfStockProduct.id)).toBe(true);
    });
  });

  describe('occasion matching', () => {
    it('uses style and tags as soft signals without inventing attributes', () => {
      const answers = makeAnswer({ occasion: 'outdoor' as const, shoppingFor: 'glasses' as const });
      const result = generateRecommendations(products, answers, DEFAULT_AI_STYLIST_SETTINGS);
      const outdoorProduct = result.items.find((item) => {
        const product = products.find((p) => p.id === item.productId);
        return product?.style === 'Sport' || product?.tags.some((t) => ['sport', 'polarized'].includes(t.toLowerCase()));
      });
      if (result.items.length > 0) {
        expect(outdoorProduct).toBeDefined();
      }
    });
  });

  describe('ranking and explanations', () => {
    it('returns scores between 0 and 100', () => {
      const answers = makeAnswer({ shoppingFor: 'hat' as const });
      const result = generateRecommendations(products, answers, DEFAULT_AI_STYLIST_SETTINGS);
      result.items.forEach((item) => {
        expect(item.score).toBeGreaterThanOrEqual(0);
        expect(item.score).toBeLessThanOrEqual(100);
        expect(item.reasons.length).toBeGreaterThan(0);
      });
    });

    it('provides deterministic results for the same input', () => {
      const answers = makeAnswer({ style: 'Classic' as Style, shoppingFor: 'hat' as const });
      const first = generateRecommendations(products, answers, DEFAULT_AI_STYLIST_SETTINGS);
      const second = generateRecommendations(products, answers, DEFAULT_AI_STYLIST_SETTINGS);
      expect(first.items.map((i) => i.productId)).toEqual(second.items.map((i) => i.productId));
      expect(first.items.map((i) => i.score)).toEqual(second.items.map((i) => i.score));
    });
  });

  describe('empty results and relaxation', () => {
    it('returns relaxation hints when no products match', () => {
      const answers = makeAnswer({
        shoppingFor: 'glasses' as const,
        budget: 'under-30' as const,
      });
      const result = generateRecommendations(products, answers, DEFAULT_AI_STYLIST_SETTINGS);
      expect(result.items).toEqual([]);
      expect(result.relaxationHints.length).toBeGreaterThan(0);
    });

    it('suggests relaxing budget when budget excludes products', () => {
      const answers = makeAnswer({
        shoppingFor: 'glasses' as const,
        budget: 'under-30' as const,
      });
      const result = generateRecommendations(products, answers, DEFAULT_AI_STYLIST_SETTINGS);
      expect(result.relaxationHints).toContain('relax-budget');
    });
  });

  describe('coordinated combinations', () => {
    it('generates outfit sets when shopping for both', () => {
      const answers = makeAnswer({ shoppingFor: 'both' as const });
      const result = generateRecommendations(products, answers, DEFAULT_AI_STYLIST_SETTINGS);
      expect(result.outfits.length).toBeGreaterThan(0);
      result.outfits.forEach((outfit) => {
        const hat = products.find((p) => p.id === outfit.hatId);
        const glasses = products.find((p) => p.id === outfit.glassesId);
        expect(hat?.category).toBe('hat');
        expect(glasses?.category).toBe('glasses');
        expect(outfit.score).toBeGreaterThanOrEqual(0);
        expect(outfit.score).toBeLessThanOrEqual(100);
      });
    });

    it('explains outfit coordination with actual shared attributes', () => {
      const answers = makeAnswer({ style: 'Classic' as Style, shoppingFor: 'both' as const });
      const result = generateRecommendations(products, answers, DEFAULT_AI_STYLIST_SETTINGS);
      const first = result.outfits[0];
      if (!first) return;
      const hat = products.find((p) => p.id === first.hatId)!;
      const glasses = products.find((p) => p.id === first.glassesId)!;
      const sharedStyle = hat.style === glasses.style;
      const sharedColors = hat.colors.filter((c) => glasses.colors.includes(c));
      expect(sharedStyle || sharedColors.length > 0).toBe(true);
      expect(first.reasons.some((r) => r === 'shared-style' || r === 'shared-color')).toBe(true);
    });
  });

  describe('missing attributes', () => {
    it('identifies products missing required recommendation data', () => {
      const invalidProduct: Product = {
        id: 'invalid-1',
        name: 'Invalid Product',
        slug: 'invalid-product',
        category: 'hat',
        priceUSD: 0,
        description: 'Test',
        images: [],
        colors: [],
        sizes: [],
        rating: 0,
        reviewCount: 0,
        reviews: [],
        stock: 0,
        tags: [],
        style: '' as Style,
        featured: false,
      };
      const reports = findProductsWithMissingAttributes([invalidProduct]);
      expect(reports.length).toBe(1);
      expect(reports[0].missing.length).toBeGreaterThan(0);
    });

    it('returns empty report for valid mock products', () => {
      const reports = findProductsWithMissingAttributes(products);
      expect(reports).toEqual([]);
    });
  });

  describe('localization helpers', () => {
    it('returns translated reason messages', () => {
      expect(getReasonMessage('style-match', 'en')).toBe('Matches your chosen style');
      expect(getReasonMessage('style-match', 'fa')).toBe('استایل انتخابی شما را دارد');
    });

    it('returns translated relaxation hints', () => {
      expect(getRelaxationHintMessage('relax-budget', 'en')).toContain('budget');
      expect(getRelaxationHintMessage('relax-budget', 'fa')).toContain('بودجه');
    });
  });
});
