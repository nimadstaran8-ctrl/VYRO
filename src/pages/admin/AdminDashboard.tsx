import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, ArrowRight, DollarSign, Save, Image, ShoppingCart, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';
import {
  subscribeToCurrency,
  setUsdToTomanRate,
  getUsdToTomanRate,
} from '../../services/currency';
import { getProducts } from '../../services/catalog/productService';
import { getRecentOrders, getOrderStats } from '../../services/orders';
import { getCustomerStats } from '../../services/customers';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CURRENCY_CONFIG } from '../../config/currency';

export function AdminDashboard() {
  const language = useLanguageStore((state) => state.language);
  const [tomanRate, setTomanRate] = useState(getUsdToTomanRate().toString());
  const [isSaving, setIsSaving] = useState(false);

  const [stats, setStats] = useState({
    products: { total: 0, lowStock: 0 },
    orders: { total: 0, processing: 0, revenue: 0 },
    customers: { total: 0, totalSpent: 0 },
  });
  const [recentOrders, setRecentOrders] = useState<ReturnType<typeof getRecentOrders>>([]);
  const [recentProducts, setRecentProducts] = useState<ReturnType<typeof getProducts>>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCurrency(() => {
      setTomanRate(getUsdToTomanRate().toString());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const products = getProducts();
    const lowStockProducts = products.filter(p => p.stock <= 10);
    const recent = products.slice(-5).reverse();
    
    const orderStats = getOrderStats();
    const orders = getRecentOrders(5);
    
    const customerStats = getCustomerStats();
    
    setStats({
      products: { total: products.length, lowStock: lowStockProducts.length },
      orders: { 
        total: orderStats.total, 
        processing: orderStats.processing, 
        revenue: orderStats.revenue 
      },
      customers: { total: customerStats.total, totalSpent: customerStats.totalSpent },
    });
    setRecentOrders(orders);
    setRecentProducts(recent);
  }, []);

  const handleSaveRate = () => {
    const rate = parseFloat(tomanRate);
    if (Number.isFinite(rate) && rate > 0) {
      setIsSaving(true);
      setUsdToTomanRate(rate);
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  };

  const formatPrice = (price: number) => {
    if (language === 'fa') {
      return `${price.toLocaleString('fa-IR')} ${language === 'fa' ? 'ریال' : 'USD'}`;
    }
    return `$${price.toFixed(2)}`;
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      processing: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-primary">{t('admin.dashboard', language)}</h1>
        <p className="mt-2 text-sm text-text-secondary">
          {language === 'fa' ? 'مدیریت محصولات و موجودی خود' : 'Manage your products and inventory'}
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Package className="h-5 w-5" />}
          label={language === 'fa' ? 'محصولات' : 'Products'}
          value={stats.products.total.toString()}
          subtext={`${stats.products.lowStock} ${language === 'fa' ? 'موجودی کم' : 'low stock'}`}
          iconBg="bg-primary/10"
          href={ROUTES.ADMIN_PRODUCTS}
        />
        <StatCard
          icon={<ShoppingCart className="h-5 w-5" />}
          label={language === 'fa' ? 'سفارشات' : 'Orders'}
          value={stats.orders.total.toString()}
          subtext={`${stats.orders.processing} ${language === 'fa' ? 'در حال پردازش' : 'processing'}`}
          iconBg="bg-blue-100"
          href={ROUTES.ADMIN_ORDERS}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label={language === 'fa' ? 'مشتریان' : 'Customers'}
          value={stats.customers.total.toString()}
          subtext={formatPrice(stats.customers.totalSpent)}
          iconBg="bg-green-100"
          href={ROUTES.ADMIN_CUSTOMERS}
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label={language === 'fa' ? 'درآمد' : 'Revenue'}
          value={formatPrice(stats.orders.revenue)}
          subtext={language === 'fa' ? 'سفارشات تحویل شده' : 'Delivered orders'}
          iconBg="bg-amber-100"
          href={ROUTES.ADMIN_ORDERS}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Link
          to={ROUTES.ADMIN_PRODUCTS}
          className="group flex items-center gap-4 rounded-2xl bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Package className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-medium text-primary">{language === 'fa' ? 'محصولات' : 'Products'}</h2>
            <p className="text-sm text-text-secondary">
              {language === 'fa' ? 'مدیریت محصولات فروشگاه' : 'Manage your store products'}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-text-secondary group-hover:translate-x-1 transition-transform rtl:rotate-180" />
        </Link>

        <Link
          to={ROUTES.ADMIN_PRODUCT_NEW}
          className="group flex items-center gap-4 rounded-2xl bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent">
            <Plus className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-medium text-primary">{language === 'fa' ? 'افزودن محصول' : 'Add Product'}</h2>
            <p className="text-sm text-text-secondary">
              {language === 'fa' ? 'ایجاد یک محصول جدید' : 'Create a new product listing'}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-text-secondary group-hover:translate-x-1 transition-transform rtl:rotate-180" />
        </Link>

        <Link
          to={ROUTES.ADMIN_MEDIA}
          className="group flex items-center gap-4 rounded-2xl bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
            <Image className="h-7 w-7 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-medium text-primary">{t('media.title', language)}</h2>
            <p className="text-sm text-text-secondary">
              {language === 'fa' ? 'مدیریت تصاویر سایت' : 'Manage website images'}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-text-secondary group-hover:translate-x-1 transition-transform rtl:rotate-180" />
        </Link>

        <a
          href="/"
          className="group flex items-center gap-4 rounded-2xl bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-text-secondary/10">
            <svg className="h-7 w-7 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-medium text-primary">{language === 'fa' ? 'مشاهده فروشگاه' : 'View Storefront'}</h2>
            <p className="text-sm text-text-secondary">
              {language === 'fa' ? 'باز کردن فروشگاه مشتری' : 'Open the customer storefront'}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-text-secondary group-hover:translate-x-1 transition-transform rtl:rotate-180" />
        </a>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {language === 'fa' ? 'سفارشات اخیر' : 'Recent Orders'}
            </h2>
            <Link to={ROUTES.ADMIN_ORDERS} className="text-sm text-primary hover:underline">
              {language === 'fa' ? 'مشاهده همه' : 'View All'}
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-text-secondary py-4 text-center">
              {language === 'fa' ? 'سفارشی وجود ندارد' : 'No orders yet'}
            </p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
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

        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {language === 'fa' ? 'محصولات جدید' : 'Recent Products'}
            </h2>
            <Link to={ROUTES.ADMIN_PRODUCTS} className="text-sm text-primary hover:underline">
              {language === 'fa' ? 'مشاهده همه' : 'View All'}
            </Link>
          </div>
          {recentProducts.length === 0 ? (
            <p className="text-sm text-text-secondary py-4 text-center">
              {language === 'fa' ? 'محصولی وجود ندارد' : 'No products yet'}
            </p>
          ) : (
            <div className="space-y-3">
              {recentProducts.map(product => (
                <Link
                  key={product.id}
                  to={`/admin/products/${product.id}/edit`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-primary/5 transition-colors"
                >
                  <img
                    src={product.images[0] || '/images/site/fallback.svg'}
                    alt={product.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary text-sm truncate">{product.name}</p>
                    <p className="text-xs text-text-secondary">${product.priceUSD}</p>
                  </div>
                  {product.stock <= 10 && (
                    <span className="flex items-center gap-1 text-xs text-orange-600">
                      <AlertTriangle className="h-3 w-3" />
                      {product.stock}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-medium text-primary mb-6 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {language === 'fa' ? 'تنظیمات ارز' : 'Currency Settings'}
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary">
                {language === 'fa' ? 'نرخ دلار (تومان)' : 'Dollar Rate (Toman)'}
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  step="1000"
                  value={tomanRate}
                  onChange={(e) => setTomanRate(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleSaveRate}
                  isLoading={isSaving}
                  disabled={!tomanRate || parseFloat(tomanRate) <= 0}
                >
                  <Save className="h-4 w-4 ltr:ml-2 rtl:mr-2" />
                  {language === 'fa' ? 'ذخیره نرخ' : 'Save Rate'}
                </Button>
              </div>
              <p className="mt-1 text-xs text-text-secondary">
                {language === 'fa' 
                  ? 'قیمت هر دلار آمریکا به تومان. این نرخ برای نمایش قیمت‌های ریالی استفاده می‌شود.'
                  : 'Price of each US Dollar in Toman. This rate is used for displaying Rial prices.'}
              </p>
            </div>

            {language === 'fa' && tomanRate && parseFloat(tomanRate) > 0 && (
              <div className="rounded-lg bg-background p-4">
                <p className="text-sm text-text-secondary">{language === 'fa' ? 'محاسبه ریال' : 'Rial Calculation'}</p>
                <p className="mt-1 text-sm text-primary">
                  $1 = {(parseFloat(tomanRate) * 10).toLocaleString('fa-IR')} {language === 'fa' ? 'ریال' : 'Rials'}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {language === 'fa' ? 'هر تومان = ۱۰ ریال' : 'Each Toman = 10 Rials'}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-background p-4">
            <p className="text-sm font-medium text-primary mb-2">{language === 'fa' ? 'نرخ پیش‌فرض' : 'Default Rate'}</p>
            <p className="text-sm text-text-secondary">
              {CURRENCY_CONFIG.USD_TO_TOMAN.toLocaleString()} {language === 'fa' ? 'تومان' : 'Toman'}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {CURRENCY_CONFIG.USD_TO_TOMAN.toLocaleString()} × {CURRENCY_CONFIG.TOMAN_TO_RIAL} = {(CURRENCY_CONFIG.USD_TO_TOMAN * CURRENCY_CONFIG.TOMAN_TO_RIAL).toLocaleString()} {language === 'fa' ? 'ریال' : 'Rials'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  iconBg: string;
  href: string;
}

function StatCard({ icon, label, value, subtext, iconBg, href }: StatCardProps) {
  return (
    <Link
      to={href}
      className="rounded-2xl bg-surface p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-text-secondary">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-primary">{value}</p>
      <p className="text-xs text-text-secondary mt-1">{subtext}</p>
    </Link>
  );
}
