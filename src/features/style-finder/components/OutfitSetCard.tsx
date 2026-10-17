import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Check } from 'lucide-react';
import { ReusableImage } from '../../../components/ui/ReusableImage';
import { Price } from '../../../components/ui/Price';
import { Button } from '../../../components/ui/Button';
import { useCartStore } from '../../../stores/cartStore';
import { useLanguageStore } from '../../../stores/languageStore';
import { t } from '../../../lib/i18n';
import { getReasonMessage } from '../services/recommendationEngine';
import type { Product } from '../../../types';

interface OutfitSetCardProps {
  hat: Product;
  glasses: Product;
  score: number;
  reasons: string[];
}

export function OutfitSetCard({ hat, glasses, score, reasons }: OutfitSetCardProps) {
  const { addItem } = useCartStore();
  const language = useLanguageStore((state) => state.language);

  const handleAddSet = () => {
    addItem({
      productId: hat.id,
      quantity: 1,
      color: hat.colors[0],
      size: hat.sizes[0],
    });
    addItem({
      productId: glasses.id,
      quantity: 1,
      color: glasses.colors[0],
      size: glasses.sizes[0],
    });
  };

  const bothInStock = hat.stock > 0 && glasses.stock > 0;
  const setTotal = hat.priceUSD + glasses.priceUSD;

  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-950/30 to-slate-900/50 p-4 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-cyan-400" />
          <span className="text-sm font-medium text-white">
            {t('aiStylist.completeSet', language)}
          </span>
        </div>
        <span className="rounded-full bg-cyan-400 px-2.5 py-1 text-xs font-bold text-slate-950">
          {score}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to={`/product/${hat.slug}`}
          className="group relative overflow-hidden rounded-xl bg-black/20"
          aria-label={hat.name}
        >
          <ReusableImage
            src={hat.primaryImage || hat.images[0]}
            alt={hat.name}
            aspectRatio="1 / 1"
            className="h-full w-full"
            imgClassName="transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <Link
          to={`/product/${glasses.slug}`}
          className="group relative overflow-hidden rounded-xl bg-black/20"
          aria-label={glasses.name}
        >
          <ReusableImage
            src={glasses.primaryImage || glasses.images[0]}
            alt={glasses.name}
            aspectRatio="1 / 1"
            className="h-full w-full"
            imgClassName="transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium text-white">{hat.name}</p>
          <Price price={hat.priceUSD} oldPrice={hat.oldPriceUSD} size="sm" />
        </div>
        <div>
          <p className="font-medium text-white">{glasses.name}</p>
          <Price price={glasses.priceUSD} oldPrice={glasses.oldPriceUSD} size="sm" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {reasons.map((reason) => (
          <span
            key={reason}
            className="inline-flex items-center gap-1 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300"
          >
            <Check size={10} />
            {getReasonMessage(reason, language)}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <div>
          <p className="text-xs text-slate-400">{t('aiStylist.setTotal', language)}</p>
          <div className="text-lg font-semibold text-white">
            <Price price={setTotal} size="md" />
          </div>
        </div>
        <Button variant="accent" size="sm" onClick={handleAddSet} disabled={!bothInStock}>
          <ShoppingBag size={14} className="ltr:mr-1.5 rtl:ml-1.5" />
          {t('aiStylist.addSet', language)}
        </Button>
      </div>
    </div>
  );
}
