import { IMAGE_STORAGE_BUDGET } from '../config/storage';

/**
 * Combined usage tracking for the local image stores (product images and the
 * media library share one soft budget). Each store reports its total size
 * whenever it changes; quota checks and the admin usage bar use the combined
 * number so both stores together stay within the configured budget.
 */
const storeSizes = new Map<string, number>();

export function reportStoreSize(storeKey: string, size: number): void {
  storeSizes.set(storeKey, size);
}

export function getCombinedImageUsage(): number {
  let total = 0;
  for (const size of storeSizes.values()) {
    total += size;
  }
  return total;
}

export function getImageStorageUsage(): { used: number; limit: number; percentage: number } {
  const used = getCombinedImageUsage();
  return {
    used,
    limit: IMAGE_STORAGE_BUDGET,
    percentage: (used / IMAGE_STORAGE_BUDGET) * 100,
  };
}

export function hasImageBudgetFor(additionalBytes: number): boolean {
  return getCombinedImageUsage() + additionalBytes <= IMAGE_STORAGE_BUDGET;
}
