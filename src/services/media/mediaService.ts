import type {
  MediaImage,
  MediaUploadData,
  MediaUpdateData,
  MediaFilter,
  MediaSort,
  MediaLocation,
  UploadResult,
} from './types';
import {
  generateMediaId,
  isValidImageMimeType,
} from './types';
import { getStorageAdapter, initializeDefaultMedia } from './mediaRepository';

const FALLBACK_IMAGE = '/images/site/fallback.svg';

let initialized = false;

function ensureInitialized(): void {
  if (!initialized) {
    initializeDefaultMedia();
    initialized = true;
  }
}

function createImageFromUpload(
  id: string,
  dataUrl: string,
  uploadData: MediaUploadData,
  file: File
): MediaImage {
  const now = new Date().toISOString();
  return {
    id,
    name: uploadData.name || file.name,
    alt: uploadData.alt || uploadData.name || file.name,
    description: uploadData.description || '',
    url: dataUrl,
    thumbnailUrl: dataUrl,
    mimeType: file.type,
    size: file.size,
    location: uploadData.location,
    usedIn: [],
    createdAt: now,
    updatedAt: now,
  };
}

export async function uploadImage(
  uploadData: MediaUploadData
): Promise<UploadResult> {
  ensureInitialized();

  const validation = validateImageFile(uploadData.file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const id = generateMediaId();
  const storage = getStorageAdapter();

  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const dataUrl = reader.result as string;
      
      try {
        const image = createImageFromUpload(id, dataUrl, uploadData, uploadData.file);
        const result = storage.add(image);
        
        if (result.success) {
          resolve({ success: true, media: image });
        } else {
          resolve({ success: false, error: result.error });
        }
      } catch {
        resolve({ success: false, error: 'Failed to process image.' });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read file.' });
    };

    reader.readAsDataURL(uploadData.file);
  });
}

export function getImage(id: string): MediaImage | undefined {
  ensureInitialized();
  return getStorageAdapter().get(id);
}

export function getImageUrl(id: string): string {
  const image = getImage(id);
  if (image) {
    return image.url;
  }
  if (id.startsWith('/') || id.startsWith('http')) {
    return id;
  }
  return FALLBACK_IMAGE;
}

export function getAllImages(): MediaImage[] {
  ensureInitialized();
  const images = getStorageAdapter().getAll();
  return Object.values(images);
}

export function getImagesByLocation(location: MediaLocation): MediaImage[] {
  return getAllImages().filter(img => img.location === location);
}

export function getImagesUsedIn(usageId: string): MediaImage[] {
  return getAllImages().filter(img => img.usedIn.includes(usageId));
}

export function updateImage(id: string, updates: MediaUpdateData): { success: boolean; error?: string } {
  ensureInitialized();
  return getStorageAdapter().update(id, updates);
}

export function deleteImage(id: string): { success: boolean; error?: string } {
  ensureInitialized();
  return getStorageAdapter().delete(id);
}

export function replaceImage(
  id: string,
  newFile: File
): Promise<UploadResult> {
  return new Promise((resolve) => {
    const validation = validateImageFile(newFile);
    if (!validation.valid) {
      resolve({ success: false, error: validation.error });
      return;
    }

    const reader = new FileReader();
    
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const now = new Date().toISOString();
      
      try {
        const storage = getStorageAdapter();
        const existing = storage.get(id);
        
        if (!existing) {
          resolve({ success: false, error: 'Image not found.' });
          return;
        }

        const updated: MediaImage = {
          ...existing,
          url: dataUrl,
          thumbnailUrl: dataUrl,
          mimeType: newFile.type,
          size: newFile.size,
          updatedAt: now,
        };

        const result = storage.update(id, updated);
        
        if (result.success) {
          resolve({ success: true, media: updated });
        } else {
          resolve({ success: false, error: result.error });
        }
      } catch {
        resolve({ success: false, error: 'Failed to replace image.' });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read file.' });
    };

    reader.readAsDataURL(newFile);
  });
}

export function registerImageUsage(imageId: string, usageId: string): void {
  ensureInitialized();
  const image = getStorageAdapter().get(imageId);
  if (image && !image.usedIn.includes(usageId)) {
    getStorageAdapter().update(imageId, {
      usedIn: [...image.usedIn, usageId],
    });
  }
}

export function unregisterImageUsage(imageId: string, usageId: string): void {
  ensureInitialized();
  const image = getStorageAdapter().get(imageId);
  if (image) {
    getStorageAdapter().update(imageId, {
      usedIn: image.usedIn.filter(id => id !== usageId),
    });
  }
}

export function filterImages(filter: MediaFilter): MediaImage[] {
  let images = getAllImages();

  if (filter.search) {
    const search = filter.search.toLowerCase();
    images = images.filter(
      img =>
        img.name.toLowerCase().includes(search) ||
        img.alt.toLowerCase().includes(search) ||
        img.description.toLowerCase().includes(search)
    );
  }

  if (filter.location) {
    images = images.filter(img => img.location === filter.location);
  }

  if (filter.mimeType) {
    images = images.filter(img => img.mimeType === filter.mimeType);
  }

  return images;
}

export function sortImages(images: MediaImage[], sort: MediaSort): MediaImage[] {
  const sorted = [...images];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sort.field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
    }
    
    return sort.order === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}

export function searchImages(
  query: string,
  limit = 20
): MediaImage[] {
  if (!query.trim()) {
    return [];
  }

  const search = query.toLowerCase();
  const all = getAllImages();
  
  return all
    .filter(
      img =>
        img.name.toLowerCase().includes(search) ||
        img.alt.toLowerCase().includes(search)
    )
    .slice(0, limit);
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!isValidImageMimeType(file.type)) {
    return {
      valid: false,
      error: `Invalid file type "${file.type}". Allowed: JPG, JPEG, PNG, WEBP, SVG.`,
    };
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds 5MB limit.`,
    };
  }

  return { valid: true };
}

export function getStorageUsage(): { used: number; limit: number; percentage: number } {
  const images = getAllImages();
  const used = images.reduce((total, img) => total + img.size, 0);
  const limit = 5 * 1024 * 1024;
  
  return {
    used,
    limit,
    percentage: (used / limit) * 100,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getLocationLabel(location: MediaLocation): string {
  const labels: Record<MediaLocation, string> = {
    product: 'Product',
    collection: 'Collection',
    hero: 'Hero',
    banner: 'Banner',
    category: 'Category',
    site: 'Site',
    other: 'Other',
  };
  return labels[location] || location;
}

export function reloadMediaLibrary(): void {
  getStorageAdapter().reload();
  initialized = false;
  ensureInitialized();
}
