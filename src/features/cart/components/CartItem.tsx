import { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../../stores/cartStore';
import { getProductById } from '../../../services/catalog/productService';
import { formatPrice } from '../../../lib/format';
import { useLanguageStore } from '../../../stores/languageStore';
import type { CartItem as CartItemType } from '../../../types';
import { FALLBACK_IMAGE } from '../../../constants/app';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const [imageError, setImageError] = useState(false);
  const { updateQuantity, removeItem } = useCartStore();
  const product = getProductById(item.productId);
  const language = useLanguageStore((state) => state.language);
  const currency = language === 'fa' ? 'rial' : 'usd';

  const decreaseLabel = language === 'fa' ? 'کاهش تعداد' : 'Decrease quantity';
  const increaseLabel = language === 'fa' ? 'افزایش تعداد' : 'Increase quantity';
  const removeLabel = language === 'fa' ? 'حذف محصول' : 'Remove item';

  if (!product) return null;

  return (
    <div className="flex gap-4 py-4">
      <Link to={`/product/${product.slug}`} className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-background">
        <img
          src={imageError ? FALLBACK_IMAGE : product.primaryImage || product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link to={`/product/${product.slug}`}>
            <h3 className="text-sm font-medium text-primary hover:underline">{product.name}</h3>
          </Link>
          <p className="text-xs text-text-secondary">
            {item.color} / {item.size}
          </p>
          <p className="mt-1 text-sm font-semibold text-primary">
            {formatPrice(product.priceUSD, currency)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-border bg-white">
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}
              className="px-2 py-1 text-primary"
              aria-label={decreaseLabel}
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm text-primary">{item.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
              className="px-2 py-1 text-primary"
              aria-label={increaseLabel}
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeItem(item.productId, item.color, item.size)}
            className="text-text-secondary transition-colors hover:text-red-500"
            aria-label={removeLabel}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
