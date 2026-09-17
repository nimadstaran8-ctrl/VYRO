import type { MediaImage, StorageAdapter } from './types';

const MEDIA_STORAGE_KEY = 'vyro_media_library';

export interface MediaStorageData {
  images: Record<string, MediaImage>;
  version: number;
}

function getStorageData(): MediaStorageData {
  try {
    const data = localStorage.getItem(MEDIA_STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as MediaStorageData;
    }
  } catch (e) {
    console.error('Failed to read media storage:', e);
  }
  return { images: {}, version: 1 };
}

function setStorageData(data: MediaStorageData): void {
  try {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save media storage:', e);
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please remove some images.');
    }
    throw e;
  }
}

class LocalStorageAdapter implements StorageAdapter {
  private cachedImages: Record<string, MediaImage> | null = null;

  getAll(): Record<string, MediaImage> {
    if (this.cachedImages === null) {
      const data = getStorageData();
      this.cachedImages = data.images;
    }
    return this.cachedImages;
  }

  get(id: string): MediaImage | undefined {
    return this.getAll()[id];
  }

  add(image: MediaImage): { success: boolean; error?: string } {
    const images = this.getAll();
    
    if (images[image.id]) {
      return { success: false, error: 'Image with this ID already exists.' };
    }

    try {
      images[image.id] = image;
      this.cachedImages = images;
      setStorageData({ images, version: 1 });
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to save image.' };
    }
  }

  update(id: string, updates: Partial<MediaImage>): { success: boolean; error?: string } {
    const images = this.getAll();
    
    if (!images[id]) {
      return { success: false, error: 'Image not found.' };
    }

    try {
      images[id] = {
        ...images[id],
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      };
      this.cachedImages = images;
      setStorageData({ images, version: 1 });
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update image.' };
    }
  }

  delete(id: string): { success: boolean; error?: string } {
    const images = this.getAll();
    
    if (!images[id]) {
      return { success: false, error: 'Image not found.' };
    }

    try {
      delete images[id];
      this.cachedImages = images;
      setStorageData({ images, version: 1 });
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to delete image.' };
    }
  }

  clear(): void {
    this.cachedImages = {};
    setStorageData({ images: {}, version: 1 });
  }

  reload(): void {
    this.cachedImages = null;
    this.getAll();
  }
}

let adapter: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (!adapter) {
    adapter = new LocalStorageAdapter();
  }
  return adapter;
}

export function setStorageAdapter(newAdapter: StorageAdapter): void {
  adapter = newAdapter;
}

export function initializeDefaultMedia(): void {
  const storage = getStorageAdapter();
  const images = storage.getAll();
  
  if (Object.keys(images).length === 0) {
    const defaultImages: MediaImage[] = [
      {
        id: 'default-hero',
        name: 'Hero Background',
        alt: 'Hero background image',
        description: 'Main hero section background',
        url: '/images/hero/hero-fashion.svg',
        thumbnailUrl: '/images/hero/hero-fashion.svg',
        mimeType: 'image/svg+xml',
        size: 0,
        location: 'hero',
        usedIn: ['homepage-hero'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'default-fallback',
        name: 'Image Placeholder',
        alt: 'Placeholder for missing images',
        description: 'Fallback image for broken or missing images',
        url: '/images/site/fallback.svg',
        thumbnailUrl: '/images/site/fallback.svg',
        mimeType: 'image/svg+xml',
        size: 0,
        location: 'site',
        usedIn: ['system-fallback'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'default-about',
        name: 'About Brand Image',
        alt: 'VYRO brand story',
        description: 'About page brand imagery',
        url: '/images/site/about-brand.svg',
        thumbnailUrl: '/images/site/about-brand.svg',
        mimeType: 'image/svg+xml',
        size: 0,
        location: 'site',
        usedIn: ['about-page'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'default-summer',
        name: 'Summer Collection',
        alt: 'Summer collection banner',
        description: 'Summer 2026 collection image',
        url: '/images/categories/summer.svg',
        thumbnailUrl: '/images/categories/summer.svg',
        mimeType: 'image/svg+xml',
        size: 0,
        location: 'category',
        usedIn: ['collection-summer-2026'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'default-city',
        name: 'City Nights Collection',
        alt: 'City nights collection',
        description: 'City Nights collection banner',
        url: '/images/categories/city-nights.svg',
        thumbnailUrl: '/images/categories/city-nights.svg',
        mimeType: 'image/svg+xml',
        size: 0,
        location: 'category',
        usedIn: ['collection-city-nights'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'default-weekend',
        name: 'Weekend Collection',
        alt: 'Weekend collection',
        description: 'Weekend collection banner',
        url: '/images/categories/weekend.svg',
        thumbnailUrl: '/images/categories/weekend.svg',
        mimeType: 'image/svg+xml',
        size: 0,
        location: 'category',
        usedIn: ['collection-weekend'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'default-essentials',
        name: 'Essentials Collection',
        alt: 'Essentials collection',
        description: 'Essentials collection banner',
        url: '/images/categories/essentials.svg',
        thumbnailUrl: '/images/categories/essentials.svg',
        mimeType: 'image/svg+xml',
        size: 0,
        location: 'category',
        usedIn: ['collection-essentials'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultImages.forEach(img => {
      storage.add(img);
    });
  }
}
