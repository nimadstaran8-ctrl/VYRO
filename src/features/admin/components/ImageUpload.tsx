import { useCallback, useState, useRef } from 'react';
import { Upload, X, Star, GripVertical, Pencil } from 'lucide-react';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { cn } from '../../../lib/utils';
import { validateImageFile, imageStorage, generateImageId } from '../services/imageStorage';
import { useLanguageStore } from '../../../stores/languageStore';
import { t } from '../../../lib/i18n';

export interface UploadedImage {
  id: string;
  dataUrl: string;
  isPrimary: boolean;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  error?: string;
}

export function ImageUpload({ images, onImagesChange, error }: ImageUploadProps) {
  const language = useLanguageStore((state) => state.language);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const content = {
    productImages: t('admin.productImages', language),
    uploadImages: t('admin.uploadImages', language),
    clickToUpload: t('admin.clickToUpload', language),
    dragDropFiles: t('admin.dragDropFiles', language),
    uploading: t('admin.uploading', language),
    invalidFile: language === 'fa' ? 'فایل نامعتبر است' : 'Invalid file',
    failedToStore: language === 'fa' ? 'خطا در ذخیره تصویر' : 'Failed to store image',
    imagesUploaded: language === 'fa' ? 'تصویر آپلود شد' : 'images uploaded',
    primarySelected: t('admin.primaryImageSelected', language),
    confirmDelete: language === 'fa' ? 'آیا مطمئن هستید که می‌خواهید این تصویر را حذف کنید؟' : 'Are you sure you want to delete this image?',
    cancelDelete: language === 'fa' ? 'لغو' : 'Cancel',
    confirmDeleteAction: language === 'fa' ? 'حذف تصویر' : 'Delete Image',
    replaceImage: language === 'fa' ? 'تغییر تصویر' : 'Replace Image',
    selectNewImage: language === 'fa' ? 'انتخاب تصویر جدید' : 'Select new image',
  };

  const handleFileSelect = useCallback(async (files: FileList | null, targetIndex?: number) => {
    if (!files || files.length === 0) return;

    setUploadError(null);

    if (targetIndex !== undefined && targetIndex !== null) {
      const file = files[0];
      const validation = validateImageFile(file);

      if (!validation.valid) {
        setUploadError(validation.error || content.invalidFile);
        return;
      }

      const existingImage = images[targetIndex];
      const newId = generateImageId();
      const result = await imageStorage.add(newId, file);

      if (!result.success) {
        setUploadError(result.error || content.failedToStore);
        return;
      }

      imageStorage.delete(existingImage.id);

      const updatedImages = images.map((img, idx) =>
        idx === targetIndex
          ? { id: newId, dataUrl: result.dataUrl!, isPrimary: img.isPrimary }
          : img
      );
      onImagesChange(updatedImages);
      setReplaceIndex(null);
      return;
    }

    setIsUploading(true);

    const newImages: UploadedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageFile(file);

      if (!validation.valid) {
        setUploadError(validation.error || content.invalidFile);
        continue;
      }

      const id = generateImageId();
      const result = await imageStorage.add(id, file);

      if (!result.success) {
        setUploadError(result.error || content.failedToStore);
        continue;
      }

      newImages.push({
        id,
        dataUrl: result.dataUrl!,
        isPrimary: images.length === 0 && newImages.length === 0,
      });
    }

    setIsUploading(false);

    if (newImages.length > 0) {
      if (images.length === 0) {
        newImages[0].isPrimary = true;
      }
      onImagesChange([...images, ...newImages]);
    }
  }, [images, onImagesChange, content]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (replaceIndex !== null) {
      handleFileSelect(e.target.files, replaceIndex);
    } else {
      handleFileSelect(e.target.files);
    }
    e.target.value = '';
  }, [handleFileSelect, replaceIndex]);

  const handleRemove = useCallback((id: string) => {
    setDeleteConfirm(id);
  }, []);

  const confirmRemove = useCallback(() => {
    if (!deleteConfirm) return;

    const imageToRemove = images.find(img => img.id === deleteConfirm);
    if (imageToRemove) {
      imageStorage.delete(deleteConfirm);
    }

    let remaining = images.filter(img => img.id !== deleteConfirm);

    if (remaining.length > 0 && !remaining.some(img => img.isPrimary)) {
      remaining = remaining.map((img, idx) =>
        idx === 0 ? { ...img, isPrimary: true } : img
      );
    }

    onImagesChange(remaining);
    setDeleteConfirm(null);
  }, [deleteConfirm, images, onImagesChange]);

  const cancelDelete = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  const handleSetPrimary = useCallback((id: string) => {
    onImagesChange(
      images.map(img => ({
        ...img,
        isPrimary: img.id === id,
      }))
    );
  }, [images, onImagesChange]);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    const reordered = [...images];
    const [removed] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, removed);
    onImagesChange(reordered);
  }, [images, onImagesChange]);

  const handleReplaceClick = useCallback((index: number) => {
    setReplaceIndex(index);
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-primary">
        {content.productImages}
      </label>

      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          error && 'border-red-500'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={content.uploadImages}
        />

        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-10 w-10 text-text-secondary mb-3" />
          <p className="text-sm font-medium text-primary mb-1">
            {isUploading ? content.uploading : content.clickToUpload}
          </p>
          <p className="text-xs text-text-secondary">
            {content.dragDropFiles}
          </p>
        </div>
      </div>

      {(error || uploadError) && (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {error || uploadError}
        </p>
      )}

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <ImagePreview
              key={image.id}
              image={image}
              index={index}
              total={images.length}
              onRemove={handleRemove}
              onSetPrimary={handleSetPrimary}
              onReorder={handleReorder}
              onReplace={handleReplaceClick}
              language={language}
            />
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="mt-2 text-xs text-text-secondary">
          {images.length} {content.imagesUploaded}
          {images.some(img => img.isPrimary) && (
            <span className="ms-2 text-primary">• {content.primarySelected}</span>
          )}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {deleteConfirm && (
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={cancelDelete}
          onConfirm={confirmRemove}
          title={language === 'fa' ? 'حذف تصویر' : 'Delete Image'}
          message={content.confirmDelete}
          confirmText={content.confirmDeleteAction}
          cancelText={content.cancelDelete}
          variant="danger"
        />
      )}
    </div>
  );
}

