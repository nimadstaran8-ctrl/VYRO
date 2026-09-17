import type { Collection } from '../../types';

export const collections: Collection[] = [
  {
    id: 'col-001',
    slug: 'summer-2026',
    title: 'SUMMER 2026',
    subtitle: 'Light layers. Bright days.',
    description:
      'Breezy hats and sun-ready sunglasses designed for long afternoons, city rooftops, and coastal escapes.',
    image: '/images/categories/summer.svg',
    products: ['hat-008', 'hat-002', 'glass-006', 'glass-001', 'hat-009'],
  },
  {
    id: 'col-002',
    slug: 'city-nights',
    title: 'CITY NIGHTS',
    subtitle: 'After-dark energy.',
    description:
      'Sleek black caps, bold frames, and pieces made for movement under neon lights.',
    image: '/images/categories/city-nights.svg',
    products: ['hat-001', 'glass-007', 'hat-007', 'glass-002', 'hat-005'],
  },
  {
    id: 'col-003',
    slug: 'weekend',
    title: 'WEEKEND',
    subtitle: 'Easygoing by design.',
    description:
      'Relaxed fits and versatile accessories that move from coffee runs to late nights without missing a beat.',
    image: '/images/categories/weekend.svg',
    products: ['hat-010', 'glass-006', 'hat-006', 'glass-009', 'hat-002'],
  },
  {
    id: 'col-004',
    slug: 'essentials',
    title: 'ESSENTIALS',
    subtitle: 'The forever pieces.',
    description:
      'Clean silhouettes and neutral palettes that form the foundation of every great wardrobe.',
    image: '/images/categories/essentials.svg',
    products: ['hat-001', 'glass-001', 'hat-002', 'glass-002', 'hat-009'],
  },
];
