import { useLanguageStore } from '../../stores/languageStore';
import { cn, formatPriceWithDiscount } from '../../lib/utils';

interface PriceProps {
  price: number;
  oldPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Price({ price, oldPrice, size = 'md', className }: PriceProps) {
  const language = useLanguageStore((state) => state.language);
  const currency = language === 'fa' ? 'rial' : 'usd';

  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  };

  const { current, old, discount } = formatPriceWithDiscount(price, oldPrice, currency);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('font-semibold text-primary', sizes[size])}>
        {current}
      </span>
      {old && (
        <span className="text-text-secondary line-through text-sm">
          {old}
        </span>
      )}
      {discount && (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-accent bg-primary px-2 py-0.5 rounded-full">
          -{discount}%
        </span>
      )}
    </div>
  );
}
