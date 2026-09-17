import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlistStore } from '../../stores/wishlistStore';
import { cn } from '../../lib/utils';

interface WishlistButtonProps {
  productId: string;
  size?: number;
  className?: string;
}

export function WishlistButton({ productId, size = 18, className }: WishlistButtonProps) {
  const { isInWishlist, toggleItem } = useWishlistStore();
  const isActive = isInWishlist(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItem(productId);
      }}
      className={cn(
        'flex items-center justify-center rounded-full bg-white p-2 shadow-sm transition-all hover:shadow-md',
        isActive ? 'text-red-500' : 'text-primary hover:text-red-500',
        className
      )}
      aria-label={isActive ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={isActive}
    >
      <motion.div
        whileTap={{ scale: 0.8 }}
        animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Heart size={size} fill={isActive ? 'currentColor' : 'none'} />
      </motion.div>
    </button>
  );
}
