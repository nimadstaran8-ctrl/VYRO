import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { SEO } from '../../components/ui/SEO';
import { Button } from '../../components/ui/Button';
import { CartItem } from '../../features/cart/components/CartItem';
import { useCartStore } from '../../stores/cartStore';
import { formatPrice } from '../../lib/format';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';

export function Cart() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const language = useLanguageStore((state) => state.language);
  const currency = language === 'fa' ? 'rial' : 'usd';
  const subtotal = getSubtotal();
  const shipping = subtotal > 75 ? 0 : 6;
  const total = subtotal + shipping;

  const content = {
    title: t('nav.cart', language),
    seoDescription: language === 'fa' ? 'سبد خرید وایرو را بررسی کنید و به پرداخت بروید.' : 'Review your VYRO cart and proceed to checkout.',
    empty: t('cart.empty', language),
    discoverPieces: t('cart.discoverPieces', language),
    continueShopping: t('cart.continueShopping', language),
    productsCount: language === 'fa' ? `${items.length} محصول` : `${items.length} product${items.length !== 1 ? 's' : ''}`,
    delete: t('common.delete', language),
    orderSummary: t('cart.orderSummary', language),
    subtotal: t('cart.subtotal', language),
    shipping: t('cart.shipping', language),
    total: t('cart.total', language),
    free: t('cart.free', language),
    checkout: t('nav.checkout', language),
    startShopping: t('cart.startShopping', language),
  };

  return (
    <>
      <SEO
        title={content.title}
        description={content.seoDescription}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold uppercase tracking-wider text-primary md:text-4xl">{content.title}</h1>

        {items.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center">
            <ShoppingBag size={48} className="text-border" />
            <h2 className="mt-4 text-lg font-medium text-primary">{content.empty}</h2>
            <p className="mt-1 text-text-secondary">{content.discoverPieces}</p>
            <Button className="mt-6" asChild>
              <Link to="/shop">{content.startShopping}</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-text-secondary">{content.productsCount}</p>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-sm text-text-secondary underline hover:text-primary"
                  >
                    {content.delete}
                  </button>
                </div>
                {items.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.color}-${item.size}`}
                    className={index !== items.length - 1 ? 'border-b border-border' : ''}
                  >
                    <CartItem item={item} />
                  </div>
                ))}
              </div>
            </div>

            <div className="h-fit rounded-2xl bg-white p-6">
              <h2 className="text-lg font-semibold text-primary">{content.orderSummary}</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>{content.subtotal}</span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>{content.shipping}</span>
                  <span>{shipping === 0 ? content.free : formatPrice(shipping, currency)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-primary">
                  <span>{content.total}</span>
                  <span>{formatPrice(total, currency)}</span>
                </div>
              </div>
              <Button className="mt-6 w-full" asChild>
                <Link to="/checkout">{content.checkout}</Link>
              </Button>
              <Button variant="ghost" className="mt-3 w-full" asChild>
                <Link to="/shop">{content.continueShopping}</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
