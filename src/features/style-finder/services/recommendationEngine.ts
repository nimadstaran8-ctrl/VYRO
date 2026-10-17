import type { Product, Style, Color } from '../../../types';
import type {
  Budget,
  Occasion,
  StyleFinderAnswers,
  ScoringWeights,
  ScoredRecommendation,
  OutfitSet,
  RecommendationResult,
  MissingAttributeReport,
  AIStylistSettings,
} from '../types';
import { DEFAULT_AI_STYLIST_SETTINGS, DEFAULT_WEIGHTS } from '../types';

const budgetRanges: Record<Budget, [number, number]> = {
  'under-30': [0, 30],
  '30-60': [30, 60],
  '60-100': [60, 100],
  '100-plus': [100, Number.MAX_SAFE_INTEGER],
};

export function getBudgetRange(budget: Budget): [number, number] {
  return budgetRanges[budget];
}

function sumWeights(weights: ScoringWeights): number {
  return Object.values(weights).reduce((a, b) => a + b, 0);
}

function normalizeWeights(weights: ScoringWeights): ScoringWeights {
  const total = sumWeights(weights);
  if (total <= 0) return { ...DEFAULT_WEIGHTS };
  const scale = 100 / total;
  return {
    styleMatch: weights.styleMatch * scale,
    colorMatch: weights.colorMatch * scale,
    categoryMatch: weights.categoryMatch * scale,
    budgetFit: weights.budgetFit * scale,
    occasionMatch: weights.occasionMatch * scale,
    rating: weights.rating * scale,
    bestSeller: weights.bestSeller * scale,
    featured: weights.featured * scale,
    inStock: weights.inStock * scale,
  };
}

function isInBudget(product: Product, budget: Budget): boolean {
  const [min, max] = budgetRanges[budget];
  return product.priceUSD >= min && product.priceUSD <= max;
}

function getColorMatches(product: Product, colors: Color[]): Color[] {
  if (colors.length === 0) return [];
  return product.colors.filter((c: Color) => colors.includes(c));
}

function getStyleOccasionHints(style: Style): Occasion[] {
  switch (style) {
    case 'Sport':
      return ['outdoor', 'travel'];
    case 'Luxury':
      return ['special'];
    case 'Classic':
      return ['special', 'everyday'];
    case 'Casual':
    case 'Street':
      return ['everyday'];
    case 'Minimal':
      return ['everyday', 'travel'];
    default:
      return ['everyday'];
  }
}

function getTagOccasionHints(tags: string[]): Occasion[] {
  const hints = new Set<Occasion>();
  const lowerTags = tags.map((t) => t.toLowerCase());
  for (const tag of lowerTags) {
    if (['sport', 'performance', 'polarized', 'mirror', 'wrap'].includes(tag)) {
      hints.add('outdoor');
      hints.add('travel');
    }
    if (['luxury', 'leather', 'gold', 'limited', 'fedora'].includes(tag)) {
      hints.add('special');
    }
    if (['classic', 'tortoise', 'clubmaster', 'aviator'].includes(tag)) {
      hints.add('special');
      hints.add('everyday');
    }
    if (['casual', 'wayfarer', 'beanie', 'trucker', 'street', 'camo', 'oversized'].includes(tag)) {
      hints.add('everyday');
    }
    if (['minimal', 'clear', 'round', 'bucket'].includes(tag)) {
      hints.add('everyday');
      hints.add('travel');
    }
  }
  return Array.from(hints);
}

function getProductOccasionHints(product: Product): Occasion[] {
  const styleHints = getStyleOccasionHints(product.style);
  const tagHints = getTagOccasionHints(product.tags);
  const combined = new Set<Occasion>([...styleHints, ...tagHints]);
  return Array.from(combined);
}

function matchesOccasion(product: Product, occasion: Occasion | undefined): boolean {
  if (!occasion) return false;
  return getProductOccasionHints(product).includes(occasion);
}

function isProductValid(product: Product): boolean {
  return (
    Boolean(product.id) &&
    Boolean(product.name) &&
    typeof product.priceUSD === 'number' &&
    Number.isFinite(product.priceUSD) &&
    product.priceUSD > 0 &&
    Array.isArray(product.colors) &&
    product.colors.length > 0 &&
    Boolean(product.style)
  );
}

