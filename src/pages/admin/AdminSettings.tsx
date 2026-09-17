import { useState, useEffect } from 'react';
import { Save, Globe, Bell, Shield, Palette } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useLanguageStore } from '../../stores/languageStore';
import { t, type Language } from '../../lib/i18n';
import {
  getSettings,
  updateStoreSettings,
  updateLanguageSettings,
  updateCurrencySettings,
  type Settings,
} from '../../services/settings';
import { setUsdToTomanRate } from '../../services/currency';

export function AdminSettings() {
  const lang = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const language = lang as Language;
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(getSettings());

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    
    updateStoreSettings(settings.store);
    updateLanguageSettings(settings.language);
    
    const currencyResult = updateCurrencySettings(settings.currency);
    if (currencyResult.success && settings.currency.exchangeRate) {
      setUsdToTomanRate(settings.currency.exchangeRate);
    }
    
    if (settings.language.defaultLanguage !== lang) {
      setLanguage(settings.language.defaultLanguage);
    }
    
    setIsSaving(false);
    setSaveMessage(language === 'fa' ? 'تنظیمات با موفقیت ذخیره شد' : 'Settings saved successfully');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const updateStore = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      store: { ...prev.store, [field]: value }
    }));
  };

  const updateCurrency = (field: string, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      currency: { ...prev.currency, [field]: value }
    }));
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary">{t('adminNav.settings', language)}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {language === 'fa' ? 'تنظیمات عمومی فروشگاه' : 'General store settings'}
          </p>
        </div>
        <Button onClick={handleSave} isLoading={isSaving}>
          <Save className="h-4 w-4 ltr:ml-2 rtl:mr-2" />
          {language === 'fa' ? 'ذخیره تغییرات' : 'Save Changes'}
        </Button>
      </div>

      {saveMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm text-green-600">{saveMessage}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-primary">
              {language === 'fa' ? 'عمومی' : 'General'}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={language === 'fa' ? 'نام فروشگاه' : 'Store Name'}
              value={settings.store.storeName}
              onChange={(e) => updateStore('storeName', e.target.value)}
            />
            <Input
              label={language === 'fa' ? 'ایمیل فروشگاه' : 'Store Email'}
              type="email"
              value={settings.store.contactEmail}
              onChange={(e) => updateStore('contactEmail', e.target.value)}
            />
            <Input
              label={language === 'fa' ? 'تلفن تماس' : 'Contact Phone'}
              value={settings.store.contactPhone}
              onChange={(e) => updateStore('contactPhone', e.target.value)}
            />
            <Input
              label={language === 'fa' ? 'آدرس' : 'Address'}
              value={settings.store.address}
              onChange={(e) => updateStore('address', e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-primary">
              {language === 'fa' ? 'توضیحات فروشگاه' : 'Store Description'}
            </label>
            <textarea
              value={settings.store.storeDescription}
              onChange={(e) => updateStore('storeDescription', e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-primary">
              {language === 'fa' ? 'زبان' : 'Language'}
            </h2>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setSettings(prev => ({
                ...prev,
                language: { ...prev.language, defaultLanguage: 'fa' }
              }))}
              className={`flex-1 rounded-xl border p-4 transition-colors ${
                settings.language.defaultLanguage === 'fa'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-text-secondary hover:border-primary/50'
              }`}
            >
              <span className="block text-2xl mb-1">🇮🇷</span>
              <span className="font-medium">فارسی</span>
            </button>
            <button
              onClick={() => setSettings(prev => ({
                ...prev,
                language: { ...prev.language, defaultLanguage: 'en' }
              }))}
              className={`flex-1 rounded-xl border p-4 transition-colors ${
                settings.language.defaultLanguage === 'en'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-text-secondary hover:border-primary/50'
              }`}
            >
              <span className="block text-2xl mb-1">🇬🇧</span>
              <span className="font-medium">English</span>
            </button>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-primary font-medium">ریال</span>
            <h2 className="text-lg font-semibold text-primary">
              {language === 'fa' ? 'ارز' : 'Currency'}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary">
                {language === 'fa' ? 'واحد پول پیش‌فرض' : 'Default Currency'}
              </label>
              <select
                value={settings.currency.defaultCurrency}
                onChange={(e) => updateCurrency('defaultCurrency', e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-primary focus:border-primary focus:outline-none"
              >
                <option value="IRR">IRR - Iranian Rial</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </div>
            <Input
              label={language === 'fa' ? 'نرخ تبدیل به دلار (تومان)' : 'Exchange Rate to USD (Toman)'}
              type="number"
              value={settings.currency.exchangeRate.toString()}
              onChange={(e) => updateCurrency('exchangeRate', Number(e.target.value))}
            />
          </div>
          {settings.currency.exchangeRateLastUpdated && (
            <p className="mt-2 text-xs text-text-secondary">
              {language === 'fa' ? 'آخرین به‌روزرسانی:' : 'Last updated:'} {settings.currency.exchangeRateLastUpdated}
            </p>
          )}
        </div>

        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-primary">
              {language === 'fa' ? 'اعلان‌ها' : 'Notifications'}
            </h2>
          </div>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-primary">
              {language === 'fa' ? 'ارسال اعلان‌های سفارش جدید' : 'Send new order notifications'}
            </span>
            <div className="relative w-11 h-6 bg-border rounded-full peer peer-checked:bg-primary peer-focus:outline-none after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
          </label>
        </div>

        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-primary">
              {language === 'fa' ? 'حالت تعمیر' : 'Maintenance'}
            </h2>
          </div>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-primary">
              {language === 'fa' ? 'فعال‌سازی حالت تعمیر' : 'Enable maintenance mode'}
            </span>
            <div className="relative w-11 h-6 bg-border rounded-full peer peer-checked:bg-primary peer-focus:outline-none after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
