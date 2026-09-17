export const CURRENCY_CONFIG = {
  USD_TO_TOMAN: 230000,
  TOMAN_TO_RIAL: 10,
  DEFAULT_CURRENCY: 'USD' as const,
  SUPPORTED_CURRENCIES: ['USD', 'IRR'] as const,
  CURRENCY_SYMBOL: {
    USD: '$',
    IRR: 'ریال',
  },
};

export function calculateRialFromUsd(priceUsd: number, customRate?: number): number {
  const rate = customRate ?? CURRENCY_CONFIG.USD_TO_TOMAN;
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    return 0;
  }
  if (!Number.isFinite(rate) || rate <= 0) {
    return 0;
  }
  return Math.round(priceUsd * rate * CURRENCY_CONFIG.TOMAN_TO_RIAL);
}

export function calculateTomanFromUsd(priceUsd: number, customRate?: number): number {
  const rate = customRate ?? CURRENCY_CONFIG.USD_TO_TOMAN;
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    return 0;
  }
  if (!Number.isFinite(rate) || rate <= 0) {
    return 0;
  }
  return Math.round(priceUsd * rate);
}
