import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Users, Trash2 } from 'lucide-react';
import { useLanguageStore } from '../../stores/languageStore';
import { t, type Language } from '../../lib/i18n';
import { getCustomers, searchCustomers, deleteCustomer, type Customer } from '../../services/customers';
import { formatProductPrice } from '../../services/currency';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ROUTES } from '../../constants/routes';

export function AdminCustomers() {
  const lang = useLanguageStore((state) => state.language);
  const language = lang as Language;
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<Customer | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    return searchCustomers(search);
  }, [customers, search]);

  const content = {
    title: t('adminNav.users', language),
    searchPlaceholder: language === 'fa' ? 'جستجوی کاربر...' : 'Search users...',
    searchLabel: language === 'fa' ? 'جستجوی کاربر' : 'Search users',
    noUsersFound: language === 'fa' ? 'کاربری یافت نشد' : 'No users found',
    noUsersYet: language === 'fa' ? 'هنوز کاربری وجود ندارد' : 'No users yet',
    name: language === 'fa' ? 'نام' : 'Name',
    email: language === 'fa' ? 'ایمیل' : 'Email',
    orders: language === 'fa' ? 'سفارشات' : 'Orders',
    totalSpent: language === 'fa' ? 'مجموع خرید' : 'Total Spent',
    registered: language === 'fa' ? 'تاریخ ثبت‌نام' : 'Registered',
    actions: language === 'fa' ? 'عملیات' : 'Actions',
    view: language === 'fa' ? 'مشاهده' : 'View',
    deleteUser: language === 'fa' ? 'حذف کاربر' : 'Delete User',
    deleteConfirm:
      language === 'fa'
        ? 'آیا از حذف این کاربر اطمینان دارید؟ سفارش‌های او همچنان در لیست سفارشات باقی می‌مانند.'
        : 'Are you sure you want to delete this user? Their orders remain in the orders list.',
    delete: language === 'fa' ? 'حذف' : 'Delete',
    cancel: t('common.cancel', language),
    deleteError: language === 'fa' ? 'خطا در حذف کاربر' : 'Failed to delete user',
    dismiss: t('admin.dismiss', language),
    usersCount: (n: number) =>
      language === 'fa' ? `${n} کاربر` : `${n} user${n !== 1 ? 's' : ''}`,
  };

  const handleDelete = (id: string) => {
    const result = deleteCustomer(id);
    if (result.success) {
      setCustomers(getCustomers());
      setDeleteConfirm(null);
      setDeleteError(null);
    } else {
      setDeleteError(result.error || content.deleteError);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-primary">{content.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {content.usersCount(filteredCustomers.length)}
        </p>
        <p className="mt-2 rounded-xl bg-background px-3 py-2 text-xs text-text-secondary">
          {t('admin.demoDataNotice', language)}
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder={content.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface py-3 pe-4 ps-10 text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
            aria-label={content.searchLabel}
          />
        </div>
      </div>

      {deleteError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{deleteError}</p>
          <button
            onClick={() => setDeleteError(null)}
            className="mt-1 text-xs text-red-500 hover:text-red-700"
          >
            {content.dismiss}
          </button>
        </div>
      )}

      {filteredCustomers.length === 0 ? (
        <div className="rounded-2xl bg-surface py-16 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-text-secondary/50" />
          <h3 className="mb-1 text-lg font-medium text-primary">
            {search ? content.noUsersFound : content.noUsersYet}
          </h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {content.name}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {content.email}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {content.orders}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {content.totalSpent}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {content.registered}
                  </th>
                  <th className="px-6 py-4 text-end text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {content.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-background/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-primary">{customer.firstName} {customer.lastName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-primary" dir="ltr">{customer.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-primary">{customer.orderCount}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-primary">
                        {formatProductPrice({ priceUsd: customer.totalSpent, locale: language })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-secondary">{customer.registrationDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`${ROUTES.ADMIN_USERS}/${customer.id}`}
                          className="inline-flex items-center gap-1 rounded-lg p-2 text-text-secondary transition-colors hover:text-primary hover:bg-primary/5"
                          aria-label={`${content.view} ${customer.firstName} ${customer.lastName}`}
                          title={content.view}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(customer)}
                          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-red-50 hover:text-red-500"
                          aria-label={`${content.deleteUser} ${customer.firstName} ${customer.lastName}`}
                          title={content.deleteUser}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          title={content.deleteUser}
          message={`${content.deleteConfirm} (${deleteConfirm.firstName} ${deleteConfirm.lastName})`}
          confirmText={content.delete}
          cancelText={content.cancel}
          variant="danger"
        />
      )}
    </div>
  );
}
