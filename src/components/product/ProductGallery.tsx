import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

const FALLBACK_IMAGE = '/images/site/fallback.svg';

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbnailErrors, setThumbnailErrors] = useState<Record<number, boolean>>({});

  const handleMainImageError = () => {
    setMainImageError(true);
  };

  const handleThumbnailError = (index: number) => {
    setThumbnailErrors((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-background">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            src={mainImageError ? FALLBACK_IMAGE : images[activeIndex]}
            alt={`${alt} - view ${activeIndex + 1}`}
            className="h-full w-full object-cover"
            style={{ aspectRatio: '1 / 1' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onError={handleMainImageError}
          />
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative aspect-square w-20 overflow-hidden rounded-lg border-2 transition-colors',
                activeIndex === index ? 'border-primary' : 'border-transparent'
              )}
              aria-label={`View ${alt} image ${index + 1}`}
              aria-current={activeIndex === index}
            >
              <img
                src={thumbnailErrors[index] ? FALLBACK_IMAGE : image}
                alt={`${alt} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={() => handleThumbnailError(index)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
