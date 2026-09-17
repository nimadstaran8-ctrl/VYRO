import { useState, useMemo, useCallback, useRef } from 'react';
import { 
  Search, Upload, Edit2, Trash2, X, ChevronDown, 
  ImageIcon, AlertTriangle, RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useLanguageStore } from '../../stores/languageStore';
import { t, type Language } from '../../lib/i18n';
import {
  getAllImages,
  uploadImage,
  updateImage,
  deleteImage,
  replaceImage,
  filterImages,
  sortImages,
  formatFileSize,
  getStorageUsage,
  type MediaImage,
  type ImageLocation,
  type MediaSortField,
  type MediaSortOrder,
} from '../../services/media';
import { ReusableImage } from '../../components/ui/ReusableImage';

const LOCATION_OPTIONS: ImageLocation[] = ['product', 'collection', 'hero', 'banner', 'category', 'site', 'other'];

export function AdminMediaLibrary() {
  const lang = useLanguageStore((state) => state.language);
  const language = lang as Language;
  const [images, setImages] = useState<MediaImage[]>(() => getAllImages());
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState<ImageLocation | ''>('');
  const [sortField, setSortField] = useState<MediaSortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<MediaSortOrder>('desc');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingImage, setEditingImage] = useState<MediaImage | null>(null);
  const [replacingImage, setReplacingImage] = useState<MediaImage | null>(null);
  const [deletingImage, setDeletingImage] = useState<MediaImage | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const refreshImages = useCallback(() => {
    setImages(getAllImages());
  }, []);

  const filteredImages = useMemo(() => {
    let result = filterImages({
      search: search || undefined,
      location: locationFilter || undefined,
    });
    result = sortImages(result, { field: sortField, order: sortOrder });
    return result;
  }, [search, locationFilter, sortField, sortOrder]);

  const storageUsage = getStorageUsage();

  const handleImageError = (imageId: string) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

  const handleUploadSuccess = () => {
    refreshImages();
    setShowUploadModal(false);
    showNotification('success', t('media.uploadSuccess', language));
  };

  const handleUpdateSuccess = () => {
    refreshImages();
    setEditingImage(null);
    showNotification('success', t('media.updateSuccess', language));
  };

  const handleReplaceSuccess = () => {
    refreshImages();
    setReplacingImage(null);
    showNotification('success', t('media.replaceSuccess', language));
  };

  const handleDeleteSuccess = () => {
    refreshImages();
    setDeletingImage(null);
    showNotification('success', t('media.deleteSuccess', language));
  };

  const getLocationLabel = (loc: ImageLocation) => {
    const key = `media.${loc}` as const;
    return t(key, language);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary">{t('media.title', language)}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {images.length} {t('media.imagesCount', language)}
          </p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <Upload className="h-4 w-4 ltr:ml-2 rtl:mr-2" />
          {t('media.upload', language)}
        </Button>
      </div>

      {/* Storage Usage */}
      <div className="mb-6 rounded-xl bg-surface p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">{t('media.storageUsage', language)}</span>
          <span className="text-sm font-medium text-primary">
            {formatFileSize(storageUsage.used)} / {formatFileSize(storageUsage.limit)}
          </span>
        </div>
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all"
            style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
          <input
            type="text"
            placeholder={t('media.searchPlaceholder', language)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-10 pe-4 py-3 rounded-xl border border-border bg-surface text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
          />
        </div>
        
        <div className="relative">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value as ImageLocation | '')}
            className="appearance-none rounded-xl border border-border bg-surface px-4 py-3 pr-10 text-primary focus:border-primary focus:outline-none cursor-pointer"
          >
            <option value="">{t('media.allLocations', language)}</option>
            {LOCATION_OPTIONS.map(loc => (
              <option key={loc} value={loc}>{getLocationLabel(loc)}</option>
            ))}
          </select>
          <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={`${sortField}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-') as [MediaSortField, MediaSortOrder];
              setSortField(field);
              setSortOrder(order);
            }}
            className="appearance-none rounded-xl border border-border bg-surface px-4 py-3 pr-10 text-primary focus:border-primary focus:outline-none cursor-pointer"
          >
            <option value="updatedAt-desc">{t('media.dateUpdated', language)} ({t('media.descending', language)})</option>
            <option value="updatedAt-asc">{t('media.dateUpdated', language)} ({t('media.ascending', language)})</option>
            <option value="createdAt-desc">{t('media.dateCreated', language)} ({t('media.descending', language)})</option>
            <option value="createdAt-asc">{t('media.dateCreated', language)} ({t('media.ascending', language)})</option>
            <option value="name-asc">{t('media.name', language)} ({t('media.ascending', language)})</option>
            <option value="name-desc">{t('media.name', language)} ({t('media.descending', language)})</option>
            <option value="size-desc">{t('media.fileSize', language)} ({t('media.descending', language)})</option>
            <option value="size-asc">{t('media.fileSize', language)} ({t('media.ascending', language)})</option>
          </select>
          <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
        </div>
      </div>

      {/* Image Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl">
          <ImageIcon className="h-12 w-12 mx-auto text-text-secondary/50 mb-4" />
          <h3 className="text-lg font-medium text-primary mb-1">
            {search || locationFilter ? t('media.noImages', language) : t('media.noImagesYet', language)}
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            {!search && !locationFilter && t('media.uploadFirst', language)}
          </p>
          {!search && !locationFilter && (
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="h-4 w-4 ltr:ml-2 rtl:mr-2" />
              {t('media.uploadNew', language)}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredImages.map(image => (
            <ImageCard
              key={image.id}
              image={image}
              language={language}
              hasError={imageErrors[image.id]}
              onError={() => handleImageError(image.id)}
              onEdit={() => setEditingImage(image)}
              onReplace={() => setReplacingImage(image)}
              onDelete={() => setDeletingImage(image)}
              onImageError={() => handleImageError(image.id)}
            />
          ))}
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 end-4 rounded-xl px-4 py-3 shadow-lg ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          language={language}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
          onError={(msg) => showNotification('error', msg)}
        />
      )}

      {/* Edit Modal */}
      {editingImage && (
        <EditModal
          image={editingImage}
          language={language}
          onClose={() => setEditingImage(null)}
          onSuccess={handleUpdateSuccess}
          onError={(msg) => showNotification('error', msg)}
        />
      )}

      {/* Replace Modal */}
      {replacingImage && (
        <ReplaceModal
          image={replacingImage}
          language={language}
          onClose={() => setReplacingImage(null)}
          onSuccess={handleReplaceSuccess}
          onError={(msg) => showNotification('error', msg)}
        />
      )}

      {/* Delete Confirmation */}
      {deletingImage && (
        <ConfirmDialog
          isOpen={!!deletingImage}
          onClose={() => setDeletingImage(null)}
          onConfirm={() => {
            const result = deleteImage(deletingImage.id);
            if (result.success) {
              handleDeleteSuccess();
            } else {
              showNotification('error', result.error || t('media.deleteError', language));
            }
          }}
          title={t('media.deleteTitle', language)}
          message={deletingImage.usedIn.length > 0 
            ? `${t('media.cannotDelete', language)}\n\n${t('media.deleteWarning', language)}\n${deletingImage.usedIn.join(', ')}`
            : t('media.deleteDescription', language)
          }
          confirmText={t('media.delete', language)}
          cancelText={t('media.cancel', language)}
          variant="danger"
        />
      )}
    </div>
  );
}

interface ImageCardProps {
  image: MediaImage;
  language: Language;
  hasError?: boolean;
  onError?: () => void;
  onEdit: () => void;
  onReplace: () => void;
  onDelete: () => void;
  onImageError: () => void;
}

function ImageCard({ image, language, hasError, onEdit, onReplace, onDelete, onImageError }: ImageCardProps) {
  return (
    <div className="group rounded-2xl bg-surface overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square relative overflow-hidden bg-background">
        <ReusableImage
          src={hasError ? '/images/site/fallback.svg' : image.thumbnailUrl}
          alt={image.alt}
          onError={onImageError}
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="rounded-full bg-white/90 p-2 text-primary hover:bg-white transition-colors"
            title={t('media.editImage', language)}
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onReplace}
            className="rounded-full bg-white/90 p-2 text-primary hover:bg-white transition-colors"
            title={t('media.replaceImage', language)}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition-colors"
            title={t('media.deleteImage', language)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-3">
        <p className="font-medium text-primary truncate text-sm">{image.name}</p>
        <p className="text-xs text-text-secondary mt-0.5">{formatFileSize(image.size)}</p>
        {image.usedIn.length > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            <span>{image.usedIn.length} {t('media.usedIn', language)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface UploadModalProps {
  language: Language;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

function UploadModal({ language, onClose, onSuccess, onError }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [alt, setAlt] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<ImageLocation>('product');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      onError(t('media.invalidFile', language));
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      onError(t('media.fileTooLarge', language));
      return;
    }
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
    if (!name) {
      setName(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    const result = await uploadImage({
      file,
      name,
      alt,
      description,
      location,
    });
    setIsUploading(false);
    if (result.success) {
      onSuccess();
    } else {
      onError(result.error || t('media.uploadError', language));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">{t('media.uploadNew', language)}</h2>
          <button onClick={onClose} className="p-1 text-text-secondary hover:text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            <Upload className="h-10 w-10 mx-auto text-text-secondary mb-3" />
            <p className="text-sm text-primary">{t('media.dragDrop', language)}</p>
            <p className="text-xs text-text-secondary mt-1">{t('media.supportedFormats', language)}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {preview && (
              <div className="aspect-video rounded-xl overflow-hidden bg-background">
                <img src={preview} alt="Preview" className="h-full w-full object-contain" />
              </div>
            )}
            <Input
              label={t('media.imageName', language)}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('media.imageName', language)}
            />
            <Input
              label={t('media.altText', language)}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder={t('media.altText', language)}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary">
                {t('media.description', language)}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('media.description', language)}
                rows={2}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary">
                {t('media.location', language)}
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as ImageLocation)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-primary focus:border-primary focus:outline-none"
              >
                {LOCATION_OPTIONS.map(loc => (
                  <option key={loc} value={loc}>{t(`media.${loc}`, language)}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t('media.cancel', language)}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            isLoading={isUploading}
            className="flex-1"
          >
            {isUploading ? t('media.uploading', language) : t('media.upload', language)}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface EditModalProps {
  image: MediaImage;
  language: Language;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

function EditModal({ image, language, onClose, onSuccess, onError }: EditModalProps) {
  const [name, setName] = useState(image.name);
  const [alt, setAlt] = useState(image.alt);
  const [description, setDescription] = useState(image.description);
  const [location, setLocation] = useState<ImageLocation>(image.location);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    const result = updateImage(image.id, { name, alt, description, location });
    setIsSaving(false);
    if (result.success) {
      onSuccess();
    } else {
      onError(result.error || t('media.updateError', language));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">{t('media.editTitle', language)}</h2>
          <button onClick={onClose} className="p-1 text-text-secondary hover:text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="aspect-video rounded-xl overflow-hidden bg-background mb-4">
          <img src={image.thumbnailUrl} alt={image.alt} className="h-full w-full object-contain" />
        </div>

        <div className="space-y-4">
          <Input
            label={t('media.imageName', language)}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label={t('media.altText', language)}
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary">
              {t('media.description', language)}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary">
              {t('media.location', language)}
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as ImageLocation)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-primary focus:border-primary focus:outline-none"
            >
              {LOCATION_OPTIONS.map(loc => (
                <option key={loc} value={loc}>{t(`media.${loc}`, language)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t('media.cancel', language)}
          </Button>
          <Button onClick={handleSave} isLoading={isSaving} className="flex-1">
            {t('media.save', language)}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ReplaceModalProps {
  image: MediaImage;
  language: Language;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

function ReplaceModal({ image, language, onClose, onSuccess, onError }: ReplaceModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      onError(t('media.invalidFile', language));
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      onError(t('media.fileTooLarge', language));
      return;
    }
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleReplace = async () => {
    if (!file) return;
    setIsReplacing(true);
    const result = await replaceImage(image.id, file);
    setIsReplacing(false);
    if (result.success) {
      onSuccess();
    } else {
      onError(result.error || t('media.replaceError', language));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">{t('media.replaceTitle', language)}</h2>
          <button onClick={onClose} className="p-1 text-text-secondary hover:text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-text-secondary mb-4">{t('media.replaceDescription', language)}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-text-secondary mb-1">{language === 'fa' ? 'تصویر فعلی' : 'Current'}</p>
            <div className="aspect-square rounded-xl overflow-hidden bg-background">
              <img src={image.thumbnailUrl} alt="Current" className="h-full w-full object-contain" />
            </div>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-1">{language === 'fa' ? 'تصویر جدید' : 'New'}</p>
            {preview ? (
              <div className="aspect-square rounded-xl overflow-hidden bg-background">
                <img src={preview} alt="Preview" className="h-full w-full object-contain" />
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <Upload className="h-8 w-8 text-text-secondary" />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t('media.cancel', language)}
          </Button>
          <Button
            onClick={handleReplace}
            disabled={!file || isReplacing}
            isLoading={isReplacing}
            className="flex-1"
          >
            {isReplacing ? t('media.uploading', language) : t('media.replace', language)}
          </Button>
        </div>
      </div>
    </div>
  );
}
