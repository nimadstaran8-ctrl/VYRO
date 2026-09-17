import { useState } from 'react';
import { cn } from '../../lib/utils';

interface ReusableImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  aspectRatio?: string;
  showFallback?: boolean;
  onError?: () => void;
  onLoad?: () => void;
}

const DEFAULT_FALLBACK = '/images/site/fallback.svg';

export function ReusableImage({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  className,
  imgClassName,
  loading = 'lazy',
  objectFit = 'cover',
  aspectRatio,
  showFallback = true,
  onError,
  onLoad,
}: ReusableImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      onError?.();
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const displaySrc = hasError ? fallbackSrc : src;
  const showSpinner = !isLoaded && !hasError;

  return (
    <div
      className={cn('relative overflow-hidden bg-background', className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {showSpinner && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      
      {showFallback && hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background text-text-secondary">
          <svg
            className="h-8 w-8 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
      
      <img
        src={displaySrc}
        alt={alt}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          'h-full w-full transition-opacity duration-200',
          isLoaded ? 'opacity-100' : 'opacity-0',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          imgClassName
        )}
      />
    </div>
  );
}

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className }: ProductImageProps) {
  return (
    <ReusableImage
      src={src}
      alt={alt}
      aspectRatio="1 / 1"
      className={cn('rounded-lg', className)}
    />
  );
}

interface HeroImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function HeroImage({ src, alt, className }: HeroImageProps) {
  return (
    <ReusableImage
      src={src}
      alt={alt}
      className={cn('w-full h-full', className)}
      objectFit="cover"
    />
  );
}
