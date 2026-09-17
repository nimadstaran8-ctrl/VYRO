import type { Category, Style, Color } from '../types';

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'hat', label: 'Hats' },
  { value: 'glasses', label: 'Glasses' },
];

export const STYLES: { value: Style; label: string }[] = [
  { value: 'Street', label: 'Street' },
  { value: 'Minimal', label: 'Minimal' },
  { value: 'Classic', label: 'Classic' },
  { value: 'Sport', label: 'Sport' },
  { value: 'Luxury', label: 'Luxury' },
  { value: 'Casual', label: 'Casual' },
];

export const COLORS: { value: Color; label: string }[] = [
  { value: 'Black', label: 'Black' },
  { value: 'White', label: 'White' },
  { value: 'Brown', label: 'Brown' },
  { value: 'Beige', label: 'Beige' },
  { value: 'Green', label: 'Green' },
  { value: 'Blue', label: 'Blue' },
  { value: 'Gold', label: 'Gold' },
];

export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'best-rated', label: 'Best Rated' },
];

export const MAX_CART_QUANTITY = 10;
export const FREE_SHIPPING_THRESHOLD = 75;
export const DEFAULT_SHIPPING_COST = 6;
export const RECENTLY_VIEWED_LIMIT = 20;
