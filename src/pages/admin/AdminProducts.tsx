import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, X, ImageIcon, Eye, Pencil, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { getAllProducts, deleteProduct, updateProduct } from '../../services/catalog/productService';
import { formatProductPrice, formatUsdPrice, getUsdToTomanRate, formatTomanPrice } from '../../services/currency';
import { subscribeToImageStoreChanges } from '../../lib/imageEvents';
import type { Product, ProductStatus } from '../../types';
import { useLanguageStore } from '../../stores/languageStore';
import { t, type Language } from '../../lib/i18n';
import { CATEGORIES } from '../../constants/product';

const FALLBACK_IMAGE = '/images/site/fallback.svg';

const PRODUCT_STATUSES: ProductStatus[] = ['active', 'draft', 'out-of-stock'];

function getStatusLabel(status: ProductStatus | undefined, language: Language): string {
  switch (status) {
    case 'draft':
      return t('admin.statusDraft', language);
    case 'out-of-stock':
      return t('admin.statusOutOfStock', language);
    case 'active':
    default:
      return t('admin.statusActive', language);
  }
}

function getStatusBadgeClass(status: ProductStatus | undefined): string {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-600';
    case 'out-of-stock':
      return 'bg-red-100 text-red-700';
    case 'active':
    default:
      return 'bg-green-100 text-green-700';
  }
}

