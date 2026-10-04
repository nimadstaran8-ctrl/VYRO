import type { MediaImage, ImageLocation, MediaUpdateData } from './types';
import { notifyImageStoreChanged } from '../../lib/imageEvents';
import { reportStoreSize, hasImageBudgetFor, getImageStorageUsage } from '../../lib/imageUsage';
import {
  openDatabase,
  requestAsPromise,
  transactionDone,
  dataUrlToBlob,
} from '../../lib/idb';
import { IMAGE_STORAGE_BUDGET } from '../../config/storage';

const DB_NAME = 'vyro_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'images';
const SIZE_KEY = 'media-images';

/**
 * Legacy localStorage key used before the move to IndexedDB. Existing records
 * (including base64 payloads) are migrated into IndexedDB on startup.
 */
const LEGACY_STORAGE_KEY = 'vyro_media_library';

/** Persisted record. Binary payloads live in `blob`, never as base64 strings. */
export interface StoredMediaRecord {
  id: string;
  name: string;
  alt: string;
  description: string;
  mimeType: string;
  size: number;
  location: ImageLocation;
  usedIn: string[];
  createdAt: string;
  updatedAt: string;
  blob?: Blob;
  /** Path for images shipped with the site (no blob). */
  staticUrl?: string;
}

interface LegacyMediaImage {
  id: string;
  name: string;
  alt: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  mimeType: string;
  size: number;
  location: ImageLocation;
  usedIn: string[];
  createdAt: string;
  updatedAt: string;
}

function toCachedImage(record: StoredMediaRecord): MediaImage {
  const url = record.blob
    ? URL.createObjectURL(record.blob)
    : record.staticUrl ?? '/images/site/fallback.svg';

  return {
    id: record.id,
    name: record.name,
    alt: record.alt,
    description: record.description,
    url,
    thumbnailUrl: url,
    mimeType: record.mimeType,
    size: record.size,
    location: record.location,
    usedIn: record.usedIn,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    blob: record.blob,
  };
}

class MediaRepository {
  private db: IDBDatabase | null = null;
  private openPromise: Promise<IDBDatabase> | null = null;
  private hydratePromise: Promise<void> | null = null;
  private cache = new Map<string, MediaImage>();
  private available = true;

  constructor() {
    this.hydratePromise = this.hydrate();
  }

  private async getDb(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (!this.openPromise) {
      this.openPromise = openDatabase(DB_NAME, STORE_NAME, DB_VERSION);
    }
    this.db = await this.openPromise;
    return this.db;
  }

  /**
   * Loads all records into the in-memory cache, migrates legacy localStorage
   * data and seeds the default site images on first run.
   */
  private async hydrate(): Promise<void> {
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const records = await requestAsPromise(
        tx.objectStore(STORE_NAME).getAll() as IDBRequest<StoredMediaRecord[]>
      );

      for (const record of records) {
        if (!this.cache.has(record.id)) {
          this.cache.set(record.id, toCachedImage(record));
        }
      }

      await this.migrateLegacyImages(db);
      await this.seedDefaults(db);
      reportStoreSize(SIZE_KEY, this.computeSize());
    } catch {
      this.available = false;
    }

