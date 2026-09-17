import type { Category, Color, Style } from './product';

export interface Filters {
  categories: Category[];
  priceRange: [number, number];
  colors: Color[];
  styles: Style[];
  sizes: string[];
  rating: number;
  availability: 'all' | 'in-stock';
}
