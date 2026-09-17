import { useState, useMemo } from 'react';
import { SEO } from '../../components/ui/SEO';
import { ProductGrid } from '../../components/product/ProductGrid';
import { getProducts } from '../../services/catalog/productService';
import { cn } from '../../lib/cn';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';
import type { Category } from '../../types';

type SimpleSort = 'featured' | 'newest' | 'price';

const filters = (lang: string) => [
  { label: t('product.all', lang as 'fa' | 'en'), value: 'all' as const },
  { label: t('nav.hats', lang as 'fa' | 'en'), value: 'hat' as const },
  { label: t('nav.glasses', lang as 'fa' | 'en'), value: 'glasses' as const },
];

const sortOptions = (lang: string) => [
  { label: t('sort.featured', lang as 'fa' | 'en'), value: 'featured' as SimpleSort },
  { label: t('sort.newest', lang as 'fa' | 'en'), value: 'newest' as SimpleSort },
  { label: t('sort.priceLow', lang as 'fa' | 'en'), value: 'price' as SimpleSort },
];

function sortProductsLocal(products: ReturnType<typeof getProducts>, sort: SimpleSort) {
  const sorted = [...products];
  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    case 'price':
      return sorted.sort((a, b) => a.priceUSD - b.priceUSD);
    case 'featured':
    default:
      return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
}

export function Shop() {
  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all');
  const [sort, setSort] = useState<SimpleSort>('featured');
  const language = useLanguageStore((state) => state.language);
  const allProducts = getProducts();
  const currentFilters = filters(language);
  const currentSortOptions = sortOptions(language);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return allProducts;
    return allProducts.filter((p) => p.category === activeFilter);
  }, [activeFilter, allProducts]);

  const sorted = useMemo(() => sortProductsLocal(filtered, sort), [filtered, sort]);

  return (
    <>
      <SEO
        title={t('nav.shop', language)}
        description="Shop all hats and glasses at VYRO. Find your vibe."
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-semibold uppercase tracking-wider text-primary md:text-4xl">
            {t('nav.shop', language)}
          </h1>
        </div>

        <div className="mb-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2 rounded-full bg-white p-1">
            {currentFilters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setActiveFilter(f.value)}
                className={cn(
                  'rounded-full px-5 py-2 text-sm font-medium transition-colors',
                  activeFilter === f.value
                    ? 'bg-primary text-white'
                    : 'text-primary hover:bg-background'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SimpleSort)}
              className="appearance-none rounded-full border border-border bg-white py-2 pl-5 pr-10 text-sm text-primary focus:border-primary focus:outline-none"
            >
              {currentSortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary rtl:left-3 rtl:right-auto rtl:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <ProductGrid products={sorted} />
      </div>
    </>
  );
}
