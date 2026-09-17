import { X, ShoppingBag } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../../stores/cartStore';
import { useLockBodyScroll } from '../../../hooks/useLockBodyScroll';
import { formatPrice } from '../../../lib/format';
import { CartItem } from './CartItem';
import { Button } from '../../../components/ui/Button';
import { useLanguageStore } from '../../../stores/languageStore';
import { t } from '../../../lib/i18n';

export function CartDrawer() {
  const { items, isOpen, closeCart, getSubtotal } = useCartStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const language = useLanguageStore((state) => state.language);
  const currency = language === 'fa' ? 'rial' : 'usd';
  useLockBodyScroll(isOpen);

  const subtotal = getSubtotal();
  const shipping = subtotal > 75 ? 0 : 6;
  const total = subtotal + shipping;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={(e) => {
              if (e.target === overlayRef.current) closeCart();
            }}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: language === 'fa' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: language === 'fa' ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl rtl:origin-right"
            role="dialog"
            aria-modal="true"
            aria-label={t('cart.yourCart', language)}
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary" />
                <h2 className="text-lg font-semibold text-primary">{t('cart.yourCart', language)}</h2>
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-primary">
                  {items.length}
                </span>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="rounded-full p-2 text-text-secondary hover:bg-background"
                aria-label={t('common.close', language)}
              >
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <ShoppingBag size={48} className="mb-4 text-border" />
                <h3 className="text-lg font-medium text-primary">{t('cart.empty', language)}</h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {language === 'fa' ? 'محصولاتی که سبک شما را کامل می‌کنند را کشف کنید.' : 'Discover pieces that complete your look.'}
                </p>
                <Button onClick={closeCart} className="mt-6" asChild>
                  <Link to="/shop">{t('cart.startShopping', language)}</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6">
                  {items.map((item, index) => (
                    <div
                      key={`${item.productId}-${item.color}-${item.size}`}
                      className={index !== items.length - 1 ? 'border-b border-border' : ''}
                    >
                      <CartItem item={item} />
                    </div>
                  ))}
                </div>

                <div className="border-t border-border px-6 py-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-text-secondary">
                      <span>{t('cart.subtotal', language)}</span>
                      <span>{formatPrice(subtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>{t('cart.shipping', language)}</span>
                      <span>{shipping === 0 ? (language === 'fa' ? 'رایگان' : 'Free') : formatPrice(shipping, currency)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-primary">
                      <span>{t('cart.total', language)}</span>
                      <span>{formatPrice(total, currency)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      closeCart();
                    }}
                    className="mt-6 w-full"
                    asChild
                  >
                    <Link to="/checkout">{t('cart.checkout', language)}</Link>
                  </Button>

                  <button
                    type="button"
                    onClick={closeCart}
                    className="mt-3 w-full text-center text-sm text-text-secondary hover:text-primary"
                  >
                    {t('cart.continueShopping', language)}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
