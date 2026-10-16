import { logActivity } from '../logs/logService';
import { SOCIAL_LINKS } from '../../constants/socialLinks';

const SETTINGS_STORAGE_KEY = 'vyro_settings';

export interface StoreSettings {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

export interface LanguageSettings {
  defaultLanguage: 'fa' | 'en';
  supportedLanguages: Array<{
    code: 'fa' | 'en';
    name: string;
    nativeName: string;
    direction: 'rtl' | 'ltr';
  }>;
}

export interface CurrencySettings {
  defaultCurrency: 'IRR' | 'USD';
  exchangeRate: number;
  exchangeRateLastUpdated: string | null;
}

export interface HomepageSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  featuredTitle: string;
  aboutTitle: string;
  aboutDescription: string;
  featuredProductIds: string[];
  featuredCategoryIds: string[];
}

/**
 * Card-to-card payment details shown to customers at checkout. Kept in
 * settings (not hardcoded) so a new shop owner can replace the card with
 * their own without touching the code.
 */
export interface PaymentSettings {
  /** 13–19 digit bank card number, shown to customers for the transfer. */
  cardNumber: string;
  /** Card holder name, shown next to the number. */
  cardHolder: string;
}

/**
 * Social media URLs shown in the storefront footer. Stored in settings so
 * the store owner can update them from the admin panel without code changes.
 */
export interface SocialSettings {
  instagram: string;
  tiktok: string;
  telegram: string;
}

export interface Settings {
  store: StoreSettings;
  language: LanguageSettings;
  currency: CurrencySettings;
  homepage: HomepageSettings;
  payment: PaymentSettings;
  social: SocialSettings;
}

const DEFAULT_SETTINGS: Settings = {
  store: {
    storeName: 'VYRO',
    storeDescription: 'Premium hats and glasses for your style',
    contactEmail: 'info@vyro.com',
    contactPhone: '+98 912 345 6789',
    address: 'Tehran, Iran',
  },
  language: {
    defaultLanguage: 'fa',
    supportedLanguages: [
      { code: 'fa', name: 'Persian', nativeName: 'فارسی', direction: 'rtl' },
      { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
    ],
  },
  currency: {
    defaultCurrency: 'IRR',
    exchangeRate: 230000,
    exchangeRateLastUpdated: null,
  },
  homepage: {
    heroTitle: 'استایل خود را پیدا کن',
    heroSubtitle: 'کلاه و عینک‌هایی طراحی شده برای استایل شما',
    heroImage: '/images/hero/hero-fashion.svg',
    featuredTitle: 'محصولات منتخب',
    aboutTitle: 'درباره وایرو',
    aboutDescription: 'وایرو برای افرادی ساخته شده که باور دارند جزئیات کوچک می‌تواند استایل را تعریف کند.',
    featuredProductIds: [],
    featuredCategoryIds: [],
  },
  payment: {
    cardNumber: '',
    cardHolder: '',
  },
  social: { ...SOCIAL_LINKS },
};

function getSettingsData(): Settings {
  try {
    const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as Partial<Settings>;
      return {
        store: { ...DEFAULT_SETTINGS.store, ...parsed.store },
        language: { ...DEFAULT_SETTINGS.language, ...parsed.language },
        currency: { ...DEFAULT_SETTINGS.currency, ...parsed.currency },
        homepage: { ...DEFAULT_SETTINGS.homepage, ...parsed.homepage },
        payment: { ...DEFAULT_SETTINGS.payment, ...parsed.payment },
        social: { ...DEFAULT_SETTINGS.social, ...parsed.social },
      };
    }
  } catch {
    console.warn('[settings] Failed to parse stored settings; using defaults.');
  }
  return { ...DEFAULT_SETTINGS };
}

function setSettingsData(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to write settings to storage'
    );
  }
}

export function getSettings(): Settings {
  return getSettingsData();
}

export function getStoreSettings(): StoreSettings {
  return getSettingsData().store;
}

export function updateStoreSettings(updates: Partial<StoreSettings>): { success: boolean; error?: string } {
  try {
    const settings = getSettingsData();
    settings.store = { ...settings.store, ...updates };
    setSettingsData(settings);
    logActivity({ type: 'settings-updated', detail: { section: 'store' } });
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to save store settings' };
  }
}

export function getLanguageSettings(): LanguageSettings {
  return getSettingsData().language;
}

export function updateLanguageSettings(updates: Partial<LanguageSettings>): { success: boolean; error?: string } {
  try {
    const settings = getSettingsData();
    settings.language = { ...settings.language, ...updates };
    setSettingsData(settings);
    logActivity({ type: 'settings-updated', detail: { section: 'language' } });
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to save language settings' };
  }
}

export function getCurrencySettings(): CurrencySettings {
  return getSettingsData().currency;
}

export function updateCurrencySettings(updates: Partial<CurrencySettings>): { success: boolean; error?: string } {
  try {
    const settings = getSettingsData();
    settings.currency = {
      ...settings.currency,
      ...updates,
      exchangeRateLastUpdated: updates.exchangeRate ? new Date().toISOString() : settings.currency.exchangeRateLastUpdated,
    };
    setSettingsData(settings);
    logActivity({ type: 'settings-updated', detail: { section: 'currency' } });
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to save currency settings' };
  }
}

export function getHomepageSettings(): HomepageSettings {
  return getSettingsData().homepage;
}

export function updateHomepageSettings(updates: Partial<HomepageSettings>): { success: boolean; error?: string } {
  try {
    const settings = getSettingsData();
    settings.homepage = { ...settings.homepage, ...updates };
    setSettingsData(settings);
    logActivity({ type: 'settings-updated', detail: { section: 'homepage' } });
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to save homepage settings' };
  }
}

export function getPaymentSettings(): PaymentSettings {
  return getSettingsData().payment;
}

export function updatePaymentSettings(updates: Partial<PaymentSettings>): { success: boolean; error?: string } {
  try {
    const settings = getSettingsData();
    settings.payment = { ...settings.payment, ...updates };
    setSettingsData(settings);
    logActivity({ type: 'settings-updated', detail: { section: 'payment' } });
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to save payment settings' };
  }
}

export function getSocialSettings(): SocialSettings {
  return getSettingsData().social;
}

export function updateSocialSettings(updates: Partial<SocialSettings>): { success: boolean; error?: string } {
  try {
    const settings = getSettingsData();
    settings.social = { ...settings.social, ...updates };
    setSettingsData(settings);
    logActivity({ type: 'settings-updated', detail: { section: 'social' } });
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to save social settings' };
  }
}

export function resetSocialSettings(): { success: boolean; error?: string } {
  try {
    const settings = getSettingsData();
    settings.social = { ...SOCIAL_LINKS };
    setSettingsData(settings);
    logActivity({ type: 'settings-updated', detail: { section: 'social', name: 'reset' } });
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to reset social settings' };
  }
}

export function resetSettings(): { success: boolean } {
  try {
    setSettingsData({ ...DEFAULT_SETTINGS });
    logActivity({ type: 'settings-updated', detail: { section: 'reset' } });
    return { success: true };
  } catch {
    return { success: false };
  }
}
