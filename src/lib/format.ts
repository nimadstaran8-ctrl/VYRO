import {
  formatProductPrice as formatProductPriceCore,
  formatProductPriceWithOld as formatProductPriceWithOldCore,
  getCurrencyState,
  convertUsdToRial as convertUsdToRialCore,
  getUsdToTomanRate,
} from '../services/currency';

export function formatPrice(priceUsd: number, currency: 'rial' | 'usd' = 'usd'): string {
  if (currency === 'usd') {
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

  return formatProductPriceCore({ priceUsd, locale: 'fa' });
}

export function convertRialToUsd(priceRial: number): number {
  const rate = getUsdToTomanRate();
  if (rate <= 0 || priceRial <= 0) return 0;
  return priceRial / (rate * 10);
}

export function convertUsdToRial(priceUsd: number): number {
  return convertUsdToRialCore(priceUsd);
}

export function getDiscountPercentage(price: number, oldPrice?: number): number | null {
  if (!oldPrice || oldPrice <= price || !Number.isFinite(oldPrice) || !Number.isFinite(price)) {
    return null;
  }
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function formatPriceWithDiscount(
  priceUsd: number,
  oldPriceUsd: number | undefined,
  currency: 'rial' | 'usd' = 'usd'
): {
  current: string;
  old: string | null;
  discount: number | null;
} {
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    return {
      current: currency === 'rial' ? 'قیمت در حال بروزرسانی است' : 'Price updating...',
      old: null,
      discount: null,
    };
  }

  const locale = currency === 'rial' ? 'fa' : 'en';
  const result = formatProductPriceWithOldCore({ priceUsd, locale, oldPriceUsd });

  return result;
}

export function getExchangeRateStatus(): {
  available: boolean;
  rate: number | null;
  lastUpdated: Date | null;
} {
  const state = getCurrencyState();
  return {
    available: state.usdToTomanRate > 0,
    rate: state.usdToTomanRate,
    lastUpdated: state.lastUpdated,
  };
}

export function getPersianPrice(priceUsd: number): string {
  return formatProductPriceCore({ priceUsd, locale: 'fa' });
}

export function getEnglishPrice(priceUsd: number): string {
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
