import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RatingProps {
  value: number;
  count?: number;
  size?: number;
  showCount?: boolean;
  className?: string;
}

export function Rating({ value, count, size = 14, showCount = true, className }: RatingProps) {
  const fullStars = Math.floor(value);
  const hasHalf = value % 1 >= 0.5;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center" aria-label={`Rating: ${value} out of 5`}>
        {[...Array(5)].map((_, i) => {
          const isFilled = i < fullStars;
          const isHalf = i === fullStars && hasHalf;

          return (
            <div key={i} className="relative">
              <Star
                size={size}
                className="text-border"
                fill="currentColor"
                strokeWidth={0}
              />
              {(isFilled || isHalf) && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: isHalf ? '50%' : '100%' }}
                >
                  <Star
                    size={size}
                    className="text-primary"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-text-secondary">({count})</span>
      )}
    </div>
  );
}
