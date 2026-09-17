import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Users } from 'lucide-react';
import { useLanguageStore } from '../../stores/languageStore';
import { t, type Language } from '../../lib/i18n';
import { getCustomers, searchCustomers, type Customer } from '../../services/customers';

export function AdminCustomers() {
  const lang = useLanguageStore((state) => state.language);
  const language = lang as Language;
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    return searchCustomers(search);
  }, [customers, search]);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-primary">{t('adminNav.customers', language)}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {filteredCustomers.length} {language === 'fa' ? 'مشتری' : 'customers'}
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
          <input
            type="text"
            placeholder={language === 'fa' ? 'جستجوی مشتری...' : 'Search customers...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-10 pe-4 py-3 rounded-xl border border-border bg-surface text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl">
          <Users className="h-12 w-12 mx-auto text-text-secondary/50 mb-4" />
          <h3 className="text-lg font-medium text-primary mb-1">
            {search
              ? (language === 'fa' ? 'مشتری یافت نشد' : 'No customers found')
              : (language === 'fa' ? 'هنوز مشتری وجود ندارد' : 'No customers yet')}
          </h3>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'نام' : 'Name'}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'ایمیل' : 'Email'}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'سفارشات' : 'Orders'}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'مجموع خرید' : 'Total Spent'}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'تاریخ ثبت‌نام' : 'Registered'}
                  </th>
                  <th className="px-6 py-4 text-end text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'عملیات' : 'Actions'}
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
                      <p className="text-sm text-primary">{customer.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-primary">{customer.orderCount}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-primary">${customer.totalSpent}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-secondary">{customer.registrationDate}</p>
                    </td>
                    <td className="px-6 py-4 text-end">
                      <Link
                        to={`/admin/customers/${customer.id}`}
                        className="inline-flex items-center gap-1 p-2 text-text-secondary hover:text-primary transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">{language === 'fa' ? 'مشاهده' : 'View'}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
