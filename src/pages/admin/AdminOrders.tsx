import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, ShoppingCart } from 'lucide-react';
import { useLanguageStore } from '../../stores/languageStore';
import { t, type Language } from '../../lib/i18n';
import type { Order } from '../../types/order';
import { getOrders, searchOrders } from '../../services/orders';

export function AdminOrders() {
  const lang = useLanguageStore((state) => state.language);
  const language = lang as Language;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
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

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-primary">{t('adminNav.orders', language)}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {filteredOrders.length} {language === 'fa' ? 'سفارش' : 'orders'}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
          <input
            type="text"
            placeholder={language === 'fa' ? 'جستجوی سفارش...' : 'Search orders...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-10 pe-4 py-3 rounded-xl border border-border bg-surface text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="appearance-none rounded-xl border border-border bg-surface px-4 py-3 pr-10 text-primary focus:border-primary focus:outline-none cursor-pointer"
        >
          <option value="">{language === 'fa' ? 'همه وضعیت‌ها' : 'All Status'}</option>
          <option value="processing">{language === 'fa' ? 'در حال پردازش' : 'Processing'}</option>
          <option value="shipped">{language === 'fa' ? 'ارسال شده' : 'Shipped'}</option>
          <option value="delivered">{language === 'fa' ? 'تحویل داده شده' : 'Delivered'}</option>
          <option value="cancelled">{language === 'fa' ? 'لغو شده' : 'Cancelled'}</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl">
          <ShoppingCart className="h-12 w-12 mx-auto text-text-secondary/50 mb-4" />
          <h3 className="text-lg font-medium text-primary mb-1">
            {search || statusFilter
              ? (language === 'fa' ? 'سفارشی یافت نشد' : 'No orders found')
              : (language === 'fa' ? 'هنوز سفارشی وجود ندارد' : 'No orders yet')}
          </h3>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'شناسه' : 'ID'}
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
                      <p className="text-sm text-primary">{order.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-primary">{order.items.length} {language === 'fa' ? 'محصول' : 'items'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-primary">${order.total}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-end">
                      <Link
                        to={`/admin/orders/${order.id}`}
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