function scoreProduct(
  product: Product,
  answers: StyleFinderAnswers,
  weights: ScoringWeights,
  settings: AIStylistSettings
): { score: number; maxScore: number; reasons: string[] } {
  const normalized = normalizeWeights(weights);
  const reasons: string[] = [];
  let score = 0;

  if (answers.style && product.style === answers.style) {
    score += normalized.styleMatch;
    reasons.push('style-match');
  }

  if (answers.colors.length > 0) {
    const matches = getColorMatches(product, answers.colors);
    if (matches.length > 0) {
      const ratio = matches.length / answers.colors.length;
      score += normalized.colorMatch * ratio;
      reasons.push(matches.length === 1 ? 'color-match' : 'colors-match');
    }
  }

  if (answers.shoppingFor && answers.shoppingFor !== 'both') {
    if (product.category === answers.shoppingFor) {
      score += normalized.categoryMatch;
      reasons.push('category-match');
    }
  }

  if (answers.budget && isInBudget(product, answers.budget)) {
    score += normalized.budgetFit;
    reasons.push('budget-fit');
  }

  if (answers.occasion && matchesOccasion(product, answers.occasion)) {
    score += normalized.occasionMatch;
    reasons.push('occasion-hint');
  }

  if (product.rating >= 4.8) {
    score += normalized.rating;
    reasons.push('highly-rated');
  } else if (product.rating >= 4.5) {
    score += normalized.rating * 0.5;
    reasons.push('well-rated');
  }

  if (product.isBestSeller) {
    score += normalized.bestSeller;
    reasons.push('best-seller');
  }

  if (product.featured) {
    score += normalized.featured;
    reasons.push('featured');
  }

  if (settings.requireStock && product.stock > 0) {
    score += normalized.inStock;
    reasons.push('in-stock');
  }

  const maxScore = 100;
  return { score: Math.min(maxScore, Math.round(score)), maxScore, reasons };
}

function filterProducts(
  products: Product[],
  answers: StyleFinderAnswers,
  settings: AIStylistSettings
): { passed: Product[]; rejectedBy: Record<string, number> } {
  const rejectedBy: Record<string, number> = {
    'invalid-product': 0,
    'disabled-style': 0,
    'category': 0,
    'budget': 0,
    'stock': 0,
  };

  const passed = products.filter((product) => {
    if (!isProductValid(product)) {
      rejectedBy['invalid-product']++;
      return false;
    }

    if (answers.style && !settings.enabledStyles.includes(answers.style)) {
      rejectedBy['disabled-style']++;
      return false;
    }

    if (answers.shoppingFor && answers.shoppingFor !== 'both' && product.category !== answers.shoppingFor) {
      rejectedBy['category']++;
      return false;
    }

    if (answers.budget && !isInBudget(product, answers.budget)) {
      rejectedBy['budget']++;
      return false;
    }

    if (settings.requireStock && product.stock <= 0) {
      rejectedBy['stock']++;
      return false;
    }

    return true;
  });

  return { passed, rejectedBy };
}

function buildRelaxationHints(
  answers: StyleFinderAnswers,
  rejectedBy: Record<string, number>,
  totalProducts: number,
  resultCount: number
): string[] {
  const hints: string[] = [];

  if (resultCount === 0) {
    hints.push('no-matches');
    if (rejectedBy['budget'] > 0) hints.push('relax-budget');
    if (rejectedBy['category'] > 0 && answers.shoppingFor && answers.shoppingFor !== 'both') {
      hints.push('try-both-categories');
    }
    if (answers.colors.length > 0 && rejectedBy['invalid-product'] + rejectedBy['disabled-style'] < totalProducts) {
      hints.push('relax-colors');
    }
    if (answers.occasion) hints.push('relax-occasion');
    return hints;
  }

  if (resultCount < 3) {
    hints.push('few-matches');
    if (rejectedBy['budget'] > 0) hints.push('relax-budget');
    if (answers.colors.length > 1) hints.push('relax-colors');
  }

  return hints;
}