interface ImagePreviewProps {
  image: UploadedImage;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onReplace: (index: number) => void;
  language: 'fa' | 'en';
}

function ImagePreview({ image, index, total, onRemove, onSetPrimary, onReorder, onReplace, language }: ImagePreviewProps) {
  const [imgError, setImgError] = useState(false);

  const content = {
    failedToLoad: t('admin.failedToLoad', language),
    primary: language === 'fa' ? 'اصلی' : 'Primary',
    setAsPrimary: t('admin.setAsPrimary', language),
    moveImageLeft: t('admin.moveImageLeft', language),
    moveImageRight: t('admin.moveImageRight', language),
    removeImage: t('admin.removeImage', language),
    replaceImage: language === 'fa' ? 'تغییر' : 'Replace',
  };

  return (
    <div
      className={cn(
        'relative group rounded-lg overflow-hidden border-2 transition-colors',
        image.isPrimary ? 'border-primary' : 'border-transparent'
      )}
    >
      <div className="aspect-square bg-surface">
        {!imgError ? (
          <img
            src={image.dataUrl}
            alt={`Product image ${index + 1}`}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-background text-text-secondary">
            <span className="text-xs">{content.failedToLoad}</span>
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        {index > 0 && (
          <button
            type="button"
            onClick={() => onReorder(index, index - 1)}
            className="p-1.5 bg-white/90 rounded-full hover:bg-white"
            aria-label={content.moveImageLeft}
          >
            <GripVertical className="h-4 w-4 text-primary rtl:rotate-180" />
          </button>
        )}
        {index < total - 1 && (
          <button
            type="button"
            onClick={() => onReorder(index, index + 1)}
            className="p-1.5 bg-white/90 rounded-full hover:bg-white"
            aria-label={content.moveImageRight}
          >
            <GripVertical className="h-4 w-4 text-primary -rotate-180 rtl:rotate-0" />
          </button>
        )}
      </div>

      {image.isPrimary && (
        <div className="absolute top-2 start-2 flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs rounded-full">
          <Star className="h-3 w-3 fill-current" />
          {content.primary}
        </div>
      )}

      <div className="absolute top-2 end-2 flex gap-1">
        {!image.isPrimary && (
          <button
            type="button"
            onClick={() => onSetPrimary(image.id)}
            className="p-1.5 bg-white/90 rounded-full hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={content.setAsPrimary}
            title={content.setAsPrimary}
          >
            <Star className="h-4 w-4 text-primary" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onReplace(index)}
          className="p-1.5 bg-white/90 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
          aria-label={content.replaceImage}
          title={content.replaceImage}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(image.id)}
          className="p-1.5 bg-white/90 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
          aria-label={content.removeImage}
          title={content.removeImage}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}