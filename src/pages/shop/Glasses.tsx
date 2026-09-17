import { useMemo } from 'react';
import { SEO } from '../../components/ui/SEO';
import { ProductGrid } from '../../components/product/ProductGrid';
import { getProductsByCategory } from '../../services/catalog/productService';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';

export function Glasses() {
  const glasses = useMemo(() => getProductsByCategory('glasses'), []);
  const language = useLanguageStore((state) => state.language);

  return (
    <>
      <SEO
        title={t('nav.glasses', language)}
        description="Shop premium glasses and sunglasses at VYRO."
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-semibold uppercase tracking-wider text-primary md:text-4xl">{t('nav.glasses', language)}</h1>
          <p className="mt-3 text-text-secondary">{"عینک‌هایی که استایل شما را کامل می‌کنند"}</p>
        </div>
        <ProductGrid products={glasses} />
      </div>
    </>
  );
}
