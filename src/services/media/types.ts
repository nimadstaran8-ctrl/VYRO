export type ImageLocation = 
  | 'product'
  | 'collection'
  | 'hero'
  | 'banner'
  | 'category'
  | 'site'
  | 'other';

export type MediaLocation = ImageLocation;

export interface MediaImage {
  id: string;
  name: string;
  alt: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  location: ImageLocation;
  usedIn: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MediaUploadData {
  file: File;
  name: string;
  alt: string;
  description: string;
  location: ImageLocation;
}

export interface MediaUpdateData {
  name?: string;
  alt?: string;
  description?: string;
  location?: ImageLocation;
}

export interface MediaFilter {
  search?: string;
  location?: ImageLocation;
  mimeType?: string;
}

export type MediaSortField = 'name' | 'createdAt' | 'updatedAt' | 'size';
export type MediaSortOrder = 'asc' | 'desc';

export interface MediaSort {
  field: MediaSortField;
  order: MediaSortOrder;
}

export interface UploadResult {
  success: boolean;
  media?: MediaImage;
  error?: string;
}

export interface StorageAdapter {
  getAll(): Record<string, MediaImage>;
  get(id: string): MediaImage | undefined;
  add(image: MediaImage): { success: boolean; error?: string };
  update(id: string, image: Partial<MediaImage>): { success: boolean; error?: string };
  delete(id: string): { success: boolean; error?: string };
  clear(): void;
  reload(): void;
}

export function isValidImageMimeType(mimeType: string): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
  return allowedTypes.includes(mimeType.toLowerCase());
}

export function getImageExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
  };
  return map[mimeType.toLowerCase()] || 'jpg';
}

export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateMediaId(): string {
  return `media_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
}
