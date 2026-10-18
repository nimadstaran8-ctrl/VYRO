import { Link } from 'react-router-dom';
import { ShoppingBag, Check } from 'lucide-react';
import { ReusableImage } from '../../../components/ui/ReusableImage';
import { Price } from '../../../components/ui/Price';
import { Button } from '../../../components/ui/Button';
import { useCartStore } from '../../../stores/cartStore';
import { useLanguageStore } from '../../../stores/languageStore';
import { t } from '../../../lib/i18n';
import { getReasonMessage } from '../services/recommendationEngine';
import type { Product } from '../../../types';

interface AIStylistRecommendationCardProps {
  product: Product;
  score: number;
  reasons: string[];
}

export function AIStylistRecommendationCard({
  product,
  score,
  reasons,
}: AIStylistRecommendationCardProps) {
  const { addItem } = useCartStore();
  const language = useLanguageStore((state) => state.language);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      quantity: 1,
      color: product.colors[0],
      size: product.sizes[0],
    });
  };

  const inStock = product.stock > 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border dark:border-white/10 bg-background dark:bg-white/5 backdrop-blur-sm transition-all hover:border-cyan-400/30 hover:bg-black/5 dark:hover:bg-white/[0.07]">
      <Link
        to={`/product/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-black/5 dark:bg-black/20"
        aria-label={product.name}
      >
        <ReusableImage
          src={product.primaryImage || product.images[0]}
          alt={product.name}
          aspectRatio="1 / 1"
          className="h-full w-full"
          imgClassName="transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute start-3 top-3 rounded-full bg-cyan-400 px-2.5 py-1 text-xs font-bold text-slate-950">
          {score}%
        </div>
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-surface dark:bg-slate-900 px-3 py-1 text-xs font-medium text-primary dark:text-white">
              {t('product.outOfStock', language)}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {reasons.slice(0, 3).map((reason) => (
            <span
              key={reason}
              className="inline-flex items-center gap-1 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300"
            >
              <Check size={10} />
              {getReasonMessage(reason, language)}
            </span>
          ))}
        </div>

        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-primary dark:text-white transition-colors hover:text-cyan-300">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-xs text-text-secondary dark:text-slate-400">
          {product.description}
        </p>

        <div className="mt-auto pt-3">
          <Price price={product.priceUSD} oldPrice={product.oldPriceUSD} size="sm" />
          <Button
            variant="accent"
            size="sm"
            className="mt-3 w-full"
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            <ShoppingBag size={14} className="ltr:mr-1.5 rtl:ml-1.5" />
            {t('product.addToCart', language)}
          </Button>
        </div>
      </div>
    </div>
  );
}
