import { ProductCard } from './ProductCard';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';
import type { Product } from '../../types';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

export function ProductGrid({ products, emptyMessage }: ProductGridProps) {
  const language = useLanguageStore((state) => state.language);
  const defaultMessage = t('common.noResults', language);
  const message = emptyMessage || defaultMessage;

  if (products.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl bg-white p-8 text-center">
        <p className="text-text-secondary">{message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
