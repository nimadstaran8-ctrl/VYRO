import { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, X, FolderTree } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useLanguageStore } from '../../stores/languageStore';
import { t, type Language } from '../../lib/i18n';
import type { Collection } from '../../types';

const COLLECTIONS_STORAGE_KEY = 'vyro_collections';

interface CollectionFormData {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  image: string;
}

function getStoredCollections(): Collection[] {
  try {
    const data = localStorage.getItem(COLLECTIONS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as Collection[];
    }
  } catch {
  }
  const defaultCollections: Collection[] = [
    { id: 'cat-hat', slug: 'hats', title: 'Hats', subtitle: 'Explore our hat collection', description: 'Premium hats for every style', image: '/images/categories/summer.svg', products: [] },
    { id: 'cat-glass', slug: 'glasses', title: 'Glasses', subtitle: 'See the world clearly', description: 'Designer glasses and sunglasses', image: '/images/categories/city-nights.svg', products: [] },
  ];
  localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(defaultCollections));
  return defaultCollections;
}

function saveCollections(collections: Collection[]): void {
  localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
}

function generateCollectionId(): string {
  return `cat-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

export function AdminCategories() {
  const lang = useLanguageStore((state) => state.language);
  const language = lang as Language;
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);
  const [collections, setCollections] = useState<Collection[]>(() => getStoredCollections());
  const [formData, setFormData] = useState<CollectionFormData>({
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    image: '',
  });

  const filteredCollections = useMemo(() => {
    if (!search.trim()) return collections;
    const query = search.toLowerCase();
    return collections.filter(
      c => c.title.toLowerCase().includes(query) || c.slug.toLowerCase().includes(query)
    );
  }, [collections, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCollection) {
      const updated = collections.map(c => 
        c.id === editingCollection.id 
          ? { ...c, ...formData }
          : c
      );
      setCollections(updated);
      saveCollections(updated);
    } else {
      const newCollection: Collection = {
        id: generateCollectionId(),
        ...formData,
        products: [],
      };
      const updated = [...collections, newCollection];
      setCollections(updated);
      saveCollections(updated);
    }
    
    setShowForm(false);
    setEditingCollection(null);
    setFormData({ title: '', slug: '', subtitle: '', description: '', image: '' });
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      title: collection.title,
      slug: collection.slug,
      subtitle: collection.subtitle,
      description: collection.description,
      image: collection.image,
    });
    setShowForm(true);
  };

  const handleDelete = () => {
    if (!deletingCollection) return;
    
    const updated = collections.filter(c => c.id !== deletingCollection.id);
    setCollections(updated);
    saveCollections(updated);
    setDeletingCollection(null);
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    }));
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary">{t('adminNav.categories', language)}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {collections.length} {language === 'fa' ? 'دسته‌بندی' : 'categories'}
          </p>
        </div>
        <Button onClick={() => { 
          setShowForm(true); 
          setEditingCollection(null); 
          setFormData({ title: '', slug: '', subtitle: '', description: '', image: '' }); 
        }}>
          <Plus className="h-4 w-4 ltr:ml-2 rtl:mr-2" />
          {language === 'fa' ? 'افزودن دسته‌بندی' : 'Add Category'}
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
          <input
            type="text"
            placeholder={language === 'fa' ? 'جستجوی دسته‌بندی...' : 'Search categories...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-10 pe-4 py-3 rounded-xl border border-border bg-surface text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {filteredCollections.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl">
          <FolderTree className="h-12 w-12 mx-auto text-text-secondary/50 mb-4" />
          <h3 className="text-lg font-medium text-primary mb-1">
            {search ? (language === 'fa' ? 'دسته‌بندی یافت نشد' : 'No categories found') : (language === 'fa' ? 'هنوز دسته‌بندی وجود ندارد' : 'No categories yet')}
          </h3>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'تصویر' : 'Image'}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'نام' : 'Name'}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'اسلاگ' : 'Slug'}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'محصولات' : 'Products'}
                  </th>
                  <th className="px-6 py-4 text-end text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {language === 'fa' ? 'عملیات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCollections.map((category) => (
                  <tr key={category.id} className="hover:bg-background/50">
                    <td className="px-6 py-4">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="h-12 w-12 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/site/fallback.svg';
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-primary">{category.title}</p>
                      <p className="text-xs text-text-secondary">{category.subtitle}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-secondary">{category.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-primary">{category.products.length}</span>
                    </td>
                    <td className="px-6 py-4 text-end">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-text-secondary hover:text-primary transition-colors"
                        title={language === 'fa' ? 'ویرایش' : 'Edit'}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCollection(category)}
                        className="p-2 text-text-secondary hover:text-red-500 transition-colors"
                        title={language === 'fa' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary">
                {editingCollection
                  ? (language === 'fa' ? 'ویرایش دسته‌بندی' : 'Edit Category')
                  : (language === 'fa' ? 'افزودن دسته‌بندی' : 'Add Category')}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-text-secondary hover:text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={language === 'fa' ? 'نام' : 'Name'}
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
              <Input
                label={language === 'fa' ? 'اسلاگ' : 'Slug'}
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
              <Input
                label={language === 'fa' ? 'عنوان فرعی' : 'Subtitle'}
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-primary">
                  {language === 'fa' ? 'توضیحات' : 'Description'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
                />
              </div>
              <Input
                label={language === 'fa' ? 'تصویر (URL)' : 'Image (URL)'}
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="/images/categories/example.svg"
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  {language === 'fa' ? 'لغو' : 'Cancel'}
                </Button>
                <Button type="submit" className="flex-1">
                  {language === 'fa' ? 'ذخیره' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingCollection && (
        <ConfirmDialog
          isOpen={!!deletingCollection}
          onClose={() => setDeletingCollection(null)}
          onConfirm={handleDelete}
          title={language === 'fa' ? 'حذف دسته‌بندی' : 'Delete Category'}
          message={language === 'fa'
            ? `آیا از حذف "${deletingCollection.title}" اطمینان دارید؟`
            : `Are you sure you want to delete "${deletingCollection.title}"?`}
          confirmText={language === 'fa' ? 'حذف' : 'Delete'}
          cancelText={language === 'fa' ? 'لغو' : 'Cancel'}
          variant="danger"
        />
      )}
    </div>
  );
}
