import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { SEO } from '../../components/ui/SEO';
import { Button } from '../../components/ui/Button';
import { Price } from '../../components/ui/Price';
import { Rating } from '../../components/ui/Rating';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useCartStore } from '../../stores/cartStore';
import { getProductById } from '../../services/catalog/productService';
import { truncate } from '../../lib/text';
import { FALLBACK_IMAGE } from '../../constants/app';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';

export function Wishlist() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const language = useLanguageStore((state) => state.language);

  const products = items.map((id) => getProductById(id)).filter(Boolean);

  return (
    <>
      <SEO
        title={t('nav.wishlist', language)}
        description="Save your favorite VYRO hats and sunglasses to your wishlist."
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold uppercase tracking-wider text-primary md:text-4xl">{t('nav.wishlist', language)}</h1>
            <p className="mt-2 text-text-secondary">{products.length} محصول ذخیره شده</p>
          </div>
          {products.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="text-sm text-text-secondary underline hover:text-primary"
            >
              {t('wishlist.clearAll', language) || 'پاک کردن همه'}
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center">
            <Heart size={48} className="text-border" />
            <h2 className="mt-4 text-lg font-medium text-primary">{t('wishlist.empty', language)}</h2>
            <p className="mt-1 text-text-secondary">{"محصولات مورد علاقه خود را ذخیره کنید و هر زمان به آن‌ها بازگردید"}</p>
            <Button className="mt-6" asChild>
              <Link to="/shop">{t('cart.continueShopping', language)}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) =>
              product ? (
                <WishlistProductCard key={product.id} product={product} onRemove={() => removeItem(product.id)} onAddToCart={() => addItem({ productId: product.id, color: product.colors[0], size: product.sizes[0], quantity: 1 })} />
              ) : null
            )}
          </div>
        )}
      </div>
    </>
  );
}

interface WishlistProductCardProps {
  product: NonNullable<ReturnType<typeof getProductById>>;
  onRemove: () => void;
  onAddToCart: () => void;
}

function WishlistProductCard({ product, onRemove, onAddToCart }: WishlistProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const language = useLanguageStore((state) => state.language);

  return (
    <div className="rounded-2xl bg-white p-3">
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden rounded-xl bg-background">
        <img
          src={imageError ? FALLBACK_IMAGE : product.primaryImage || product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      </Link>
      <div className="mt-3 flex flex-col gap-1">
        <Rating value={product.rating} count={product.reviewCount} size={12} />
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-primary hover:underline">{product.name}</h3>
        </Link>
        <p className="text-xs text-text-secondary">{truncate(product.description, 40)}</p>
        <Price price={product.priceUSD} oldPrice={product.oldPriceUSD} size="sm" />
        <div className="mt-3 flex gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={onAddToCart}
          >
            <ShoppingBag size={14} className="mr-1" />
            {t('common.add', language)}
          </Button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg border border-border p-2 text-text-secondary transition-colors hover:text-red-500"
            aria-label={t('wishlist.removeFromWishlist', language)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
