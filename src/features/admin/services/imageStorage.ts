import { MAX_IMAGE_FILE_SIZE } from '../../../config/storage';
import { notifyImageStoreChanged } from '../../../lib/imageEvents';
import { reportStoreSize, hasImageBudgetFor, getImageStorageUsage } from '../../../lib/imageUsage';
import {
  openDatabase,
  requestAsPromise,
  transactionDone,
  dataUrlToBlob,
} from '../../../lib/idb';

const DB_NAME = 'vyro_image_db';
const DB_VERSION = 1;
const STORE_NAME = 'images';
const SIZE_KEY = 'product-images';

/**
 * Legacy localStorage key used before the move to IndexedDB. If it still
 * exists, its base64 payloads are migrated into IndexedDB and the key is
 * removed. localStorage could only hold ~5MB; IndexedDB removes that limit.
 */
const LEGACY_STORAGE_KEY = 'vyro_image_storage';

export interface StoredImage {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
  blob: Blob;
}

interface CachedImage {
  url: string;
  size: number;
}

export interface ImageStorageData {
  images: Record<string, StoredImage>;
  version: number;
}

interface LegacyStoredImage {
  id: string;
  dataUrl: string;
  mimeType: string;
  name: string;
  size: number;
  createdAt: string;
}

function openImageDatabase(): Promise<IDBDatabase> {
  return openDatabase(DB_NAME, STORE_NAME, DB_VERSION);
}

export class ImageStorage {
  private static instance: ImageStorage;

  private db: IDBDatabase | null = null;
  private openPromise: Promise<IDBDatabase> | null = null;
  private hydratePromise: Promise<void> | null = null;
  private cache = new Map<string, CachedImage>();
  private available = true;

  private constructor() {
    this.hydratePromise = this.hydrate();
  }

  static getInstance(): ImageStorage {
    if (!ImageStorage.instance) {
      ImageStorage.instance = new ImageStorage();
    }
    return ImageStorage.instance;
  }

  private async getDb(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (!this.openPromise) {
      this.openPromise = openImageDatabase();
    }
    this.db = await this.openPromise;
    return this.db;
  }

  /**
   * Loads every stored image into the in-memory URL cache and migrates any
   * legacy localStorage payloads. Runs once at startup; images resolve
   * synchronously from the cache afterwards.
   */
  private async hydrate(): Promise<void> {
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const records = await requestAsPromise(tx.objectStore(STORE_NAME).getAll() as IDBRequest<StoredImage[]>);

      for (const record of records) {
        if (!this.cache.has(record.id)) {
          this.cache.set(record.id, { url: URL.createObjectURL(record.blob), size: record.size });
        }
      }

      await this.migrateLegacyImages(db);
      reportStoreSize(SIZE_KEY, this.getTotalSize());
    } catch {
      // IndexedDB unavailable (private mode, test environment, ...):
      // the app keeps working, stored images resolve to the fallback.
      this.available = false;
    }

    notifyImageStoreChanged();
  }

  private async migrateLegacyImages(db: IDBDatabase): Promise<void> {
    let legacy: Record<string, LegacyStoredImage>;
    try {
      const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return;
      legacy = (JSON.parse(raw) as { images?: Record<string, LegacyStoredImage> }).images ?? {};
    } catch {
      return;
    }

    const entries = Object.values(legacy);
    if (entries.length === 0) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return;
    }

    try {
      // Decode everything BEFORE opening the write transaction: IndexedDB
      // transactions auto-close when the event loop yields to other work.
      const migrated: StoredImage[] = [];
      for (const item of entries) {
        if (this.cache.has(item.id)) continue;
        try {
          const blob = await dataUrlToBlob(item.dataUrl);
          migrated.push({
            id: item.id,
            name: item.name,
            mimeType: item.mimeType,
            size: blob.size || item.size,
            createdAt: item.createdAt,
            blob,
          });
        } catch {
          // Skip payloads that fail to decode; they would not render anyway.
        }
      }

      if (migrated.length > 0) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        for (const record of migrated) {
          store.put(record);
          this.cache.set(record.id, { url: URL.createObjectURL(record.blob), size: record.size });
        }
        await transactionDone(tx);
        notifyImageStoreChanged();
      }

      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } finally {
      reportStoreSize(SIZE_KEY, this.getTotalSize());
    }
  }

  /** Synchronous cache lookup — returns a displayable object URL or undefined. */
  getUrl(id: string): string | undefined {
    return this.cache.get(id)?.url;
  }

  has(id: string): boolean {
    return this.cache.has(id);
  }

  async add(id: string, file: File): Promise<{ success: boolean; error?: string; dataUrl?: string }> {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    if (this.cache.has(id)) {
      return { success: false, error: 'Image with this ID already exists.' };
    }

    if (!hasImageBudgetFor(file.size)) {
      return {
        success: false,
        error:
          'Image storage budget exceeded. The limit is 200MB across all images. Please delete some images.',
      };
    }

    try {
      const db = await this.getDb();
      const record: StoredImage = {
        id,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        createdAt: new Date().toISOString(),
        blob: file,
      };
      const tx = db.transaction(STORE_NAME, 'readwrite');
      await requestAsPromise(tx.objectStore(STORE_NAME).put(record) as IDBRequest<IDBValidKey>);

      const url = URL.createObjectURL(file);
      this.cache.set(id, { url, size: file.size });
      reportStoreSize(SIZE_KEY, this.getTotalSize());
      notifyImageStoreChanged();
      return { success: true, dataUrl: url };
    } catch {
      this.available = false;
      return { success: false, error: 'Failed to store image.' };
    }
  }

  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    const cached = this.cache.get(id);
    if (!cached) {
      return { success: false, error: 'Image not found.' };
    }

    try {
      const db = await this.getDb();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      await requestAsPromise(tx.objectStore(STORE_NAME).delete(id) as IDBRequest<undefined>);
    } catch {
      // Remove from cache even if the database write fails — the image is
      // gone for this session either way.
    }

    URL.revokeObjectURL(cached.url);
    this.cache.delete(id);
    reportStoreSize(SIZE_KEY, this.getTotalSize());
    notifyImageStoreChanged();
    return { success: true };
  }

  clear(): void {
    void (async () => {
      try {
        const db = await this.getDb();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        await requestAsPromise(tx.objectStore(STORE_NAME).clear() as IDBRequest<undefined>);
      } catch {
        // ignore
      }
      for (const cached of this.cache.values()) {
        URL.revokeObjectURL(cached.url);
      }
      this.cache.clear();
      reportStoreSize(SIZE_KEY, 0);
      notifyImageStoreChanged();
    })();
  }

  reload(): void {
    if (!this.hydratePromise) {
      this.hydratePromise = this.hydrate();
    }
  }

  isAvailable(): boolean {
    return this.available;
  }

  getTotalSize(): number {
    let total = 0;
    for (const cached of this.cache.values()) {
      total += cached.size;
    }
    return total;
  }

  getStorageUsage(): { used: number; limit: number; percentage: number } {
    return getImageStorageUsage();
  }
}

export const imageStorage = ImageStorage.getInstance();

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Invalid file type "${file.type}". Allowed: JPG, JPEG, PNG, WEBP.` };
  }

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 5MB limit.' };
  }

  return { valid: true };
}

export function generateImageId(): string {
  return `img_${crypto.randomUUID()}`;
}
