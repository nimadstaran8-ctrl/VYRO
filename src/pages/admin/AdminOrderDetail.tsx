import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Package, MapPin, CreditCard, Mail, Phone } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useLanguageStore } from '../../stores/languageStore';
import { t, type Language } from '../../lib/i18n';
import type { Order, OrderStatus } from '../../types/order';
import { getOrderById, updateOrderStatus } from '../../services/orders';
import { formatProductPrice } from '../../services/currency';
import { ORDER_STATUSES, getOrderStatusLabel, getOrderStatusColor } from '../../lib/orderStatus';

export function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const lang = useLanguageStore((state) => state.language);
  const language = lang as Language;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    const found = getOrderById(id || '');
    setOrder(found || null);
    setIsLoading(false);
  }, [id]);

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    if (!order || isUpdating) return;

    setIsUpdating(true);
    setUpdateError(null);
    const result = updateOrderStatus(order.id, newStatus);

    if (result.success) {
      setOrder({ ...order, status: newStatus });
    } else {
      setUpdateError(result.error || (language === 'fa' ? 'خطا در به‌روزرسانی وضعیت' : 'Failed to update status'));
    }

    setIsUpdating(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl py-16 text-center">
        <h1 className="mb-4 text-2xl font-semibold text-primary">
          {language === 'fa' ? 'سفارش یافت نشد' : 'Order Not Found'}
        </h1>
        <Link
          to="/admin/orders"
          className="text-primary hover:underline"
        >
          {language === 'fa' ? 'بازگشت به سفارشات' : 'Back to Orders'}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-primary"
        >
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          {t('adminNav.orders', language)}
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary">{order.id}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {language === 'fa' ? 'تاریخ:' : 'Date:'} {order.date}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium ${getOrderStatusColor(order.status)}`}>
          {getOrderStatusLabel(order.status, language)}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-primary">
              {language === 'fa' ? 'محصولات' : 'Order Items'}
            </h2>
          </div>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-16 w-16 rounded-lg bg-background object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/site/fallback.svg';
                  }}
                />
                <div className="flex-1">
                  <p className="font-medium text-primary">{item.name}</p>
                  <p className="text-sm text-text-secondary">
                    {item.color} / {item.size}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {formatProductPrice({ priceUsd: item.price, locale: language })} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-primary">
                  {formatProductPrice({ priceUsd: item.price * item.quantity, locale: language })}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2 border-t border-border pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{language === 'fa' ? 'جمع جزء' : 'Subtotal'}</span>
              <span className="text-primary">{formatProductPrice({ priceUsd: order.subtotal, locale: language })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{language === 'fa' ? 'هزینه ارسال' : 'Shipping'}</span>
              <span className="text-primary">
                {order.shipping === 0
                  ? (language === 'fa' ? 'رایگان' : 'Free')
                  : formatProductPrice({ priceUsd: order.shipping, locale: language })}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{language === 'fa' ? 'تخفیف' : 'Discount'}</span>
                <span>-${order.discount}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold">
              <span>{language === 'fa' ? 'مجموع' : 'Total'}</span>
              <span className="text-primary">{formatProductPrice({ priceUsd: order.total, locale: language })}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-surface p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">
                {language === 'fa' ? 'اطلاعات مشتری' : 'Customer Information'}
              </h2>
            </div>
            {order.customer ? (
              <div className="space-y-3 text-sm">
                <p className="font-medium text-primary">
                  {order.customer.firstName} {order.customer.lastName}
                </p>
                {order.customer.email && (
                  <p className="flex items-center gap-2 text-text-secondary" dir="ltr">
                    <Mail className="h-4 w-4 shrink-0" />
                    {order.customer.email}
                  </p>
                )}
                {order.customer.phone && (
                  <p className="flex items-center gap-2 text-text-secondary" dir="ltr">
                    <Phone className="h-4 w-4 shrink-0" />
                    {order.customer.phone}
                  </p>
                )}
                {(order.customer.address || order.customer.city || order.customer.country) && (
                  <div className="text-text-secondary">
                    {order.customer.address && <p>{order.customer.address}</p>}
                    {(order.customer.city || order.customer.postalCode) && (
                      <p>
                        {[order.customer.city, order.customer.postalCode].filter(Boolean).join(' - ')}
                      </p>
                    )}
                    {order.customer.country && <p>{order.customer.country}</p>}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">
                {language === 'fa'
                  ? 'اطلاعات مشتری برای این سفارش ثبت نشده است.'
                  : 'No customer information was recorded for this order.'}
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-surface p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">
                {language === 'fa' ? 'روش پرداخت' : 'Payment Method'}
              </h2>
            </div>
            <p className="text-sm text-text-secondary">
              {language === 'fa' ? 'پرداخت آنلاین (آزمایشی)' : 'Online Payment (demo)'}
            </p>
          </div>

          <div className="rounded-2xl bg-surface p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-primary">
              {language === 'fa' ? 'به‌روزرسانی وضعیت' : 'Update Status'}
            </h2>
            {updateError && (
              <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-600" role="alert">
                {updateError}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUSES.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={order.status === status ? 'primary' : 'outline'}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={isUpdating}
                  className={status === 'cancelled' && order.status !== status ? 'text-red-500 hover:bg-red-50' : ''}
                >
                  {getOrderStatusLabel(status, language)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
