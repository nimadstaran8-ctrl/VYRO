import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Zap } from 'lucide-react';
import { SEO } from '../../components/ui/SEO';
import { Button } from '../../components/ui/Button';
import { ProductGallery } from '../../components/product/ProductGallery';
import { ColorOptions } from '../../components/product/ColorOptions';
import { Rating } from '../../components/ui/Rating';
import { Price } from '../../components/ui/Price';
import { Accordion } from '../../components/ui/Accordion';
import { WishlistButton } from '../../components/product/WishlistButton';
import { ProductGrid } from '../../components/product/ProductGrid';
import { getProductBySlug, getRelatedProducts } from '../../services/catalog/productService';
import { useCartStore } from '../../stores/cartStore';
import { useRecentlyViewedStore } from '../../stores/recentlyViewedStore';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';

export function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const product = getProductBySlug(slug || '');
  const { addItem } = useCartStore();
  const { addItem: addRecentlyViewed } = useRecentlyViewedStore();
  const language = useLanguageStore((state) => state.language);

  const [color, setColor] = useState(product?.colors[0] || '');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product.id);
    }
  }, [product, addRecentlyViewed]);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-primary">{t('errors.productNotFound', language)}</h1>
        <Button className="mt-6" asChild>
          <Link to="/shop">{t('cart.continueShopping', language)}</Link>
        </Button>
      </div>
    );
  }
  const related = getRelatedProducts(product, 4);

  const handleAddToCart = () => {
    addItem({ productId: product.id, color, size: product.sizes[0], quantity });
  };

  const handleBuyNow = () => {
    addItem({ productId: product.id, color, size: product.sizes[0], quantity });
    navigate('/checkout');
  };

  const accordionItems = [
    {
      id: 'details',
      title: t('product.details', language),
      content: <p>{product.description}</p>,
    },
    {
      id: 'size',
      title: t('product.size', language),
      content: (
        <p>
          {product.sizes.join(', ')}. Most pieces are designed with an adjustable or universal fit for everyday comfort.
        </p>
      ),
    },
    {
      id: 'shipping',
      title: t('product.details', language),
      content: <p>{t('product.freeShipping', language)}</p>,
    },
  ];

  return (
    <div key={product.id}>
      <SEO title={product.name} description={product.description} image={product.primaryImage || product.images[0]} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <ProductGallery images={product.images} alt={product.name} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-semibold text-primary md:text-3xl">{product.name}</h1>
                <WishlistButton productId={product.id} size={22} />
              </div>
              <div className="mt-2">
                <Rating value={product.rating} count={product.reviewCount} />
              </div>
              <div className="mt-4">
                <Price price={product.priceUSD} oldPrice={product.oldPriceUSD} size="lg" />
              </div>
              <p className="mt-4 text-text-secondary">{product.description}</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-primary">{t('product.color', language)}</label>
                <ColorOptions colors={product.colors} selected={color} onChange={setColor} />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-primary">{t('product.quantity', language)}</label>
                <div className="flex items-center border border-border rounded-lg bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-primary"
                    aria-label={t('product.quantity', language)}
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-primary">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="px-4 py-2 text-primary"
                    aria-label={t('product.quantity', language)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <Button onClick={handleAddToCart} className="flex-1">
                  <ShoppingBag size={18} className="mr-2" />
                  {t('product.addToCart', language)}
                </Button>
                <Button variant="accent" onClick={handleBuyNow} className="flex-1">
                  <Zap size={18} className="mr-2" />
                  {t('product.buyNow', language)}
                </Button>
              </div>
            </div>

            <div className="mt-10">
              <Accordion items={accordionItems} />
            </div>
          </motion.div>
        </div>

        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="mb-10 text-center text-2xl font-semibold uppercase tracking-wider text-primary md:text-3xl">
              {t('product.youMayAlsoLike', language)}
            </h2>
            <ProductGrid products={related} />
          </section>
        )}
      </div>
    </div>
  );
}
