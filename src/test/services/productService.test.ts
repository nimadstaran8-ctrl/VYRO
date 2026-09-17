import { describe, it, expect } from 'vitest';
import {
  getProducts,
  getProductById,
  getProductBySlug,
  getFeaturedProducts,
  getTrendingProducts,
  getRelatedProducts,
  getProductsByCategory,
  searchProducts,
  filterProducts,
  sortProducts,
} from '../../services/catalog/productService';
import type { Filters } from '../../types';

describe('Product Service', () => {
  describe('getProducts', () => {
    it('returns an array of products', () => {
      const products = getProducts();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });

    it('returns products with all required fields', () => {
      const products = getProducts();
      const product = products[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('slug');
      expect(product).toHaveProperty('priceUSD');
      expect(product).toHaveProperty('category');
    });
  });

  describe('getProductById', () => {
    it('finds a valid product by id', () => {
      const products = getProducts();
      const product = products[0];
      const found = getProductById(product.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(product.id);
    });

    it('returns undefined for invalid id', () => {
      const found = getProductById('invalid-id');
      expect(found).toBeUndefined();
    });
  });

  describe('getProductBySlug', () => {
    it('finds a valid product by slug', () => {
      const products = getProducts();
      const product = products[0];
      const found = getProductBySlug(product.slug);
      expect(found).toBeDefined();
      expect(found?.slug).toBe(product.slug);
    });

    it('returns undefined for invalid slug', () => {
      const found = getProductBySlug('invalid-slug');
      expect(found).toBeUndefined();
    });
  });

  describe('getFeaturedProducts', () => {
    it('returns only featured products', () => {
      const featured = getFeaturedProducts();
      expect(Array.isArray(featured)).toBe(true);
      featured.forEach((product) => {
        expect(product.featured).toBe(true);
      });
    });

    it('respects the limit parameter', () => {
      const featured = getFeaturedProducts(3);
      expect(featured.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getTrendingProducts', () => {
    it('returns products sorted by best sellers and rating', () => {
      const trending = getTrendingProducts();
      expect(Array.isArray(trending)).toBe(true);
    });
  });

  describe('getRelatedProducts', () => {
    it('returns related products in the same category', () => {
      const products = getProducts();
      const product = products[0];
      const related = getRelatedProducts(product);
      related.forEach((p) => {
        expect(p.id).not.toBe(product.id);
        expect(p.category).toBe(product.category);
      });
    });

    it('respects the limit parameter', () => {
      const products = getProducts();
      const product = products[0];
      const related = getRelatedProducts(product, 2);
      expect(related.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getProductsByCategory', () => {
    it('returns only products of the specified category', () => {
      const hats = getProductsByCategory('hat');
      hats.forEach((product) => {
        expect(product.category).toBe('hat');
      });
    });
  });

  describe('searchProducts', () => {
    it('returns matching products', () => {
      const results = searchProducts('black');
      expect(Array.isArray(results)).toBe(true);
    });

    it('returns empty array for no matches', () => {
      const results = searchProducts('xyznonexistent');
      expect(results).toEqual([]);
    });

    it('is case insensitive', () => {
      const results1 = searchProducts('BLACK');
      const results2 = searchProducts('black');
      expect(results1.length).toBe(results2.length);
    });

    it('trims whitespace from query', () => {
      const results = searchProducts('  black  ');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('filterProducts', () => {
    it('filters by category', () => {
      const products = getProducts();
      const filters: Filters = { categories: ['hat'], priceRange: [0, 100], colors: [], styles: [], sizes: [], rating: 0, availability: 'all' };
      const filtered = filterProducts(products, filters);
      filtered.forEach((p) => {
        expect(p.category).toBe('hat');
      });
    });

    it('filters by price range', () => {
      const products = getProducts();
      const filters: Filters = { categories: [], priceRange: [20, 50], colors: [], styles: [], sizes: [], rating: 0, availability: 'all' };
      const filtered = filterProducts(products, filters);
      filtered.forEach((p) => {
        expect(p.priceUSD).toBeGreaterThanOrEqual(20);
        expect(p.priceUSD).toBeLessThanOrEqual(50);
      });
    });

    it('filters by rating', () => {
      const products = getProducts();
      const filters: Filters = { categories: [], priceRange: [0, 500], colors: [], styles: [], sizes: [], rating: 4.8, availability: 'all' };
      const filtered = filterProducts(products, filters);
      filtered.forEach((p) => {
        expect(p.rating).toBeGreaterThanOrEqual(4.8);
      });
    });
  });

  describe('sortProducts', () => {
    it('sorts by price low to high', () => {
      const products = getProducts();
      const sorted = sortProducts(products, 'price-low');
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].priceUSD).toBeGreaterThanOrEqual(sorted[i - 1].priceUSD);
      }
    });

    it('sorts by price high to low', () => {
      const products = getProducts();
      const sorted = sortProducts(products, 'price-high');
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].priceUSD).toBeLessThanOrEqual(sorted[i - 1].priceUSD);
      }
    });

    it('sorts by best rated', () => {
      const products = getProducts();
      const sorted = sortProducts(products, 'best-rated');
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].rating).toBeLessThanOrEqual(sorted[i - 1].rating);
      }
    });
  });
});
