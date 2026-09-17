import type { Review } from './review';

export type Category = 'hat' | 'glasses';

export type Style = 'Street' | 'Minimal' | 'Classic' | 'Sport' | 'Luxury' | 'Casual';

export type Color = 'Black' | 'White' | 'Brown' | 'Beige' | 'Green' | 'Blue' | 'Gold';

export type SortOption = 'featured' | 'newest' | 'price-low' | 'price-high' | 'best-rated';

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  priceUSD: number;
  oldPriceUSD?: number;
  description: string;
  images: string[];
  primaryImage?: string;
  colors: Color[];
  sizes: string[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  stock: number;
  tags: string[];
  style: Style;
  featured: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  isLimited?: boolean;
}

export interface AdminProduct extends Omit<Product, 'price' | 'oldPrice'> {
  price?: number;
  oldPrice?: number;
}

export function getPriceUSD(product: Product): number {
  return product.priceUSD;
}

export function getOldPriceUSD(product: Product): number | undefined {
  return product.oldPriceUSD;
}
