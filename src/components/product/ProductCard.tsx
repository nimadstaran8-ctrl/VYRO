import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Price } from '../ui/Price';
import { WishlistButton } from './WishlistButton';
import { useCartStore } from '../../stores/cartStore';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';
import { cn } from '../../lib/utils';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const FALLBACK_IMAGE = '/images/site/fallback.svg';

export function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [image2Error, setImage2Error] = useState(false);
  const { addItem } = useCartStore();
  const language = useLanguageStore((state) => state.language);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      quantity: 1,
      color: product.colors[0],
      size: product.sizes[0],
    });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImage2Error = () => {
    setImage2Error(true);
  };

  return (
    <motion.div
      className={cn('group flex flex-col', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-background"
        aria-label={product.name}
      >
        <motion.img
          src={imageError ? FALLBACK_IMAGE : product.primaryImage || product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover"
          style={{ aspectRatio: '1 / 1' }}
          animate={{ scale: isHovered ? 1.04 : 1 }}
          transition={{ duration: 0.5 }}
          loading="eager"
          onError={handleImageError}
        />
        {product.images.length > 1 && !image2Error && (
          <motion.img
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ aspectRatio: '1 / 1' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            loading="lazy"
            onError={handleImage2Error}
          />
        )}

        <div className="absolute end-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
          <WishlistButton productId={product.id} />
        </div>

        <motion.button
          type="button"
          onClick={handleQuickAdd}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 8 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-3 start-3 end-3 flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-white hover:bg-primary/90"
        >
          <ShoppingBag size={16} />
          {t('product.addToCart', language)}
        </motion.button>
      </Link>

      <div className="mt-4">
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-primary hover:underline">{product.name}</h3>
        </Link>
        <Price price={product.priceUSD} oldPrice={product.oldPriceUSD} size="sm" className="mt-1" />
      </div>
    </motion.div>
  );
}
