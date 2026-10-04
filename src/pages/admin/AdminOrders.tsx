import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, ShoppingCart } from 'lucide-react';
import { useLanguageStore } from '../../stores/languageStore';
import { t, type Language } from '../../lib/i18n';
import type { Order, OrderStatus } from '../../types/order';
import { getOrders, searchOrders } from '../../services/orders';
import { formatProductPrice } from '../../services/currency';
import { ORDER_STATUSES, getOrderStatusLabel, getOrderStatusColor } from '../../lib/orderStatus';

export function AdminOrders() {
  const lang = useLanguageStore((state) => state.language);
  const language = lang as Language;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (search.trim()) {
      result = searchOrders(search);
    }

    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter);
    }

    return result;
  }, [orders, search, statusFilter]);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-primary">{t('adminNav.orders', language)}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {filteredOrders.length} {language === 'fa' ? 'سفارش' : 'orders'}
        </p>
        <p className="mt-2 rounded-xl bg-background px-3 py-2 text-xs text-text-secondary">
          {t('admin.demoDataNotice', language)}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder={language === 'fa' ? 'جستجوی سفارش، مشتری یا محصول...' : 'Search orders, customers or products...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface py-3 pe-4 ps-10 text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
            aria-label={language === 'fa' ? 'جستجوی سفارش' : 'Search orders'}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          className="cursor-pointer rounded-xl border border-border bg-surface px-4 py-3 text-primary focus:border-primary focus:outline-none"
          aria-label={language === 'fa' ? 'فیلتر وضعیت' : 'Filter by status'}
        >
          <option value="">{language === 'fa' ? 'همه وضعیت‌ها' : 'All Status'}</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {getOrderStatusLabel(status, language)}
            </option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl bg-surface py-16 text-center">
          <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-text-secondary/50" />
          <h3 className="mb-1 text-lg font-medium text-primary">
            {search || statusFilter
              ? (language === 'fa' ? 'سفارشی یافت نشد' : 'No orders found')
              : (language === 'fa' ? 'هنوز سفارشی وجود ندارد' : 'No orders yet')}
          </h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'شناسه' : 'ID'}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'مشتری' : 'Customer'}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'تاریخ' : 'Date'}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'محصولات' : 'Items'}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'مجموع' : 'Total'}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'وضعیت' : 'Status'}
                  </th>
                  <th className="px-6 py-4 text-end text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'عملیات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-background/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-primary">{order.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      {order.customer ? (
                        <>
                          <p className="text-sm font-medium text-primary">
                            {order.customer.firstName} {order.customer.lastName}
                          </p>
                          <p className="text-xs text-text-secondary">{order.customer.email}</p>
                        </>
                      ) : (
                        <p className="text-sm text-text-secondary">—</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-primary">{order.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-primary">{order.items.length} {language === 'fa' ? 'محصول' : 'items'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-primary">
                        {formatProductPrice({ priceUsd: order.total, locale: language })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status, language)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-end">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 p-2 text-text-secondary transition-colors hover:text-primary"
                        aria-label={`${language === 'fa' ? 'مشاهده' : 'View'} ${order.id}`}
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
