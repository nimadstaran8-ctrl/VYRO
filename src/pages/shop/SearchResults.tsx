import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SEO } from '../../components/ui/SEO';
import { ProductGrid } from '../../components/product/ProductGrid';
import { Button } from '../../components/ui/Button';
import { searchProducts } from '../../services/catalog/productService';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const lowerQuery = query.trim().toLowerCase();
  const language = useLanguageStore((state) => state.language);

  const matchedProducts = useMemo(() => {
    if (!lowerQuery) return [];
    return searchProducts(query);
  }, [lowerQuery, query]);

  return (
    <>
      <SEO
        title={query ? `${t('search.title', language)}: ${query}` : t('search.title', language)}
        description={`Search results for "${query}" at VYRO.`}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold uppercase tracking-wider text-primary md:text-4xl">
          {t('search.title', language)}
        </h1>
        {query && <p className="mt-2 text-text-secondary">{t('search.resultsFor', language)} "{query}"</p>}

        <section className="mt-10">
          <h2 className="mb-6 text-lg font-semibold text-primary">
            {t('search.products', language)} ({matchedProducts.length})
          </h2>
          {matchedProducts.length > 0 ? (
            <ProductGrid products={matchedProducts} />
          ) : (
            <div className="rounded-2xl bg-white py-16 text-center">
              <p className="text-text-secondary">{language === 'fa' ? `محصولی برای "${query}" یافت نشد.` : `No products found for "${query}".`}</p>
              <Button className="mt-6" asChild>
                <Link to="/shop">{t('common.browseAll', language)}</Link>
              </Button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