function buildOutfits(
  items: ScoredRecommendation[],
  products: Product[],
  limit: number
): OutfitSet[] {
  const scoredMap = new Map(items.map((i) => [i.productId, i]));
  const hats = products.filter((p) => p.category === 'hat' && scoredMap.has(p.id));
  const glasses = products.filter((p) => p.category === 'glasses' && scoredMap.has(p.id));

  if (hats.length === 0 || glasses.length === 0) return [];

  const outfits: OutfitSet[] = [];

  for (const hat of hats.slice(0, limit * 2)) {
    for (const glass of glasses.slice(0, limit * 2)) {
      if (outfits.length >= limit) break;

      const hatScore = scoredMap.get(hat.id)?.score ?? 0;
      const glassesScore = scoredMap.get(glass.id)?.score ?? 0;
      const sharedColors = hat.colors.filter((c: Color) => glass.colors.includes(c));
      const sharedStyle = hat.style === glass.style;

      const reasons: string[] = [];
      let coordinationScore = 0;

      if (sharedStyle) {
        coordinationScore += 15;
        reasons.push('shared-style');
      }

      if (sharedColors.length > 0) {
        coordinationScore += 10;
        reasons.push('shared-color');
      }

      const score = Math.min(100, Math.round((hatScore + glassesScore) / 2 + coordinationScore));
      outfits.push({ hatId: hat.id, glassesId: glass.id, score, reasons });
    }
  }

  return outfits
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function generateRecommendations(
  products: Product[],
  answers: StyleFinderAnswers,
  settings: AIStylistSettings = DEFAULT_AI_STYLIST_SETTINGS
): RecommendationResult {
  const { passed, rejectedBy } = filterProducts(products, answers, settings);

  const scored = passed
    .map((product) => {
      const { score, maxScore, reasons } = scoreProduct(product, answers, settings.weights, settings);
      return {
        productId: product.id,
        score,
        maxScore,
        reasons,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, settings.maxRecommendations);

  const outfits =
    answers.shoppingFor === 'both'
      ? buildOutfits(scored, passed, Math.min(3, settings.maxRecommendations))
      : [];

  const relaxationHints = buildRelaxationHints(
    answers,
    rejectedBy,
    products.length,
    scored.length
  );

  return {
    items: scored,
    outfits,
    relaxationHints,
    appliedFilters: {
      category: answers.shoppingFor,
      budgetRange: answers.budget ? budgetRanges[answers.budget] : undefined,
      style: answers.style,
      colors: answers.colors,
      occasion: answers.occasion,
    },
  };
}

export function findProductsWithMissingAttributes(
  products: Product[]
): MissingAttributeReport[] {
  return products
    .map((product) => {
      const missing: string[] = [];
      if (!product.style) missing.push('style');
      if (!Array.isArray(product.colors) || product.colors.length === 0) missing.push('colors');
      if (!Array.isArray(product.sizes) || product.sizes.length === 0) missing.push('sizes');
      if (typeof product.priceUSD !== 'number' || !Number.isFinite(product.priceUSD) || product.priceUSD <= 0) {
        missing.push('price');
      }
      if (typeof product.stock !== 'number' || !Number.isFinite(product.stock)) {
        missing.push('stock');
      }
      if (!product.images || product.images.length === 0) missing.push('images');
      return { productId: product.id, name: product.name, missing };
    })
    .filter((report) => report.missing.length > 0);
}

export function getReasonMessage(reason: string, language: 'fa' | 'en'): string {
  const messages: Record<string, Record<'fa' | 'en', string>> = {
    'style-match': { fa: 'استایل انتخابی شما را دارد', en: 'Matches your chosen style' },
    'color-match': { fa: 'رنگ انتخابی شما را دارد', en: 'Available in your chosen color' },
    'colors-match': { fa: 'چند رنگ انتخابی شما را دارد', en: 'Available in several of your chosen colors' },
    'category-match': { fa: 'در دسته‌بندی انتخابی شما قرار دارد', en: 'In your chosen category' },
    'budget-fit': { fa: 'در محدوده بودجه شماست', en: 'Fits your budget' },
    'occasion-hint': { fa: 'مناسب مناسبت انتخابی شماست', en: 'Suits your chosen occasion' },
    'highly-rated': { fa: 'امتیاز عالی دارد', en: 'Top rated' },
    'well-rated': { fa: 'امتیاز خوبی دارد', en: 'Well rated' },
    'best-seller': { fa: 'پرفروش است', en: 'Best seller' },
    'featured': { fa: 'محصول منتخب است', en: 'Featured product' },
    'in-stock': { fa: 'موجود در انبار است', en: 'In stock' },
    'shared-style': { fa: 'استایل مشترک', en: 'Shared style' },
    'shared-color': { fa: 'رنگ مشترک', en: 'Shared color' },
  };
  return messages[reason]?.[language] ?? reason;
}

export function getRelaxationHintMessage(hint: string, language: 'fa' | 'en'): string {
  const messages: Record<string, Record<'fa' | 'en', string>> = {
    'no-matches': { fa: 'محصولی با همه ترجیحات شما یافت نشد.', en: 'No products match all your preferences.' },
    'few-matches': { fa: 'تعداد نتایج کم است؛ می‌توانید فیلترها را بازتر کنید.', en: 'Only a few matches found; try loosening your filters.' },
    'relax-budget': { fa: 'بودجه را افزایش دهید تا گزینه‌های بیشتری پیدا کنید.', en: 'Try a higher budget to see more options.' },
    'relax-colors': { fa: 'رنگ‌های بیشتری انتخاب کنید یا فیلتر رنگ را حذف کنید.', en: 'Select more colors or remove the color filter.' },
    'relax-occasion': { fa: 'فیلتر مناسبت را حذف کنید تا گزینه‌های بیشتری ببینید.', en: 'Remove the occasion filter to see more options.' },
    'try-both-categories': { fa: 'جستجو در هر دو دسته‌بندی کلاه و عینک را امتحان کنید.', en: 'Try searching across both hats and sunglasses.' },
  };
  return messages[hint]?.[language] ?? hint;
}
