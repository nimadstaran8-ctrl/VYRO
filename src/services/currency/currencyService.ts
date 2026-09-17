import { CURRENCY_CONFIG, calculateRialFromUsd } from '../../config/currency';

export interface CurrencyState {
  usdToTomanRate: number;
  lastUpdated: Date | null;
}

type CurrencyListener = (state: CurrencyState) => void;

const CURRENCY_STORAGE_KEY = 'vyro_currency_rate';

const listeners: Set<CurrencyListener> = new Set();

function getStoredRate(): number {
  try {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored) {
      const parsed = parseFloat(stored);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
  } catch {
  }
  return CURRENCY_CONFIG.USD_TO_TOMAN;
}

function storeRate(rate: number): void {
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, rate.toString());
  } catch {
  }
}

let currentState: CurrencyState = {
  usdToTomanRate: getStoredRate(),
  lastUpdated: null,
};

function notifyListeners(): void {
  listeners.forEach((listener) => listener(currentState));
}

export function subscribeToCurrency(listener: CurrencyListener): () => void {
  listeners.add(listener);
  listener(currentState);
  return () => listeners.delete(listener);
}

export function getCurrencyState(): CurrencyState {
  return currentState;
}

export function getUsdToTomanRate(): number {
  return currentState.usdToTomanRate;
}

export function setUsdToTomanRate(rate: number): void {
  if (!Number.isFinite(rate) || rate <= 0) {
    return;
  }
  currentState = {
    usdToTomanRate: rate,
    lastUpdated: new Date(),
  };
  storeRate(rate);
  notifyListeners();
}

export function formatUsdPrice(priceUsd: number): string {
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(priceUsd);
}

export function formatRialPrice(priceRial: number): string {
  if (!Number.isFinite(priceRial) || priceRial <= 0) {
    return 'نامعتبر';
  }
  const formatted = new Intl.NumberFormat('fa-IR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceRial);
  return `${formatted} ریال`;
}

export function formatTomanPrice(priceToman: number): string {
  if (!Number.isFinite(priceToman) || priceToman <= 0) {
    return 'نامعتبر';
  }
  const formatted = new Intl.NumberFormat('fa-IR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceToman);
  return `${formatted} تومان`;
}

export interface FormatPriceOptions {
  priceUsd: number;
  locale: 'fa' | 'en';
  oldPriceUsd?: number;
}

export function formatProductPrice(options: FormatPriceOptions): string {
  const { priceUsd, locale } = options;

  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    return locale === 'fa' ? 'قیمت در حال بروزرسانی است' : 'Price updating...';
  }

  if (locale === 'fa') {
    const priceRial = calculateRialFromUsd(priceUsd, currentState.usdToTomanRate);
    return formatRialPrice(priceRial);
  }

  return formatUsdPrice(priceUsd);
}

export function formatProductPriceWithOld(options: FormatPriceOptions): {
  current: string;
  old: string | null;
  discount: number | null;
} {
  const { priceUsd, locale, oldPriceUsd } = options;

  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    return {
      current: locale === 'fa' ? 'قیمت در حال بروزرسانی است' : 'Price updating...',
      old: null,
      discount: null,
    };
  }

  const current = formatProductPrice({ priceUsd, locale });

  let old: string | null = null;
  let discount: number | null = null;

  if (oldPriceUsd && Number.isFinite(oldPriceUsd) && oldPriceUsd > priceUsd) {
    old = formatProductPrice({ priceUsd: oldPriceUsd, locale });
    discount = Math.round(((oldPriceUsd - priceUsd) / oldPriceUsd) * 100);
  }

  return { current, old, discount };
}

export function convertUsdToRial(priceUsd: number): number {
  return calculateRialFromUsd(priceUsd, currentState.usdToTomanRate);
}

export function convertUsdToToman(priceUsd: number): number {
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    return 0;
  }
  return Math.round(priceUsd * currentState.usdToTomanRate);
}
