const IMAGE_STORAGE_KEY = 'vyro_image_storage';

export interface StoredImage {
  id: string;
  dataUrl: string;
  mimeType: string;
  name: string;
  size: number;
  createdAt: string;
}

export interface ImageStorageData {
  images: Record<string, StoredImage>;
  version: number;
}

const MAX_STORAGE_SIZE = 5 * 1024 * 1024;

function getStorageData(): ImageStorageData {
  try {
    const data = localStorage.getItem(IMAGE_STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as ImageStorageData;
    }
  } catch (e) {
    console.error('Failed to read image storage:', e);
  }
  return { images: {}, version: 1 };
}

function setStorageData(data: ImageStorageData): void {
  try {
    const serialized = JSON.stringify(data);
    if (serialized.length > MAX_STORAGE_SIZE) {
      throw new Error('Image storage limit exceeded. Please remove some images.');
    }
    localStorage.setItem(IMAGE_STORAGE_KEY, serialized);
  } catch (e) {
    console.error('Failed to save image storage:', e);
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please delete some images.');
    }
    throw e;
  }
}

export class ImageStorage {
  private static instance: ImageStorage;
  private cachedImages: Record<string, StoredImage> | null = null;

  private constructor() {}

  static getInstance(): ImageStorage {
    if (!ImageStorage.instance) {
      ImageStorage.instance = new ImageStorage();
    }
    return ImageStorage.instance;
  }

  getAll(): Record<string, StoredImage> {
    if (this.cachedImages === null) {
      const data = getStorageData();
      this.cachedImages = data.images;
    }
    return this.cachedImages;
  }

  get(id: string): StoredImage | undefined {
    return this.getAll()[id];
  }

  async add(id: string, file: File): Promise<{ success: boolean; error?: string; dataUrl?: string }> {
    const images = this.getAll();
    
    if (images[id]) {
      return { success: false, error: 'Image with this ID already exists.' };
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        
        try {
          const storedImage: StoredImage = {
            id,
            dataUrl,
            mimeType: file.type,
            name: file.name,
            size: file.size,
            createdAt: new Date().toISOString(),
          };

          images[id] = storedImage;
          this.cachedImages = images;
          setStorageData({ images, version: 1 });
          resolve({ success: true, dataUrl });
        } catch {
          resolve({ success: false, error: 'Failed to store image.' });
        }
      };
      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to read image file.' });
      };
      reader.readAsDataURL(file);
    });
  }

  addSync(id: string, dataUrl: string, metadata: { mimeType: string; name: string; size: number }): { success: boolean; error?: string } {
    const images = this.getAll();
    
    if (images[id]) {
      return { success: false, error: 'Image with this ID already exists.' };
    }

    try {
      const storedImage: StoredImage = {
        id,
        dataUrl,
        mimeType: metadata.mimeType,
        name: metadata.name,
        size: metadata.size,
        createdAt: new Date().toISOString(),
      };

      images[id] = storedImage;
      this.cachedImages = images;
      setStorageData({ images, version: 1 });
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to store image.' };
    }
  }

  delete(id: string): { success: boolean; error?: string } {
    const images = this.getAll();
    
    if (!images[id]) {
      return { success: false, error: 'Image not found.' };
    }

    delete images[id];
    this.cachedImages = images;
    setStorageData({ images, version: 1 });
    return { success: true };
  }

  clear(): void {
    this.cachedImages = {};
    setStorageData({ images: {}, version: 1 });
  }

  reload(): void {
    this.cachedImages = null;
    this.getAll();
  }

  getTotalSize(): number {
    const images = this.getAll();
    return Object.values(images).reduce((total, img) => total + img.size, 0);
  }

  getStorageUsage(): { used: number; limit: number; percentage: number } {
    const used = this.getTotalSize();
    return {
      used,
      limit: MAX_STORAGE_SIZE,
      percentage: (used / MAX_STORAGE_SIZE) * 100,
    };
  }
}

export const imageStorage = ImageStorage.getInstance();

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Invalid file type "${file.type}". Allowed: JPG, JPEG, PNG, WEBP.` };
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds 5MB limit.` };
  }

  return { valid: true };
}

export function generateImageId(): string {
  return `img_${crypto.randomUUID()}`;
}
