import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, X, ImageIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { getProducts, deleteProduct } from '../../services/catalog/productService';
import type { Product } from '../../types';
import { useLanguageStore } from '../../stores/languageStore';
import { t } from '../../lib/i18n';

const FALLBACK_IMAGE = '/images/site/fallback.svg';

export function AdminProducts() {
  const navigate = useNavigate();
  const language = useLanguageStore((state) => state.language);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<Product[]>(() => getProducts());

  const handleImageError = (productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const query = search.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.style.toLowerCase().includes(query) ||
      p.tags.some(t => t.toLowerCase().includes(query))
    );
  }, [products, search]);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    setDeleteError(null);
    
    const result = deleteProduct(id);
    
    if (result.success) {
      setProducts(getProducts());
      setDeleteConfirm(null);
    } else {
      setDeleteError(language === 'fa' ? 'خطا در حذف محصول' : (result.error || 'Failed to delete product'));
    }
    
    setIsDeleting(false);
  };

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
    actions: t('admin.actions', language) || (language === 'fa' ? 'عملیات' : 'Actions'),
    edit: t('admin.editProduct', language),
    delete: t('admin.deleteProduct', language),
    clearSearch: language === 'fa' ? 'پاک کردن جستجو' : 'Clear search',
    dismiss: t('admin.dismiss', language),
    deleteProduct: language === 'fa' ? 'حذف محصول' : 'Delete Product',
    deleteConfirm: language === 'fa' ? 'آیا از حذف این محصول اطمینان دارید؟ این عمل قابل بازگشت نیست.' : 'Are you sure you want to delete this product? This action cannot be undone.',
    cancel: t('common.cancel', language),
    deleting: t('admin.deleting', language),
    productsTotal: language === 'fa' 
      ? `${products.length} محصول` 
      : `${products.length} product${products.length !== 1 ? 's' : ''} total`,
    tryDifferentSearch: language === 'fa' ? 'عبارت جستجوی دیگری امتحان کنید' : 'Try a different search term',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-primary">{content.title}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {content.productsTotal}
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus className="h-4 w-4 rtl:ml-2 rtl:mr-0 mr-2" />
            {content.addProduct}
          </Link>
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
        <input
          type="text"
          placeholder={content.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full ps-10 pe-4 py-3 rounded-xl border border-border bg-surface text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
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

      {deleteError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{deleteError}</p>
          <button
            onClick={() => setDeleteError(null)}
            className="text-xs text-red-500 hover:text-red-700 mt-1"
          >
            {content.dismiss}
          </button>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl">
          <PackageIcon className="h-12 w-12 mx-auto text-text-secondary/50 mb-4" />
          <h3 className="text-lg font-medium text-primary mb-1">{content.noProductsFound}</h3>
          <p className="text-sm text-text-secondary">
            {search ? content.tryDifferentSearch : content.addFirstProduct}
          </p>
          {!search && (
            <Button asChild className="mt-4">
              <Link to="/admin/products/new">{content.addProduct}</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">{content.image}</th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">{content.name}</th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">{content.category}</th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">{content.price}</th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">{content.stock}</th>
                  <th className="px-6 py-4 text-end text-xs font-medium uppercase tracking-wider text-text-secondary">{content.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4">
                      {product.images.length > 0 ? (
                        <img
                          src={imageErrors[product.id] ? FALLBACK_IMAGE : product.images[0]}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                          onError={() => handleImageError(product.id)}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-background flex items-center justify-center">
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-primary">${product.priceUSD}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${product.stock <= 10 ? 'text-orange-600' : 'text-primary'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                          className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          aria-label={`${content.edit} ${product.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
        <DeleteConfirmation
          productName={products.find(p => p.id === deleteConfirm)?.name || ''}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
          isDeleting={isDeleting}
          content={content}
        />
      )}
    </div>
  );
}

function DeleteConfirmation({
  productName,
  onConfirm,
  onCancel,
  isDeleting,
  content
}: {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
  content: {
    deleteProduct: string;
    deleteConfirm: string;
    cancel: string;
    deleting: string;
    delete: string;
  };
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-primary mb-2">{content.deleteProduct}</h3>
        <p className="text-sm text-text-secondary mb-6">
          {content.deleteConfirm} <span className="font-medium text-primary">{productName}</span>
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting} className="flex-1">
            {content.cancel}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-500 hover:bg-red-600"
          >
            {isDeleting ? content.deleting : content.delete}
          </Button>
        </div>
      </div>
    </>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}