export function AdminProducts() {
  const navigate = useNavigate();
  const language = useLanguageStore((state) => state.language) as Language;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<Product[]>(() => getAllProducts());

  // Re-sync when the image store hydrates or changes (thumbnails resolve async).
  useEffect(() => subscribeToImageStoreChanges(() => setProducts(getAllProducts())), []);

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((p) => {
      if (statusFilter && (p.status ?? 'active') !== statusFilter) return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.style.toLowerCase().includes(query) ||
        p.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [products, search, statusFilter, categoryFilter]);

  const handleDelete = (id: string) => {
    setDeleteError(null);

    const result = deleteProduct(id);

    if (result.success) {
      setProducts(getAllProducts());
      setDeleteConfirm(null);
    } else {
      setDeleteError(language === 'fa' ? 'خطا در حذف محصول' : (result.error || 'Failed to delete product'));
    }
  };

  const hasActiveFilters = Boolean(search || statusFilter || categoryFilter);

  const content = {
    title: t('admin.products', language),
    addProduct: t('admin.addProduct', language),
    searchPlaceholder: t('admin.searchProducts', language),
    noProductsFound: t('admin.noProductsFound', language),
    noProductsYet: t('admin.noProductsYet', language),
    addFirstProduct: t('admin.addFirstProduct', language),
    image: language === 'fa' ? 'تصویر' : 'Image',
    name: language === 'fa' ? 'نام' : 'Name',
    category: t('admin.category', language),
    price: t('admin.price', language) || (language === 'fa' ? 'قیمت' : 'Price'),
    stock: t('admin.stock', language),
    productStatus: t('admin.productStatus', language),
    actions: t('admin.actions', language) || (language === 'fa' ? 'عملیات' : 'Actions'),
    edit: t('admin.editProduct', language),
    delete: t('admin.deleteProduct', language),
    preview: t('admin.preview', language),
    clearSearch: language === 'fa' ? 'پاک کردن جستجو' : 'Clear search',
    dismiss: t('admin.dismiss', language),
    deleteProduct: language === 'fa' ? 'حذف محصول' : 'Delete Product',
    deleteConfirm: language === 'fa' ? 'آیا از حذف این محصول اطمینان دارید؟ این عمل قابل بازگشت نیست.' : 'Are you sure you want to delete this product? This action cannot be undone.',
    cancel: t('common.cancel', language),
    deleting: t('admin.deleting', language),
    productsTotal:
      language === 'fa'
        ? `${products.length} محصول`
        : `${products.length} product${products.length !== 1 ? 's' : ''} total`,
    tryDifferentSearch: language === 'fa' ? 'عبارت جستجوی دیگری امتحان کنید' : 'Try a different search term',
    allStatuses: t('admin.statusAll', language),
    allCategories: t('admin.allCategories', language),
    clearFilters: language === 'fa' ? 'پاک کردن فیلترها' : 'Clear filters',
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">{content.title}</h1>
          <p className="mt-1 text-sm text-text-secondary">{content.productsTotal}</p>
        </div>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus className="h-4 w-4 rtl:ml-2 rtl:mr-0 mr-2" />
            {content.addProduct}
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder={content.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface py-3 pe-4 ps-10 text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
            aria-label={content.searchPlaceholder}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-primary"
              aria-label={content.clearSearch}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProductStatus | '')}
          className="cursor-pointer rounded-xl border border-border bg-surface px-4 py-3 text-primary focus:border-primary focus:outline-none"
          aria-label={content.productStatus}
        >
          <option value="">{content.allStatuses}</option>
          {PRODUCT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {getStatusLabel(status, language)}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="cursor-pointer rounded-xl border border-border bg-surface px-4 py-3 text-primary focus:border-primary focus:outline-none"
          aria-label={content.category}
        >
          <option value="">{content.allCategories}</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {deleteError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{deleteError}</p>
          <button
            onClick={() => setDeleteError(null)}
            className="mt-1 text-xs text-red-500 hover:text-red-700"
          >
            {content.dismiss}
          </button>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl bg-surface py-16 text-center">
          <PackageIcon className="mx-auto mb-4 h-12 w-12 text-text-secondary/50" />
          <h3 className="mb-1 text-lg font-medium text-primary">{content.noProductsFound}</h3>
          <p className="text-sm text-text-secondary">
            {hasActiveFilters ? content.tryDifferentSearch : content.addFirstProduct}
          </p>
          {hasActiveFilters ? (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setCategoryFilter('');
              }}
            >
              {content.clearFilters}
            </Button>
          ) : (
            <Button asChild className="mt-4">
              <Link to="/admin/products/new">{content.addProduct}</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">{content.image}</th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">{content.name}</th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">{content.category}</th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">{content.price}</th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">{content.stock}</th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">{content.productStatus}</th>
                  <th className="px-6 py-4 text-end text-xs font-medium uppercase tracking-wider text-text-secondary">{content.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-background/50">
                    <td className="px-6 py-4">
                      {product.images.length > 0 ? (
                        <img
                          src={imageErrors[product.id] ? FALLBACK_IMAGE : product.images[0]}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                          onError={() => handleImageError(product.id)}
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background">
                          <ImageIcon className="h-5 w-5 text-text-secondary" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-primary">{product.name}</p>
                        <p className="text-xs text-text-secondary">{product.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <EditablePrice product={product} language={language} onSaved={() => setProducts(getAllProducts())} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${product.stock <= 10 ? 'text-orange-600' : 'text-primary'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(product.status)}`}>
                        {getStatusLabel(product.status, language)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/product/${product.slug}`)}
                          className="rounded-lg p-2 text-text-secondary transition-colors hover:text-primary hover:bg-primary/5"
                          aria-label={`${content.preview} ${product.name}`}
                          title={content.preview}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                          className="rounded-lg p-2 text-text-secondary transition-colors hover:text-primary hover:bg-primary/5"
                          aria-label={`${content.edit} ${product.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-red-50 hover:text-red-500"
                          aria-label={`${content.delete} ${product.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm)}
          title={content.deleteProduct}
          message={`${content.deleteConfirm} ${products.find((p) => p.id === deleteConfirm)?.name || ''}`}
          confirmText={content.delete}
          cancelText={content.cancel}
          variant="danger"
        />
      )}
    </div>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

interface EditablePriceProps {
  product: Product;
  language: Language;
  onSaved: () => void;
}

/**
 * Inline price editor for the products table. Prices are stored in USD; in
 * Persian the input accepts Toman (the currency shop owners think in) and the
 * USD value is derived through the central exchange rate.
 */
function EditablePrice({ product, language, onSaved }: EditablePriceProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const cancelledRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const tomanRate = getUsdToTomanRate();
  const isFa = language === 'fa';

  const content = {
    editPrice: language === 'fa' ? `ویرایش قیمت ${product.name}` : `Edit price of ${product.name}`,
    priceToman: language === 'fa' ? 'قیمت (تومان)' : 'Price (Toman)',
    priceUsd: language === 'fa' ? 'قیمت (دلار)' : 'Price (USD)',
    enterPrice: language === 'fa' ? 'قیمت را وارد کنید' : 'Enter price',
    invalid: language === 'fa' ? 'قیمت معتبر وارد کنید' : 'Enter a valid price',
    negative: language === 'fa' ? 'قیمت نمی‌تواند منفی باشد' : 'Price cannot be negative',
    saveError: language === 'fa' ? 'خطا در ذخیره قیمت' : 'Failed to save price',
    saving: language === 'fa' ? 'در حال ذخیره...' : 'Saving...',
  };

  const startEdit = () => {
    cancelledRef.current = false;
    // Prefill in the input currency: Toman for fa, USD for en.
    setValue(
      isFa && tomanRate > 0
        ? Math.round(product.priceUSD * tomanRate).toString()
        : product.priceUSD.toString()
    );
    setError(null);
    setIsEditing(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  const cancelEdit = () => {
    cancelledRef.current = true;
    setIsEditing(false);
    setError(null);
  };

  const commit = () => {
    if (cancelledRef.current || isSaving) return;

    const parsed = parseFloat(value);
    if (!value.trim() || Number.isNaN(parsed)) {
      setError(content.invalid);
      return;
    }
    if (parsed < 0) {
      setError(content.negative);
      return;
    }

    const newPriceUsd = isFa && tomanRate > 0
      ? Math.round((parsed / tomanRate) * 100) / 100
      : parsed;

    if (newPriceUsd === product.priceUSD) {
      setIsEditing(false);
      setError(null);
      return;
    }

    setIsSaving(true);
    const result = updateProduct({ ...product, priceUSD: newPriceUsd });
    setIsSaving(false);

    if (result.success) {
      setIsEditing(false);
      setError(null);
      setJustSaved(true);
      onSaved();
      setTimeout(() => setJustSaved(false), 1500);
    } else {
      setError(result.error || content.saveError);
    }
  };

  if (isEditing) {
    const parsedValue = parseFloat(value);

    return (
      <div className="w-44">
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="number"
            min="0"
            step="0.01"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') cancelEdit();
            }}
            onBlur={commit}
            disabled={isSaving}
            aria-label={`${isFa ? content.priceToman : content.priceUsd} — ${product.name}`}
            className="w-full rounded-lg border border-primary bg-white px-2.5 py-1.5 text-sm text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          />
        </div>
        {error ? (
          <p className="mt-1 text-xs text-red-500" role="alert">{error}</p>
        ) : isSaving ? (
          <p className="mt-1 text-xs text-text-secondary">{content.saving}</p>
        ) : isFa && Number.isFinite(parsedValue) && parsedValue > 0 && tomanRate > 0 ? (
          <p className="mt-1 text-xs text-text-secondary" dir="ltr">
            = {formatUsdPrice(Math.round((parsedValue / tomanRate) * 100) / 100)}
          </p>
        ) : !isFa && Number.isFinite(parsedValue) && parsedValue > 0 && tomanRate > 0 ? (
          <p className="mt-1 text-xs text-text-secondary">
            = {formatTomanPrice(Math.round(parsedValue * tomanRate))}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={startEdit}
        className="group inline-flex items-center gap-1.5 rounded-lg px-1.5 py-1 -mx-1.5 text-sm text-primary transition-colors hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={content.editPrice}
        title={content.editPrice}
      >
        {formatProductPrice({ priceUsd: product.priceUSD, locale: language })}
        <Pencil className="h-3.5 w-3.5 text-text-secondary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
      </button>
      {justSaved && (
        <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
      )}
    </span>
  );
}
