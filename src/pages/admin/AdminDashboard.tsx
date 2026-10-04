import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, ArrowRight, DollarSign, Image, ShoppingCart, Users, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { useLanguageStore } from '../../stores/languageStore';
import { t, type Language } from '../../lib/i18n';
import {
  subscribeToCurrency,
  setUsdToTomanRate,
  getUsdToTomanRate,
  formatProductPrice,
} from '../../services/currency';
import { getAllProducts } from '../../services/catalog/productService';
import { getRecentOrders, getOrderStats } from '../../services/orders';
import { getCustomerStats } from '../../services/customers';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getOrderStatusLabel, getOrderStatusColor } from '../../lib/orderStatus';
import { subscribeToImageStoreChanges } from '../../lib/imageEvents';
import { CURRENCY_CONFIG } from '../../config/currency';

const LOW_STOCK_THRESHOLD = 10;

export function AdminDashboard() {
  const language = useLanguageStore((state) => state.language) as Language;
  const [tomanRate, setTomanRate] = useState(getUsdToTomanRate().toString());
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [stats, setStats] = useState({
    products: { total: 0, lowStock: 0 },
    orders: { total: 0, processing: 0, awaitingApproval: 0, revenue: 0 },
    customers: { total: 0, totalSpent: 0 },
  });
  const [recentOrders, setRecentOrders] = useState<ReturnType<typeof getRecentOrders>>([]);
  const [recentProducts, setRecentProducts] = useState<ReturnType<typeof getAllProducts>>([]);
  const [lowStockProducts, setLowStockProducts] = useState<ReturnType<typeof getAllProducts>>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCurrency(() => {
      setTomanRate(getUsdToTomanRate().toString());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const load = () => {
      const products = getAllProducts();
      const lowStock = products
        .filter((p) => p.stock <= LOW_STOCK_THRESHOLD)
        .sort((a, b) => a.stock - b.stock);
      const recent = products.slice(-5).reverse();

      const orderStats = getOrderStats();
      const orders = getRecentOrders(5);

      const customerStats = getCustomerStats();

      setStats({
        products: { total: products.length, lowStock: lowStock.length },
        orders: {
          total: orderStats.total,
          processing: orderStats.processing + orderStats.paid + orderStats.pending,
          awaitingApproval: orderStats.awaitingApproval,
          revenue: orderStats.revenue,
        },
        customers: { total: customerStats.total, totalSpent: customerStats.totalSpent },
      });
      setRecentOrders(orders);
      setRecentProducts(recent);
      setLowStockProducts(lowStock);
    };

    load();
    // Product thumbnails resolve asynchronously — refresh when images change.
    return subscribeToImageStoreChanges(load);
  }, []);

  const handleSaveRate = () => {
    const rate = parseFloat(tomanRate);
    if (Number.isFinite(rate) && rate > 0) {
      setIsSaving(true);
      setUsdToTomanRate(rate);
      setSaveMessage(language === 'fa' ? 'نرخ ذخیره شد' : 'Rate saved');
      setTimeout(() => {
        setIsSaving(false);
        setSaveMessage(null);
      }, 1500);
    }
  };

  const formatPrice = (priceUsd: number) =>
    formatProductPrice({ priceUsd, locale: language });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-primary">{t('admin.dashboard', language)}</h1>
        <p className="mt-2 text-sm text-text-secondary">
          {language === 'fa' ? 'مدیریت محصولات و موجودی خود' : 'Manage your products and inventory'}
        </p>
      </div>

      <div className="mb-6 flex items-start gap-2 rounded-xl bg-surface p-4 text-xs text-text-secondary">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{t('admin.demoDataNotice', language)}</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Package className="h-5 w-5" />}
          label={language === 'fa' ? 'محصولات' : 'Products'}
          value={stats.products.total.toString()}
          subtext={`${stats.products.lowStock} ${t('admin.lowStock', language)}`}
          iconBg="bg-primary/10"
          href={ROUTES.ADMIN_PRODUCTS}
        />
        <StatCard
          icon={<ShoppingCart className="h-5 w-5" />}
          label={language === 'fa' ? 'سفارشات' : 'Orders'}
          value={stats.orders.total.toString()}
          subtext={
            stats.orders.awaitingApproval > 0
              ? `${stats.orders.awaitingApproval} ${language === 'fa' ? 'در انتظار تأیید پرداخت' : 'awaiting payment approval'}`
              : `${stats.orders.processing} ${language === 'fa' ? 'در جریان' : 'in progress'}`
          }
          iconBg="bg-blue-100"
          href={ROUTES.ADMIN_ORDERS}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label={t('adminNav.users', language)}
          value={stats.customers.total.toString()}
          subtext={`${formatPrice(stats.customers.totalSpent)} ${language === 'fa' ? 'مجموع خرید' : 'lifetime'}`}
          iconBg="bg-green-100"
          href={ROUTES.ADMIN_USERS}
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label={language === 'fa' ? 'درآمد' : 'Revenue'}
          value={formatPrice(stats.orders.revenue)}
          subtext={language === 'fa' ? 'سفارشات پرداخت‌شده تا ارسال' : 'Paid through shipped orders'}
          iconBg="bg-amber-100"
          href={ROUTES.ADMIN_ORDERS}
        />
      </div>

      {/* Quick actions */}
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
          <ArrowRight className="h-5 w-5 text-text-secondary transition-transform group-hover:translate-x-1 rtl:rotate-180" />
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
          <ArrowRight className="h-5 w-5 text-text-secondary transition-transform group-hover:translate-x-1 rtl:rotate-180" />
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
          <ArrowRight className="h-5 w-5 text-text-secondary transition-transform group-hover:translate-x-1 rtl:rotate-180" />
        </Link>

        <Link
          to={ROUTES.HOME}
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
          <ArrowRight className="h-5 w-5 text-text-secondary transition-transform group-hover:translate-x-1 rtl:rotate-180" />
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-primary">
              <ShoppingCart className="h-5 w-5" />
              {language === 'fa' ? 'سفارشات اخیر' : 'Recent Orders'}
            </h2>
            <Link to={ROUTES.ADMIN_ORDERS} className="text-sm text-primary hover:underline">
              {t('common.viewAll', language)}
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-4 text-center text-sm text-text-secondary">
              {language === 'fa' ? 'سفارشی وجود ندارد' : 'No orders yet'}
            </p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
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
                    <p className="text-sm font-medium text-primary">{formatPrice(order.total)}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status, language)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent products */}
        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-primary">
              <TrendingUp className="h-5 w-5" />
              {language === 'fa' ? 'محصولات اخیر' : 'Recent Products'}
            </h2>
            <Link to={ROUTES.ADMIN_PRODUCTS} className="text-sm text-primary hover:underline">
              {t('common.viewAll', language)}
            </Link>
          </div>
          {recentProducts.length === 0 ? (
            <p className="py-4 text-center text-sm text-text-secondary">
              {language === 'fa' ? 'محصولی وجود ندارد' : 'No products yet'}
            </p>
          ) : (
            <div className="space-y-3">
              {recentProducts.map(product => (
                <Link
                  key={product.id}
                  to={`/admin/products/${product.id}/edit`}
                  className="flex items-center gap-3 rounded-lg bg-background p-3 transition-colors hover:bg-primary/5"
                >
                  <img
                    src={product.images[0] || '/images/site/fallback.svg'}
                    alt={product.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-primary">{product.name}</p>
                    <p className="text-xs text-text-secondary">{formatPrice(product.priceUSD)}</p>
                  </div>
                  {product.stock <= LOW_STOCK_THRESHOLD && (
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

      {/* Low stock */}
      <div className="mt-8 rounded-2xl bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-primary">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {t('admin.lowStockProducts', language)}
          </h2>
          <span className="text-xs text-text-secondary">
            {language === 'fa'
              ? `موجودی ${LOW_STOCK_THRESHOLD} یا کمتر`
              : `Stock of ${LOW_STOCK_THRESHOLD} or fewer`}
          </span>
        </div>
        {lowStockProducts.length === 0 ? (
          <p className="py-4 text-center text-sm text-text-secondary">
            {language === 'fa' ? 'همه محصولات موجودی کافی دارند' : 'All products are sufficiently stocked'}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lowStockProducts.map(product => (
              <Link
                key={product.id}
                to={`/admin/products/${product.id}/edit`}
                className="flex items-center gap-3 rounded-lg bg-background p-3 transition-colors hover:bg-primary/5"
              >
                <img
                  src={product.images[0] || '/images/site/fallback.svg'}
                  alt={product.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-primary">{product.name}</p>
                  <p className="text-xs text-text-secondary">{formatPrice(product.priceUSD)}</p>
                </div>
                <span className={`text-sm font-semibold ${product.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                  {product.stock}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Currency settings */}
      <div className="mt-8 rounded-2xl bg-surface p-6 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 text-lg font-medium text-primary">
          <DollarSign className="h-5 w-5" />
          {language === 'fa' ? 'تنظیمات ارز' : 'Currency Settings'}
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary" htmlFor="usd-toman-rate">
                {language === 'fa' ? 'نرخ دلار (تومان)' : 'Dollar Rate (Toman)'}
              </label>
              <div className="flex gap-2">
                <Input
                  id="usd-toman-rate"
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
                  {language === 'fa' ? 'ذخیره نرخ' : 'Save Rate'}
                </Button>
              </div>
              {saveMessage && (
                <p className="mt-1 text-xs text-green-600" role="status">{saveMessage}</p>
              )}
              <p className="mt-1 text-xs text-text-secondary">
                {language === 'fa'
                  ? 'قیمت هر دلار آمریکا به تومان. این نرخ فقط نحوه نمایش قیمت‌های ریالی را تغییر می‌دهد؛ قیمت ذخیره‌شده محصولات دلاری است.'
                  : 'Price of each US Dollar in Toman. This only changes how Rial prices are displayed; stored product prices stay in USD.'}
              </p>
            </div>

            {language === 'fa' && tomanRate && parseFloat(tomanRate) > 0 && (
              <div className="rounded-lg bg-background p-4">
                <p className="text-sm text-text-secondary">
                  $1 = {(parseFloat(tomanRate) * CURRENCY_CONFIG.TOMAN_TO_RIAL).toLocaleString('fa-IR')} ریال
                  <span className="mt-1 block text-xs">هر تومان = ۱۰ ریال</span>
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-background p-4">
            <p className="mb-2 text-sm font-medium text-primary">{language === 'fa' ? 'نرخ پیش‌فرض' : 'Default Rate'}</p>
            <p className="text-sm text-text-secondary">
              {CURRENCY_CONFIG.USD_TO_TOMAN.toLocaleString()} {language === 'fa' ? 'تومان' : 'Toman'}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
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
      className="rounded-2xl bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-text-secondary">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{subtext}</p>
    </Link>
  );
}
