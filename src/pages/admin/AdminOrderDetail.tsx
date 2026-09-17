import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Package, MapPin, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useLanguageStore } from '../../stores/languageStore';
import { t, type Language } from '../../lib/i18n';
import type { Order } from '../../types/order';
import { getOrderById, updateOrderStatus } from '../../services/orders';

export function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const lang = useLanguageStore((state) => state.language);
  const language = lang as Language;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const found = getOrderById(id || '');
    setOrder(found || null);
    setIsLoading(false);
  }, [id]);

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!order || isUpdating) return;
    
    setIsUpdating(true);
    const result = updateOrderStatus(order.id, newStatus);
    
    if (result.success) {
      setOrder({ ...order, status: newStatus });
    }
    
    setIsUpdating(false);
  };

  const getStatusLabel = (status: Order['status']) => {
    const labels: Record<Order['status'], string> = {
      processing: language === 'fa' ? 'در حال پردازش' : 'Processing',
      shipped: language === 'fa' ? 'ارسال شده' : 'Shipped',
      delivered: language === 'fa' ? 'تحویل داده شده' : 'Delivered',
      cancelled: language === 'fa' ? 'لغو شده' : 'Cancelled',
    };
    return labels[status];
  };

  const getStatusColor = (status: Order['status']) => {
    const colors: Record<Order['status'], string> = {
      processing: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status];
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
      <div className="mx-auto max-w-4xl text-center py-16">
        <h1 className="text-2xl font-semibold text-primary mb-4">
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
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          {t('adminNav.orders', language)}
        </Link>
      </div>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary">{order.id}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {language === 'fa' ? 'تاریخ:' : 'Date:'} {order.date}
          </p>
        </div>
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-surface rounded-2xl p-6 shadow-sm">
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
                  className="h-16 w-16 rounded-lg object-cover bg-background"
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
                    ${item.price} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-primary">${item.price * item.quantity}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{language === 'fa' ? 'جمع جزء' : 'Subtotal'}</span>
              <span className="text-primary">${order.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{language === 'fa' ? 'هزینه ارسال' : 'Shipping'}</span>
              <span className="text-primary">{order.shipping === 0 ? (language === 'fa' ? 'رایگان' : 'Free') : `$${order.shipping}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{language === 'fa' ? 'تخفیف' : 'Discount'}</span>
                <span>-${order.discount}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
              <span>{language === 'fa' ? 'مجموع' : 'Total'}</span>
              <span className="text-primary">${order.total}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface rounded-2xl p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">
                {language === 'fa' ? 'آدرس ارسال' : 'Shipping Address'}
              </h2>
            </div>
            <div className="text-sm text-text-secondary space-y-1">
              <p className="font-medium text-primary">Customer</p>
              <p>Tehran, Iran</p>
              <p>+98 912 345 6789</p>
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">
                {language === 'fa' ? 'روش پرداخت' : 'Payment Method'}
              </h2>
            </div>
            <p className="text-sm text-text-secondary">
              {language === 'fa' ? 'پرداخت آنلاین' : 'Online Payment'}
            </p>
          </div>

          <div className="bg-surface rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-primary mb-4">
              {language === 'fa' ? 'به‌روزرسانی وضعیت' : 'Update Status'}
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant={order.status === 'processing' ? 'primary' : 'outline'}
                onClick={() => handleStatusUpdate('processing')}
                disabled={isUpdating}
              >
                {language === 'fa' ? 'در حال پردازش' : 'Processing'}
              </Button>
              <Button 
                size="sm" 
                variant={order.status === 'shipped' ? 'primary' : 'outline'}
                onClick={() => handleStatusUpdate('shipped')}
                disabled={isUpdating}
              >
                {language === 'fa' ? 'ارسال شده' : 'Shipped'}
              </Button>
              <Button 
                size="sm" 
                variant={order.status === 'delivered' ? 'primary' : 'outline'}
                onClick={() => handleStatusUpdate('delivered')}
                disabled={isUpdating}
              >
                {language === 'fa' ? 'تحویل داده شده' : 'Delivered'}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-500 hover:bg-red-50"
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={isUpdating}
              >
                {language === 'fa' ? 'لغو' : 'Cancel'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
