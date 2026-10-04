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
import { getMediaRepository, type StoredMediaRecord } from './mediaRepository';
import { logActivity } from '../logs/logService';

const FALLBACK_IMAGE = '/images/site/fallback.svg';

const repository = getMediaRepository();

export async function uploadImage(
  uploadData: MediaUploadData
): Promise<UploadResult> {
  const validation = validateImageFile(uploadData.file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const id = generateMediaId();
  const now = new Date().toISOString();
  const record: StoredMediaRecord = {
    id,
    name: uploadData.name || uploadData.file.name,
    alt: uploadData.alt || uploadData.name || uploadData.file.name,
    description: uploadData.description || '',
    mimeType: uploadData.file.type,
    size: uploadData.file.size,
    location: uploadData.location,
    usedIn: [],
    createdAt: now,
    updatedAt: now,
    blob: uploadData.file,
  };

  const result = await repository.put(record);
  if (result.success) {
    logActivity({ type: 'media-uploaded', entityId: id, detail: { name: record.name } });
    return { success: true, media: repository.get(id) };
  }
  return { success: false, error: result.error };
}

export function getImage(id: string): MediaImage | undefined {
  return repository.get(id);
}

export function getImageUrl(id: string): string {
  const image = repository.get(id);
  if (image) {
    return image.url;
  }
  if (id.startsWith('/') || id.startsWith('http')) {
    return id;
  }
  return FALLBACK_IMAGE;
}

/**
 * Resolves a persisted image reference: media record IDs (uploaded images)
 * resolve to their session object URL, plain paths/URLs pass through.
 */
export function resolveMediaRef(ref: string): string {
  if (!ref) return FALLBACK_IMAGE;
  const image = repository.get(ref);
  if (image) return image.url;
  return ref;
}

export function getAllImages(): MediaImage[] {
  return repository.getAll();
}

export function getImagesByLocation(location: MediaLocation): MediaImage[] {
  return getAllImages().filter(img => img.location === location);
}

export function getImagesUsedIn(usageId: string): MediaImage[] {
  return getAllImages().filter(img => img.usedIn.includes(usageId));
}

export async function updateImage(
  id: string,
  updates: MediaUpdateData
): Promise<{ success: boolean; error?: string }> {
  const result = await repository.update(id, updates);
  if (result.success) {
    logActivity({ type: 'media-updated', entityId: id, detail: { name: repository.get(id)?.name } });
  }
  return result;
}

export async function deleteImage(id: string): Promise<{ success: boolean; error?: string }> {
  const name = repository.get(id)?.name;
  const result = await repository.remove(id);
  if (result.success) {
    logActivity({ type: 'media-deleted', entityId: id, detail: { name } });
  }
  return result;
}

export async function replaceImage(
  id: string,
  newFile: File
): Promise<UploadResult> {
  const validation = validateImageFile(newFile);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const existing = repository.get(id);
  if (!existing) {
    return { success: false, error: 'Image not found.' };
  }

  const record: StoredMediaRecord = {
    id,
    name: existing.name,
    alt: existing.alt,
    description: existing.description,
    mimeType: newFile.type,
    size: newFile.size,
    location: existing.location,
    usedIn: existing.usedIn,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
    blob: newFile,
  };

  const result = await repository.put(record);
  if (result.success) {
    logActivity({ type: 'media-updated', entityId: id, detail: { name: record.name } });
    return { success: true, media: repository.get(id) };
  }
  return { success: false, error: result.error };
}

export async function registerImageUsage(imageId: string, usageId: string): Promise<void> {
  const image = repository.get(imageId);
  if (image && !image.usedIn.includes(usageId)) {
    await repository.setUsedIn(imageId, [...image.usedIn, usageId]);
  }
}

export async function unregisterImageUsage(imageId: string, usageId: string): Promise<void> {
  const image = repository.get(imageId);
  if (image && image.usedIn.includes(usageId)) {
    await repository.setUsedIn(imageId, image.usedIn.filter(id => id !== usageId));
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
  return repository.getStorageUsage();
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
  repository.reload();
}
