import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Phone, ShoppingBag, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { useLanguageStore } from '../../stores/languageStore';
import { t, type Language } from '../../lib/i18n';
import { getCustomerById, deleteCustomer, type Customer } from '../../services/customers';
import { getOrdersByCustomerEmail } from '../../services/orders';
import { formatProductPrice } from '../../services/currency';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ROUTES } from '../../constants/routes';
import { getOrderStatusLabel, getOrderStatusColor } from '../../lib/orderStatus';
import type { Order } from '../../types/order';

export function AdminCustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lang = useLanguageStore((state) => state.language);
  const language = lang as Language;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const found = getCustomerById(id || '');
    setCustomer(found || null);
    setIsLoading(false);
  }, [id]);

  const handleDelete = () => {
    if (!customer) return;
    const result = deleteCustomer(customer.id);
    if (result.success) {
      navigate(ROUTES.ADMIN_USERS);
    } else {
      setDeleteError(result.error || (language === 'fa' ? 'خطا در حذف کاربر' : 'Failed to delete user'));
      setShowDeleteConfirm(false);
    }
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
      <div className="mx-auto max-w-4xl py-16 text-center">
        <h1 className="mb-4 text-2xl font-semibold text-primary">
          {language === 'fa' ? 'کاربر یافت نشد' : 'User Not Found'}
        </h1>
        <Link
          to={ROUTES.ADMIN_USERS}
          className="text-primary hover:underline"
        >
          {language === 'fa' ? 'بازگشت به کاربران' : 'Back to Users'}
        </Link>
      </div>
    );
  }

  // Real order history: only orders whose recorded customer email matches.
  const customerOrders: Order[] = getOrdersByCustomerEmail(customer.email);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link
          to={ROUTES.ADMIN_USERS}
          className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-primary"
        >
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          {t('adminNav.users', language)}
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary">{customer.firstName} {customer.lastName}</h1>
          <p className="mt-1 text-sm text-text-secondary" dir="ltr">{customer.email}</p>
          {deleteError && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600" role="alert">
              {deleteError}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <Trash2 className="h-4 w-4" />
          {language === 'fa' ? 'حذف کاربر' : 'Delete User'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-primary">
            {language === 'fa' ? 'اطلاعات کاربر' : 'User Information'}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">{language === 'fa' ? 'ایمیل' : 'Email'}</p>
                <p className="text-sm text-primary" dir="ltr">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">{language === 'fa' ? 'تلفن' : 'Phone'}</p>
                <p className="text-sm text-primary" dir="ltr">{customer.phone || '—'}</p>
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

        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-primary">
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
                <p className="text-2xl font-semibold text-primary">
                  {formatProductPrice({ priceUsd: customer.totalSpent, locale: language })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-primary">
            {language === 'fa' ? 'سفارشات این کاربر' : 'This User\'s Orders'}
          </h2>
          {customerOrders.length === 0 ? (
            <p className="text-sm text-text-secondary">
              {language === 'fa'
                ? 'هیچ سفارشی با ایمیل این کاربر ثبت نشده است.'
                : 'No orders found matching this user\'s email.'}
            </p>
          ) : (
            <div className="space-y-3">
              {customerOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`${ROUTES.ADMIN_ORDERS}/${order.id}`}
                  className="flex items-center justify-between rounded-lg bg-background p-3 transition-colors hover:bg-primary/5"
                >
                  <div>
                    <p className="text-sm font-medium text-primary">{order.id}</p>
                    <p className="text-xs text-text-secondary">{order.date}</p>
                  </div>
                  <div className="text-end">
                    <p className="text-sm font-medium text-primary">
                      {formatProductPrice({ priceUsd: order.total, locale: language })}
                    </p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status, language)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title={language === 'fa' ? 'حذف کاربر' : 'Delete User'}
        message={
          language === 'fa'
            ? `آیا از حذف ${customer.firstName} ${customer.lastName} اطمینان دارید؟ سفارش‌های او همچنان در لیست سفارشات باقی می‌مانند.`
            : `Are you sure you want to delete ${customer.firstName} ${customer.lastName}? Their orders remain in the orders list.`
        }
        confirmText={language === 'fa' ? 'حذف' : 'Delete'}
        cancelText={t('common.cancel', language)}
        variant="danger"
      />
    </div>
  );
}
