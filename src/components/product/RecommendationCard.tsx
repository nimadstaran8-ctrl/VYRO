import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Price } from '../ui/Price';
import { Rating } from '../ui/Rating';
import { truncate } from '../../lib/utils';
import type { Product } from '../../types';

interface RecommendationCardProps {
  product: Product;
  matchScore?: number;
}

const FALLBACK_IMAGE = '/images/site/fallback.svg';

export function RecommendationCard({ product, matchScore }: RecommendationCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col rounded-2xl bg-white p-3 transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-background">
        <img
          src={imageError ? FALLBACK_IMAGE : product.primaryImage || product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={handleImageError}
        />
        {matchScore && (
          <div className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">
            {matchScore}% MATCH
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <Rating value={product.rating} count={product.reviewCount} size={12} />
        <h3 className="text-sm font-medium text-primary">{product.name}</h3>
        <p className="text-xs text-text-secondary">{truncate(product.description, 40)}</p>
        <Price price={product.priceUSD} oldPrice={product.oldPriceUSD} size="sm" className="mt-1" />
      </div>
    </Link>
  );
}
