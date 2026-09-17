import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, ArrowRight, DollarSign, Save, Image } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';
import {
  subscribeToCurrency,
  setUsdToTomanRate,
  getUsdToTomanRate,
} from '../../services/currency';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CURRENCY_CONFIG } from '../../config/currency';

export function AdminDashboard() {
  const language = useLanguageStore((state) => state.language);
  const [tomanRate, setTomanRate] = useState(getUsdToTomanRate().toString());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCurrency(() => {
      setTomanRate(getUsdToTomanRate().toString());
    });
    return unsubscribe;
  }, []);

  const content = {
    title: t('admin.dashboard', language),
    description: language === 'fa' ? 'مدیریت محصولات و موجودی خود' : 'Manage your products and inventory',
    products: t('admin.products', language),
    addProduct: t('admin.addProduct', language),
    viewStorefront: t('admin.viewStorefront', language),
    viewManageProducts: language === 'fa' ? 'مشاهده و مدیریت همه محصولات' : 'View and manage all products',
    createNewProduct: language === 'fa' ? 'ایجاد یک محصول جدید' : 'Create a new product listing',
    openStorefront: language === 'fa' ? 'باز کردن فروشگاه مشتری' : 'Open the customer storefront',
    quickStats: t('admin.quickStats', language),
    demoMode: t('admin.demoMode', language),
    currencySettings: language === 'fa' ? 'تنظیمات ارز' : 'Currency Settings',
    dollarRate: language === 'fa' ? 'نرخ دلار (تومان)' : 'Dollar Rate (Toman)',
    dollarRateDescription: language === 'fa'
      ? 'قیمت هر دلار آمریکا به تومان. این نرخ برای نمایش قیمت‌های ریالی استفاده می‌شود.'
      : 'Price of each US Dollar in Toman. This rate is used for displaying Rial prices.',
    saveRate: language === 'fa' ? 'ذخیره نرخ' : 'Save Rate',
    savedSuccess: language === 'fa' ? 'نرخ با موفقیت ذخیره شد' : 'Rate saved successfully',
    rialCalculation: language === 'fa' ? 'محاسبه ریال' : 'Rial Calculation',
    rialNote: language === 'fa'
      ? 'هر تومان = ۱۰ ریال'
      : 'Each Toman = 10 Rials',
  };

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

  const exampleUsd = 5;
  const exampleRial = exampleUsd * parseFloat(tomanRate || '0') * 10;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-primary">{content.title}</h1>
        <p className="mt-2 text-sm text-text-secondary">
          {content.description}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          to={ROUTES.ADMIN_PRODUCTS}
          className="group flex items-center gap-4 rounded-2xl bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Package className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-medium text-primary">{content.products}</h2>
            <p className="text-sm text-text-secondary">{content.viewManageProducts}</p>
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
            <h2 className="text-lg font-medium text-primary">{content.addProduct}</h2>
            <p className="text-sm text-text-secondary">{content.createNewProduct}</p>
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
            <h2 className="text-lg font-medium text-primary">{content.viewStorefront}</h2>
            <p className="text-sm text-text-secondary">{content.openStorefront}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-text-secondary group-hover:translate-x-1 transition-transform rtl:rotate-180" />
        </a>
      </div>

      <div className="mt-8 rounded-2xl bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-medium text-primary mb-6 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {content.currencySettings}
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary">
                {content.dollarRate}
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
                  {content.saveRate}
                </Button>
              </div>
              <p className="mt-1 text-xs text-text-secondary">
                {content.dollarRateDescription}
              </p>
            </div>

            {language === 'fa' && tomanRate && parseFloat(tomanRate) > 0 && (
              <div className="rounded-lg bg-background p-4">
                <p className="text-sm text-text-secondary">{content.rialCalculation}</p>
                <p className="mt-1 text-sm text-primary">
                  ${exampleUsd} = {(exampleRial).toLocaleString('fa-IR')} ریال
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {content.rialNote}
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

      <div className="mt-8 rounded-2xl bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-medium text-primary mb-4">{content.quickStats}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 bg-background rounded-xl">
            <p className="text-xs text-text-secondary uppercase tracking-wider">{language === 'fa' ? 'حالت آزمایشی' : 'Demo Mode'}</p>
            <p className="mt-1 text-sm text-primary">
              {content.demoMode}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
