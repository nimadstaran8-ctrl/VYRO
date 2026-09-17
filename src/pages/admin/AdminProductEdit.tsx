import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { ImageUpload, type UploadedImage } from '../../features/admin/components/ImageUpload';
import { getProductById, updateProduct, deleteProduct } from '../../services/catalog/productService';
import { imageStorage } from '../../features/admin/services/imageStorage';
import { CATEGORIES, STYLES, COLORS } from '../../constants/product';
import type { Product, Category, Style, Color } from '../../types';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';
import { getCurrencyState, subscribeToCurrency, convertUsdToRial, formatRialPrice } from '../../services/currency';

interface FormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  oldPrice: string;
  category: Category | '';
  style: Style | '';
  colors: Color[];
  sizes: string;
  stock: string;
  tags: string;
  featured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isLimited: boolean;
}

interface FormErrors {
  name?: string;
  slug?: string;
  price?: string;
  stock?: string;
  category?: string;
  images?: string;
  general?: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function AdminProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const language = useLanguageStore((state) => state.language);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currencyState, setCurrencyState] = useState(getCurrencyState());

  useEffect(() => {
    const unsubscribe = subscribeToCurrency(setCurrencyState);
    return unsubscribe;
  }, []);

  const content = {
    backToProducts: t('admin.backToProducts', language),
    editProduct: t('admin.editProduct', language),
    productId: t('admin.productId', language),
    delete: t('admin.deleteProduct', language),
    basicInfo: t('admin.basicInfo', language),
    productName: t('admin.productName', language),
    slug: t('admin.slug', language),
    productDescription: t('admin.productDescription', language),
    enterProductName: t('admin.enterProductName', language),
    enterSlug: t('admin.enterSlug', language),
    enterProductDescription: t('admin.enterProductDescription', language),
    categoryStyle: language === 'fa' ? 'دسته‌بندی و استایل' : 'Category & Style',
    category: t('admin.category', language),
    style: t('admin.style', language),
    selectCategory: t('admin.selectCategory', language),
    selectStyle: t('admin.selectStyle', language),
    colors: t('admin.colors', language),
    pricingInventory: t('admin.pricingInventory', language),
    price: language === 'fa' ? 'قیمت' : 'Price',
    oldPriceOptional: t('admin.oldPriceOptional', language),
    stockQuantity: t('admin.stockQuantity', language),
    sizesCommaSeparated: t('admin.sizesCommaSeparated', language),
    enterPrice: t('admin.enterPrice', language),
    enterStock: t('admin.enterStock', language),
    sizesPlaceholder: language === 'fa' ? 'سایزها یا One Size' : 'S, M, L or One Size',
    tagsFlags: t('admin.tagsFlags', language),
    tags: t('admin.tags', language),
    tagsCommaSeparated: t('admin.tagsCommaSeparated', language),
    enterTags: t('admin.enterTags', language),
    featured: t('admin.featured', language),
    isNew: t('admin.isNew', language),
    bestSeller: t('admin.bestSeller', language),
    limited: t('admin.limited', language),
    limitedEdition: t('admin.limitedEdition', language),
    productImages: t('admin.productImages', language),
    cancel: t('admin.cancel', language),
    saveChanges: t('admin.saveChanges', language),
    generalError: t('admin.generalError', language),
    nameRequired: language === 'fa' ? 'نام محصول الزامی است' : 'Product name is required',
    slugRequired: language === 'fa' ? 'اسلاگ الزامی است' : 'Slug is required',
    slugInvalid: t('admin.slugInvalid', language),
    categoryRequired: language === 'fa' ? 'دسته‌بندی الزامی است' : 'Category is required',
    validPriceRequired: language === 'fa' ? 'قیمت معتبر الزامی است' : 'Valid price is required',
    priceCannotBeNegative: t('admin.priceCannotBeNegative', language),
    validStockRequired: language === 'fa' ? 'موجودی معتبر الزامی است' : 'Valid stock quantity is required',
    stockCannotBeNegative: t('admin.stockCannotBeNegative', language),
    imagesRequired: t('admin.imageRequired', language),
    productNotFound: t('admin.productNotFound', language),
    productUpdatedSuccessfully: t('admin.productUpdatedSuccessfully', language),
    failedToUpdate: t('admin.failedToUpdate', language),
    deleteConfirm: language === 'fa' ? 'آیا از حذف این محصول اطمینان دارید؟ این عمل قابل بازگشت نیست.' : 'Are you sure you want to delete this product? This action cannot be undone.',
    deleteSuccess: t('admin.deleteSuccess', language),
    deleteError: t('admin.deleteError', language),
  };

  useEffect(() => {
    const product = getProductById(id || '');
    
    if (!product) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    const resolvedPrimaryImage = product.primaryImage || product.images[0] || '';

    const storedImages: UploadedImage[] = product.images
      .map((imgUrl, idx) => {
        const isPrimary = imgUrl === resolvedPrimaryImage || idx === 0;
        return {
          id: imgUrl,
          dataUrl: imgUrl,
          isPrimary,
        };
      })
      .filter((img): img is UploadedImage => !!img.dataUrl);

    if (storedImages.length > 0 && !storedImages.some(img => img.isPrimary)) {
      storedImages[0].isPrimary = true;
    }

    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.priceUSD.toString(),
      oldPrice: product.oldPriceUSD?.toString() || '',
      category: product.category,
      style: product.style,
      colors: product.colors,
      sizes: product.sizes.join(', '),
      stock: product.stock.toString(),
      tags: product.tags.join(', '),
      featured: product.featured,
      isNew: product.isNew || false,
      isBestSeller: product.isBestSeller || false,
      isLimited: product.isLimited || false,
    });

    setImages(storedImages);
    setOriginalImages(product.images);
    setIsLoading(false);
  }, [id]);

  const handleNameChange = useCallback((name: string) => {
    if (!formData) return;
    setFormData(prev => prev ? {
      ...prev,
      name,
      slug: generateSlug(name),
    } : null);
    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
  }, [formData, errors.name]);

  const handleSlugChange = useCallback((slug: string) => {
    if (!formData) return;
    const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setFormData(prev => prev ? ({ ...prev, slug: normalizedSlug }) : null);
    if (errors.slug) setErrors(prev => ({ ...prev, slug: undefined }));
  }, [formData, errors.slug]);

  const handleCategoryChange = useCallback((category: Category | '') => {
    if (!formData) return;
    setFormData(prev => prev ? ({ ...prev, category }) : null);
    if (errors.category) setErrors(prev => ({ ...prev, category: undefined }));
  }, [formData, errors.category]);

  const handleColorToggle = useCallback((color: Color) => {
    if (!formData) return;
    setFormData(prev => prev ? ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color],
    }) : null);
  }, [formData]);

  const validate = (): boolean => {
    if (!formData) return false;
    
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = content.nameRequired;
    }

    if (!formData.slug.trim()) {
      newErrors.slug = content.slugRequired;
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = content.slugInvalid;
    }

    if (!formData.category) {
      newErrors.category = content.categoryRequired;
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price)) {
      newErrors.price = content.validPriceRequired;
    } else if (price < 0) {
      newErrors.price = content.priceCannotBeNegative;
    }

    const stock = parseInt(formData.stock, 10);
    if (!formData.stock || isNaN(stock)) {
      newErrors.stock = content.validStockRequired;
    } else if (stock < 0) {
      newErrors.stock = content.stockCannotBeNegative;
    }

    if (images.length === 0) {
      newErrors.images = content.imagesRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !id) return;
    
    if (!validate()) return;

    setIsSaving(true);
    setErrors({});

    try {
      const sortedImages = images
        .sort((a, b) => (a.isPrimary ? -1 : b.isPrimary ? 1 : 0));
      const productImages = sortedImages.map(img => img.id);
      const primaryImage = sortedImages[0]?.id || '';

      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const sizes = formData.sizes
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const existingProduct = getProductById(id);
      if (!existingProduct) {
        setErrors({ general: content.productNotFound });
        setIsSaving(false);
        return;
      }

      const updatedProduct: Product = {
        ...existingProduct,
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        priceUSD: parseFloat(formData.price),
        oldPriceUSD: formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
        category: formData.category as Category,
        style: formData.style as Style,
        colors: formData.colors,
        sizes: sizes.length > 0 ? sizes : ['One Size'],
        stock: parseInt(formData.stock, 10),
        tags,
        images: productImages,
        primaryImage,
        featured: formData.featured,
        isNew: formData.isNew,
        isBestSeller: formData.isBestSeller,
        isLimited: formData.isLimited,
      };

      const result = updateProduct(updatedProduct);

      if (!result.success) {
        setErrors({ general: result.error || content.failedToUpdate });
        setIsSaving(false);
        return;
      }

      originalImages.forEach(imgId => {
        if (!productImages.includes(imgId) && imgId.startsWith('img_')) {
          imageStorage.delete(imgId);
        }
      });

      navigate('/admin/products');
    } catch {
      setErrors({ general: content.generalError });
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    const confirmed = window.confirm(content.deleteConfirm);
    if (!confirmed) return;

    const result = deleteProduct(id);
    
    if (result.success) {
      images.forEach(img => {
        if (img.id.startsWith('img_')) {
          imageStorage.delete(img.id);
        }
      });
      navigate('/admin/products');
    } else {
      setErrors({ general: content.deleteError });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !formData) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-primary">{content.productNotFound}</h1>
        <Button asChild className="mt-6">
          <a href="/admin/products">{content.backToProducts}</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/products')}
          className="mb-4 flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {content.backToProducts}
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-primary">{content.editProduct}</h1>
            <p className="mt-1 text-sm text-text-secondary">{content.productId}: {id}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4 rtl:ml-2 rtl:mr-0 mr-2" />
            {content.delete}
          </Button>
        </div>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-medium text-primary mb-6">{content.basicInfo}</h2>
          
          <div className="grid gap-6">
            <Input
              label={content.productName}
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={content.enterProductName}
              error={errors.name}
              required
            />

            <Input
              label={content.slug}
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder={content.enterSlug}
              error={errors.slug}
              required
            />

            <Textarea
              label={content.productDescription}
              value={formData.description}
              onChange={(e) => setFormData(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
              placeholder={content.enterProductDescription}
              rows={4}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-medium text-primary mb-6">{content.categoryStyle}</h2>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-primary">
                {content.category} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value as Category)}
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-primary focus:border-primary focus:outline-none"
                required
              >
                <option value="">{content.selectCategory}</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-primary">
                {content.style}
              </label>
              <select
                value={formData.style}
                onChange={(e) => setFormData(prev => prev ? ({ ...prev, style: e.target.value as Style }) : null)}
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-primary focus:border-primary focus:outline-none"
              >
                <option value="">{content.selectStyle}</option>
                {STYLES.map(style => (
                  <option key={style.value} value={style.value}>{style.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-primary">
              {content.colors}
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleColorToggle(color.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    formData.colors.includes(color.value)
                      ? 'bg-primary text-white'
                      : 'bg-background text-primary hover:bg-primary/10'
                  }`}
                >
                  {color.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-medium text-primary mb-6">{content.pricingInventory}</h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Input
                label={content.price}
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => {
                  setFormData(prev => prev ? ({ ...prev, price: e.target.value }) : null);
                  if (errors.price) setErrors(prev => ({ ...prev, price: undefined }));
                }}
                placeholder={content.enterPrice}
                error={errors.price}
                required
              />
              {language === 'fa' && currencyState.usdToTomanRate && (
                <div className="mt-2 text-sm text-text-secondary">
                  <span>نرخ فعلی دلار: </span>
                  <span className="font-medium">{formatRialPrice(currencyState.usdToTomanRate)}</span>
                  <span> / USD</span>
                  {formData.price && parseFloat(formData.price) > 0 && (
                    <div className="mt-1">
                      <span>قیمت به ریال: </span>
                      <span className="font-medium text-primary">
                        {formatRialPrice(convertUsdToRial(parseFloat(formData.price)))}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Input
              label={content.oldPriceOptional}
              type="number"
              min="0"
              step="0.01"
              value={formData.oldPrice}
              onChange={(e) => setFormData(prev => prev ? ({ ...prev, oldPrice: e.target.value }) : null)}
              placeholder="0.00"
            />

            <Input
              label={content.stockQuantity}
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => {
                setFormData(prev => prev ? ({ ...prev, stock: e.target.value }) : null);
                if (errors.stock) setErrors(prev => ({ ...prev, stock: undefined }));
              }}
              placeholder={content.enterStock}
              error={errors.stock}
              required
            />

            <Input
              label={content.sizesCommaSeparated}
              value={formData.sizes}
              onChange={(e) => setFormData(prev => prev ? ({ ...prev, sizes: e.target.value }) : null)}
              placeholder={content.sizesPlaceholder}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-medium text-primary mb-6">{content.tagsFlags}</h2>
          
          <div className="space-y-6">
            <Input
              label={content.tagsCommaSeparated}
              value={formData.tags}
              onChange={(e) => setFormData(prev => prev ? ({ ...prev, tags: e.target.value }) : null)}
              placeholder={content.enterTags}
            />

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => prev ? ({ ...prev, featured: e.target.checked }) : null)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-primary">{content.featured}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={(e) => setFormData(prev => prev ? ({ ...prev, isNew: e.target.checked }) : null)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-primary">{content.isNew}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBestSeller}
                  onChange={(e) => setFormData(prev => prev ? ({ ...prev, isBestSeller: e.target.checked }) : null)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-primary">{content.bestSeller}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isLimited}
                  onChange={(e) => setFormData(prev => prev ? ({ ...prev, isLimited: e.target.checked }) : null)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-primary">{content.limitedEdition}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            error={errors.images}
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/products')}
          >
            {content.cancel}
          </Button>
          <Button
            type="submit"
            isLoading={isSaving}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 rtl:ml-2 rtl:mr-0 mr-2" />
            {content.saveChanges}
          </Button>
        </div>
      </form>
    </div>
  );
}
