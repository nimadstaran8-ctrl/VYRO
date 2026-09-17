import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Mail, Phone, ShoppingBag, Calendar, DollarSign } from 'lucide-react';
import { useLanguageStore } from '../../stores/languageStore';
import { t, type Language } from '../../lib/i18n';
import { getCustomerById, type Customer } from '../../services/customers';
import { getOrders } from '../../services/orders';

export function AdminCustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const lang = useLanguageStore((state) => state.language);
  const language = lang as Language;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const found = getCustomerById(id || '');
    setCustomer(found || null);
    setIsLoading(false);
  }, [id]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      processing: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      processing: language === 'fa' ? 'در حال پردازش' : 'Processing',
      shipped: language === 'fa' ? 'ارسال شده' : 'Shipped',
      delivered: language === 'fa' ? 'تحویل داده شده' : 'Delivered',
      cancelled: language === 'fa' ? 'لغو شده' : 'Cancelled',
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="mx-auto max-w-4xl text-center py-16">
        <h1 className="text-2xl font-semibold text-primary mb-4">
          {language === 'fa' ? 'مشتری یافت نشد' : 'Customer Not Found'}
        </h1>
        <Link
          to="/admin/customers"
          className="text-primary hover:underline"
        >
          {language === 'fa' ? 'بازگشت به مشتریان' : 'Back to Customers'}
        </Link>
      </div>
    );
  }

  const allOrders = getOrders();
  const customerOrders = allOrders.slice(0, 5);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link
          to="/admin/customers"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          {t('adminNav.customers', language)}
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-primary">{customer.firstName} {customer.lastName}</h1>
        <p className="mt-1 text-sm text-text-secondary">{customer.email}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-primary mb-4">
            {language === 'fa' ? 'اطلاعات مشتری' : 'Customer Information'}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">{language === 'fa' ? 'ایمیل' : 'Email'}</p>
                <p className="text-sm text-primary">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">{language === 'fa' ? 'تلفن' : 'Phone'}</p>
                <p className="text-sm text-primary">{customer.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">{language === 'fa' ? 'تاریخ ثبت‌نام' : 'Registered'}</p>
                <p className="text-sm text-primary">{customer.registrationDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-primary mb-4">
            {language === 'fa' ? 'آمار' : 'Statistics'}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">{language === 'fa' ? 'تعداد سفارشات' : 'Total Orders'}</p>
                <p className="text-2xl font-semibold text-primary">{customer.orderCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">{language === 'fa' ? 'مجموع خرید' : 'Total Spent'}</p>
                <p className="text-2xl font-semibold text-primary">${customer.totalSpent}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-primary mb-4">
            {language === 'fa' ? 'سفارشات اخیر' : 'Recent Orders'}
          </h2>
          {customerOrders.length === 0 ? (
            <p className="text-sm text-text-secondary">
              {language === 'fa' ? 'سفارشی وجود ندارد' : 'No orders yet'}
            </p>
          ) : (
            <div className="space-y-3">
              {customerOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-primary/5 transition-colors"
                >
                  <div>
                    <p className="font-medium text-primary text-sm">{order.id}</p>
                    <p className="text-xs text-text-secondary">{order.date}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-primary text-sm">${order.total}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