    notifyImageStoreChanged();
  }

  private async migrateLegacyImages(db: IDBDatabase): Promise<void> {
    let legacy: Record<string, LegacyMediaImage>;
    try {
      const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return;
      legacy = (JSON.parse(raw) as { images?: Record<string, LegacyMediaImage> }).images ?? {};
    } catch {
      return;
    }

    const entries = Object.values(legacy);
    if (entries.length === 0) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return;
    }

    try {
      // Decode before opening the write transaction (IDB transactions close
      // when the event loop yields).
      const migrated: StoredMediaRecord[] = [];
      for (const item of entries) {
        if (this.cache.has(item.id)) continue;
        const now = item.updatedAt || new Date().toISOString();
        try {
          if (item.url.startsWith('data:')) {
            const blob = await dataUrlToBlob(item.url);
            migrated.push({
              id: item.id,
              name: item.name,
              alt: item.alt,
              description: item.description,
              mimeType: item.mimeType,
              size: blob.size || item.size,
              location: item.location,
              usedIn: item.usedIn,
              createdAt: item.createdAt,
              updatedAt: now,
              blob,
            });
          } else {
            migrated.push({
              id: item.id,
              name: item.name,
              alt: item.alt,
              description: item.description,
              mimeType: item.mimeType,
              size: item.size,
              location: item.location,
              usedIn: item.usedIn,
              createdAt: item.createdAt,
              updatedAt: now,
              staticUrl: item.url,
            });
          }
        } catch {
          // Skip undecodable payloads.
        }
      }

      if (migrated.length > 0) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        for (const record of migrated) {
          store.put(record);
          this.cache.set(record.id, toCachedImage(record));
        }
        await transactionDone(tx);
        notifyImageStoreChanged();
      }

      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } finally {
      reportStoreSize(SIZE_KEY, this.computeSize());
    }
  }

  private async seedDefaults(db: IDBDatabase): Promise<void> {
    if (this.cache.size > 0) return;

    const defaults: StoredMediaRecord[] = [
      {
        id: 'default-hero',
        name: 'Hero Background',
        alt: 'Hero background image',
        description: 'Main hero section background',
        mimeType: 'image/svg+xml',
        size: 0,
        location: 'hero',
        usedIn: ['homepage-hero'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        staticUrl: '/images/hero/hero-fashion.svg',
      },
      {
        id: 'default-fallback',
        name: 'Image Placeholder',
        alt: 'Placeholder for missing images',
        description: 'Fallback image for broken or missing images',
        mimeType: 'image/svg+xml',
        size: 0,
        location: 'site',
        usedIn: ['system-fallback'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        staticUrl: '/images/site/fallback.svg',
      },
      {
        id: 'default-about',
        name: 'About Brand Image',
        alt: 'VYRO brand story',
        description: 'About page brand imagery',
        mimeType: 'image/svg+xml',
        size: 0,
        location: 'site',
        usedIn: ['about-page'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        staticUrl: '/images/site/about-brand.svg',
      },
      {
        id: 'default-summer',
        name: 'Summer Collection',
        alt: 'Summer collection banner',
        description: 'Summer 2026 collection image',
        mimeType: 'image/svg+xml',
        size: 0,
        location: 'category',
        usedIn: ['collection-summer-2026'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        staticUrl: '/images/categories/summer.svg',
      },
      {
        id: 'default-city',
        name: 'City Nights Collection',
        alt: 'City nights collection',
        description: 'City Nights collection banner',
        mimeType: 'image/svg+xml',
        size: 0,
        location: 'category',
        usedIn: ['collection-city-nights'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        staticUrl: '/images/categories/city-nights.svg',
      },
      {
        id: 'default-weekend',
        name: 'Weekend Collection',
        alt: 'Weekend collection',
        description: 'Weekend collection banner',
        mimeType: 'image/svg+xml',
        size: 0,
        location: 'category',
        usedIn: ['collection-weekend'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        staticUrl: '/images/categories/weekend.svg',
      },
      {
        id: 'default-essentials',
        name: 'Essentials Collection',
        alt: 'Essentials collection',
        description: 'Essentials collection banner',
        mimeType: 'image/svg+xml',
        size: 0,
        location: 'category',
        usedIn: ['collection-essentials'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        staticUrl: '/images/categories/essentials.svg',
      },
    ];

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const record of defaults) {
      store.put(record);
      this.cache.set(record.id, toCachedImage(record));
    }
    await transactionDone(tx);
  }

  private computeSize(): number {
    let total = 0;
    for (const image of this.cache.values()) {
      total += image.size;
    }
    return total;
  }

  isAvailable(): boolean {
    return this.available;
  }

  // ---- Synchronous cache reads (hydrated at startup) ----

  getAll(): MediaImage[] {
    return [...this.cache.values()];
  }

  get(id: string): MediaImage | undefined {
    return this.cache.get(id);
  }

  // ---- Async mutations ----

  async put(record: StoredMediaRecord): Promise<{ success: boolean; error?: string }> {
    if (!hasImageBudgetFor(record.size - (this.cache.get(record.id)?.size ?? 0))) {
      return {
        success: false,
        error:
          'Image storage budget exceeded. The limit is 200MB across all images. Please delete some images.',
      };
    }

    try {
      const db = await this.getDb();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      await requestAsPromise(tx.objectStore(STORE_NAME).put(record) as IDBRequest<IDBValidKey>);
      this.cache.set(record.id, toCachedImage(record));
      reportStoreSize(SIZE_KEY, this.computeSize());
      notifyImageStoreChanged();
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to save image.' };
    }
  }

  async update(id: string, updates: MediaUpdateData): Promise<{ success: boolean; error?: string }> {
    const cached = this.cache.get(id);
    if (!cached) {
      return { success: false, error: 'Image not found.' };
    }

    const merged: StoredMediaRecord = {
      id,
      name: updates.name ?? cached.name,
      alt: updates.alt ?? cached.alt,
      description: updates.description ?? cached.description,
      location: updates.location ?? cached.location,
      mimeType: cached.mimeType,
      size: cached.size,
      usedIn: cached.usedIn,
      createdAt: cached.createdAt,
      updatedAt: new Date().toISOString(),
      blob: cached.blob,
      staticUrl: cached.blob ? undefined : cached.url,
    };

    return this.put(merged);
  }

  async setUsedIn(id: string, usedIn: string[]): Promise<{ success: boolean; error?: string }> {
    const cached = this.cache.get(id);
    if (!cached) {
      return { success: false, error: 'Image not found.' };
    }

    const merged: StoredMediaRecord = {
      id,
      name: cached.name,
      alt: cached.alt,
      description: cached.description,
      location: cached.location,
      mimeType: cached.mimeType,
      size: cached.size,
      usedIn,
      createdAt: cached.createdAt,
      updatedAt: new Date().toISOString(),
      blob: cached.blob,
      staticUrl: cached.blob ? undefined : cached.url,
    };

    return this.put(merged);
  }

  async remove(id: string): Promise<{ success: boolean; error?: string }> {
    const cached = this.cache.get(id);
    if (!cached) {
      return { success: false, error: 'Image not found.' };
    }

    try {
      const db = await this.getDb();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      await requestAsPromise(tx.objectStore(STORE_NAME).delete(id) as IDBRequest<undefined>);
    } catch {
      // Drop from cache regardless — the image is gone for this session.
    }

    if (cached.blob) {
      URL.revokeObjectURL(cached.url);
    }
    this.cache.delete(id);
    reportStoreSize(SIZE_KEY, this.computeSize());
    notifyImageStoreChanged();
    return { success: true };
  }

  async clear(): Promise<void> {
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      await requestAsPromise(tx.objectStore(STORE_NAME).clear() as IDBRequest<undefined>);
    } catch {
      // ignore
    }
    for (const image of this.cache.values()) {
      if (image.blob) {
        URL.revokeObjectURL(image.url);
      }
    }
    this.cache.clear();
    reportStoreSize(SIZE_KEY, 0);
    notifyImageStoreChanged();
  }

  reload(): void {
    if (!this.hydratePromise) {
      this.hydratePromise = this.hydrate();
    }
  }

  getStorageUsage(): { used: number; limit: number; percentage: number } {
    return getImageStorageUsage();
  }

  getBudget(): number {
    return IMAGE_STORAGE_BUDGET;
  }
}

const repository = new MediaRepository();

export function getMediaRepository(): MediaRepository {
  return repository;
}
