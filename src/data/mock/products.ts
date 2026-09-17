import type { Product } from '../../types';

export const products: Product[] = [
  {
    id: 'hat-001',
    name: 'Urban Black Cap',
    slug: 'urban-black-cap',
    category: 'hat',
    priceUSD: 34,
    description:
      'A clean, structured black cap built for city streets. Minimal branding, premium cotton twill, and an adjustable strap for all-day comfort.',
    images: [
      '/images/products/hat-black.svg',
      '/images/products/hat-cap1.svg'
    ],
    colors: ['Black', 'White', 'Green'],
    sizes: ['One Size'],
    rating: 4.8,
    reviewCount: 124,
    reviews: [
      { id: 'r1', author: 'Alex M.', rating: 5, date: '2026-08-10', text: 'Perfect fit and the material feels premium.' },
      { id: 'r2', author: 'Sarah K.', rating: 4, date: '2026-07-22', text: 'Great everyday cap. Looks even better in person.' },
    ],
    stock: 45,
    tags: ['cap', 'street', 'best-seller'],
    style: 'Street',
    featured: true,
    isBestSeller: true,
  },
  {
    id: 'hat-002',
    name: 'Minimal Beige Bucket Hat',
    slug: 'minimal-beige-bucket-hat',
    category: 'hat',
    priceUSD: 28,
    description:
      'Soft cotton bucket hat in a versatile beige tone. Lightweight, breathable, and the ultimate companion for sunny weekends.',
    images: [
      '/images/products/hat-beige.svg',
      '/images/products/hat-white.svg'
    ],
    colors: ['Beige', 'Black', 'White'],
    sizes: ['S/M', 'L/XL'],
    rating: 4.6,
    reviewCount: 89,
    reviews: [
      { id: 'r3', author: 'Jordan P.', rating: 5, date: '2026-08-05', text: 'Love the minimal vibe. Goes with everything.' },
    ],
    stock: 32,
    tags: ['bucket', 'summer', 'minimal'],
    style: 'Minimal',
    featured: true,
  },
  {
    id: 'hat-003',
    name: 'Classic Wool Fedora',
    slug: 'classic-wool-fedora',
    category: 'hat',
    priceUSD: 79,
    description:
      'Timeless wool fedora with a structured brim and signature ribbon band. A refined choice for elevated everyday looks.',
    images: [
      '/images/products/hat-fedora.svg',
      '/images/products/hat-white.svg'
    ],
    colors: ['Brown', 'Black', 'Beige'],
    sizes: ['S', 'M', 'L'],
    rating: 4.9,
    reviewCount: 67,
    reviews: [
      { id: 'r4', author: 'Morgan L.', rating: 5, date: '2026-07-30', text: 'Classy and well-made. My new favorite hat.' },
    ],
    stock: 18,
    tags: ['fedora', 'classic', 'wool'],
    style: 'Classic',
    featured: true,
    isLimited: true,
  },
  {
    id: 'hat-004',
    name: 'Sport Performance Cap',
    slug: 'sport-performance-cap',
    category: 'hat',
    priceUSD: 32,
    description:
      'Engineered for movement. Moisture-wicking fabric, laser-cut perforations, and a secure fit for workouts and weekends.',
    images: [
      '/images/products/hat-sport.svg',
      '/images/products/hat-blue.svg'
    ],
    colors: ['Black', 'Blue', 'White'],
    sizes: ['One Size'],
    rating: 4.7,
    reviewCount: 156,
    reviews: [
      { id: 'r5', author: 'Casey R.', rating: 5, date: '2026-08-12', text: 'Stays dry during runs. Highly recommend.' },
    ],
    stock: 60,
    tags: ['cap', 'sport', 'performance'],
    style: 'Sport',
    featured: false,
  },
  {
    id: 'hat-005',
    name: 'Luxury Leather Cap',
    slug: 'luxury-leather-cap',
    category: 'hat',
    priceUSD: 120,
    oldPriceUSD: 145,
    description:
      'Hand-finished leather cap with brushed metal hardware. A bold statement piece that brings edge to any outfit.',
    images: [
      '/images/products/hat-luxury.svg',
      '/images/products/hat-black.svg'
    ],
    colors: ['Black', 'Brown'],
    sizes: ['One Size'],
    rating: 4.9,
    reviewCount: 42,
    reviews: [
      { id: 'r6', author: 'Drew T.', rating: 5, date: '2026-06-18', text: 'Worth every penny. The leather is incredible.' },
    ],
    stock: 12,
    tags: ['cap', 'leather', 'luxury'],
    style: 'Luxury',
    featured: true,
    isLimited: true,
  },
  {
    id: 'hat-006',
    name: 'Casual Knit Beanie',
    slug: 'casual-knit-beanie',
    category: 'hat',
    priceUSD: 24,
    description:
      'Chunky rib-knit beanie in neutral tones. Cozy, breathable, and effortlessly cool for everyday wear.',
    images: [
      '/images/products/beanie.svg',
      '/images/products/hat-beige.svg'
    ],
    colors: ['Black', 'Beige', 'Green', 'Blue'],
    sizes: ['One Size'],
    rating: 4.5,
    reviewCount: 210,
    reviews: [
      { id: 'r7', author: 'Riley B.', rating: 4, date: '2026-05-14', text: 'Warm and soft. Great for chilly mornings.' },
    ],
    stock: 80,
    tags: ['beanie', 'casual', 'winter'],
    style: 'Casual',
    featured: false,
  },
  {
    id: 'hat-007',
    name: 'Street Camo Cap',
    slug: 'street-camo-cap',
    category: 'hat',
    priceUSD: 36,
    description:
      'Rugged camo pattern with a matte black snap closure. Built for those who live loud and dress sharper.',
    images: [
      '/images/products/hat-camo.svg',
      '/images/products/hat-black.svg'
    ],
    colors: ['Green', 'Black'],
    sizes: ['One Size'],
    rating: 4.6,
    reviewCount: 95,
    reviews: [
      { id: 'r8', author: 'Taylor N.', rating: 5, date: '2026-07-08', text: 'Sick design. Gets compliments every time.' },
    ],
    stock: 28,
    tags: ['cap', 'street', 'camo'],
    style: 'Street',
    featured: false,
  },
  {
    id: 'hat-008',
    name: 'Classic Straw Hat',
    slug: 'classic-straw-hat',
    category: 'hat',
    priceUSD: 42,
    description:
      'Wide-brim straw hat with a minimalist black band. Your go-to for beach days, brunches, and summer escapes.',
    images: [
      '/images/products/hat-straw.svg',
      '/images/products/hat-beige.svg'
    ],
    colors: ['Beige', 'Brown'],
    sizes: ['S/M', 'L/XL'],
    rating: 4.7,
    reviewCount: 73,
    reviews: [
      { id: 'r9', author: 'Sam W.', rating: 5, date: '2026-08-01', text: 'Perfect summer essential. Light and stylish.' },
    ],
    stock: 22,
    tags: ['straw', 'summer', 'classic'],
    style: 'Classic',
    featured: false,
  },
  {
    id: 'hat-009',
    name: 'Minimal White Cap',
    slug: 'minimal-white-cap',
    category: 'hat',
    priceUSD: 30,
    description:
      'Crisp white cap with tonal stitching. Clean lines and a curved brim make it a wardrobe staple.',
    images: [
      '/images/products/hat-white.svg',
      '/images/products/hat-cap1.svg'
    ],
    colors: ['White', 'Black'],
    sizes: ['One Size'],
    rating: 4.6,
    reviewCount: 108,
    reviews: [
      { id: 'r10', author: 'Jamie H.', rating: 4, date: '2026-06-25', text: 'Clean and minimal. Exactly what I wanted.' },
    ],
    stock: 50,
    tags: ['cap', 'minimal', 'summer'],
    style: 'Minimal',
    featured: true,
    isNew: true,
  },
  {
    id: 'hat-010',
    name: 'Vintage Brown Trucker',
    slug: 'vintage-brown-trucker',
    category: 'hat',
    priceUSD: 29,
    description:
      'Retro mesh-back trucker cap in a worn brown wash. Nostalgic attitude with modern comfort.',
    images: [
      '/images/products/hat-trucker.svg',
      '/images/products/hat-luxury.svg'
    ],
    colors: ['Brown', 'Black', 'Beige'],
    sizes: ['One Size'],
    rating: 4.4,
    reviewCount: 64,
    reviews: [
      { id: 'r11', author: 'Quinn S.', rating: 4, date: '2026-07-14', text: 'Vintage look without being cheap.' },
    ],
    stock: 35,
    tags: ['trucker', 'vintage', 'casual'],
    style: 'Casual',
    featured: false,
  },
  {
    id: 'glass-001',
    name: 'Noir Aviator Sunglasses',
    slug: 'noir-aviator-sunglasses',
    category: 'glasses',
    priceUSD: 68,
    description:
      'Iconic aviator silhouette with jet-black lenses and a slim metal frame. Timeless, confident, and endlessly wearable.',
    images: [
      '/images/products/glasses-aviator.svg',
      '/images/products/glasses-black.svg'
    ],
    colors: ['Black', 'Brown'],
    sizes: ['One Size'],
    rating: 4.8,
    reviewCount: 132,
    reviews: [
      { id: 'r12', author: 'Chris D.', rating: 5, date: '2026-08-09', text: 'Classic aviators with premium feel.' },
    ],
    stock: 40,
    tags: ['sunglasses', 'aviator', 'best-seller'],
    style: 'Classic',
    featured: true,
    isBestSeller: true,
  },
  {
    id: 'glass-002',
    name: 'Minimal Round Glasses',
    slug: 'minimal-round-glasses',
    category: 'glasses',
    priceUSD: 55,
    description:
      'Ultra-light round frames with clear lenses. A quiet, intellectual aesthetic for minimal wardrobes.',
    images: [
      '/images/products/glasses-round.svg',
      '/images/products/glasses-clear.svg'
    ],
    colors: ['Black', 'Beige', 'Brown'],
    sizes: ['One Size'],
    rating: 4.7,
    reviewCount: 98,
    reviews: [
      { id: 'r13', author: 'Peyton J.', rating: 5, date: '2026-07-28', text: 'So light I forget I am wearing them.' },
    ],
    stock: 55,
    tags: ['glasses', 'minimal', 'round'],
    style: 'Minimal',
    featured: true,
  },
  {
    id: 'glass-003',
    name: 'Classic Tortoise Sunglasses',
    slug: 'classic-tortoise-sunglasses',
    category: 'glasses',
    priceUSD: 72,
    description:
      'Hand-polished acetate frames in warm tortoise. Brown gradient lenses complete the vintage-modern look.',
    images: [
      '/images/products/glasses-tortoise.svg',
      '/images/products/glasses-brown.svg'
    ],
    colors: ['Brown', 'Black'],
    sizes: ['One Size'],
    rating: 4.9,
    reviewCount: 87,
    reviews: [
      { id: 'r14', author: 'Avery K.', rating: 5, date: '2026-08-02', text: 'The tortoise pattern is stunning in person.' },
    ],
    stock: 25,
    tags: ['sunglasses', 'tortoise', 'classic'],
    style: 'Classic',
    featured: true,
    isLimited: true,
  },
  {
    id: 'glass-004',
    name: 'Sport Wrap Sunglasses',
    slug: 'sport-wrap-sunglasses',
    category: 'glasses',
    priceUSD: 64,
    description:
      'Wraparound sport frames with polarized lenses. Grip temples and lightweight build keep up with every pace.',
    images: [
      '/images/products/glasses-sport.svg',
      '/images/products/glasses-blue.svg'
    ],
    colors: ['Black', 'Blue', 'White'],
    sizes: ['One Size'],
    rating: 4.7,
    reviewCount: 144,
    reviews: [
      { id: 'r15', author: 'Logan M.', rating: 5, date: '2026-08-11', text: 'No slip during cycling. Great coverage.' },
    ],
    stock: 48,
    tags: ['sunglasses', 'sport', 'polarized'],
    style: 'Sport',
    featured: false,
  },
  {
    id: 'glass-005',
    name: 'Luxury Gold Frame Glasses',
    slug: 'luxury-gold-frame-glasses',
    category: 'glasses',
    priceUSD: 145,
    description:
      'Gold-plated titanium frames with premium lenses. Refined detailing for those who appreciate quiet luxury.',
    images: [
      '/images/products/glasses-gold.svg',
      '/images/products/glasses-round.svg'
    ],
    colors: ['Gold', 'Black'],
    sizes: ['One Size'],
    rating: 5,
    reviewCount: 38,
    reviews: [
      { id: 'r16', author: 'Blake R.', rating: 5, date: '2026-06-30', text: 'Absolutely luxurious. Feels expensive.' },
    ],
    stock: 10,
    tags: ['glasses', 'gold', 'luxury'],
    style: 'Luxury',
    featured: true,
    isLimited: true,
  },
  {
    id: 'glass-006',
    name: 'Casual Wayfarer Sunglasses',
    slug: 'casual-wayfarer-sunglasses',
    category: 'glasses',
    priceUSD: 58,
    description:
      'The forever classic wayfarer shape in matte black. Versatile enough for city days and weekend road trips.',
    images: [
      '/images/products/glasses-wayfarer.svg',
      '/images/products/glasses-aviator.svg'
    ],
    colors: ['Black', 'Brown', 'Blue'],
    sizes: ['One Size'],
    rating: 4.6,
    reviewCount: 175,
    reviews: [
      { id: 'r17', author: 'Hayden P.', rating: 4, date: '2026-07-19', text: 'Classic style, solid build. Love them.' },
    ],
    stock: 70,
    tags: ['sunglasses', 'wayfarer', 'casual'],
    style: 'Casual',
    featured: false,
  },
  {
    id: 'glass-007',
    name: 'Street Oversized Sunglasses',
    slug: 'street-oversized-sunglasses',
    category: 'glasses',
    priceUSD: 62,
    oldPriceUSD: 75,
    description:
      'Bold oversized frames with dark tinted lenses. Designed to turn sidewalks into runways.',
    images: [
      '/images/products/glasses-oversized.svg',
      '/images/products/glasses-tortoise.svg'
    ],
    colors: ['Black', 'Brown', 'Beige'],
    sizes: ['One Size'],
    rating: 4.8,
    reviewCount: 112,
    reviews: [
      { id: 'r18', author: 'Kendall W.', rating: 5, date: '2026-08-06', text: 'These are IT. So flattering and bold.' },
    ],
    stock: 30,
    tags: ['sunglasses', 'oversized', 'street'],
    style: 'Street',
    featured: true,
  },
  {
    id: 'glass-008',
    name: 'Classic Clubmaster Sunglasses',
    slug: 'classic-clubmaster-sunglasses',
    category: 'glasses',
    priceUSD: 66,
    description:
      'Half-rim clubmaster frames with gold accents and dark lenses. A smart silhouette that never dates.',
    images: [
      '/images/products/glasses-clubmaster.svg',
      '/images/products/glasses-gold.svg'
    ],
    colors: ['Black', 'Brown'],
    sizes: ['One Size'],
    rating: 4.7,
    reviewCount: 81,
    reviews: [
      { id: 'r19', author: 'Reese T.', rating: 5, date: '2026-07-12', text: 'Very classy. Great for formal looks.' },
    ],
    stock: 36,
    tags: ['sunglasses', 'clubmaster', 'classic'],
    style: 'Classic',
    featured: false,
  },
  {
    id: 'glass-009',
    name: 'Minimal Clear Frame Glasses',
    slug: 'minimal-clear-frame-glasses',
    category: 'glasses',
    priceUSD: 52,
    description:
      'Crystal-clear acetate frames with a barely-there feel. Modern, transparent, and endlessly adaptable.',
    images: [
      '/images/products/glasses-clear.svg',
      '/images/products/glasses-sport.svg'
    ],
    colors: ['White', 'Beige', 'Black'],
    sizes: ['One Size'],
    rating: 4.5,
    reviewCount: 69,
    reviews: [
      { id: 'r20', author: 'Noah C.', rating: 4, date: '2026-06-22', text: 'Subtle and modern. Goes with any outfit.' },
    ],
    stock: 42,
    tags: ['glasses', 'clear', 'minimal'],
    style: 'Minimal',
    featured: false,
    isNew: true,
  },
  {
    id: 'glass-010',
    name: 'Blue Mirror Sport Sunglasses',
    slug: 'blue-mirror-sport-sunglasses',
    category: 'glasses',
    priceUSD: 70,
    description:
      'Performance frames with blue mirror lenses. Maximum UV protection and a locked-in fit for active days.',
    images: [
      '/images/products/glasses-mirror.svg',
      '/images/products/glasses-aviator.svg'
    ],
    colors: ['Blue', 'Black', 'White'],
    sizes: ['One Size'],
    rating: 4.7,
    reviewCount: 120,
    reviews: [
      { id: 'r21', author: 'Skyler B.', rating: 5, date: '2026-08-13', text: 'Great for running and hiking. Super clear.' },
    ],
    stock: 38,
    tags: ['sunglasses', 'sport', 'mirror'],
    style: 'Sport',
    featured: false,
  },
];
