import type { Product } from '../../../types/product';
import { products as catalogProducts } from '../../../data/mock/products';

const STORAGE_KEY = 'vyro_product_repository';
const STORAGE_VERSION = 3;
const catalogById = new Map(catalogProducts.map(product => [product.id, product]));

// Default illustrations from earlier catalog releases, keyed by product ID.
const legacyIllustrations: Record<string, readonly string[]> = {
  'hat-001': ['hat-black.svg', 'hat-cap1.svg'],
  'hat-002': ['hat-beige.svg', 'hat-white.svg'],
  'hat-003': ['hat-fedora.svg', 'hat-white.svg'],
  'hat-004': ['hat-sport.svg', 'hat-blue.svg'],
  'hat-005': ['hat-luxury.svg', 'hat-black.svg'],
  'hat-006': ['beanie.svg', 'hat-beige.svg'],
  'hat-007': ['hat-camo.svg', 'hat-black.svg'],
  'hat-008': ['hat-straw.svg', 'hat-beige.svg'],
  'hat-009': ['hat-white.svg', 'hat-cap1.svg'],
  'hat-010': ['hat-trucker.svg', 'hat-luxury.svg'],
  'glass-001': ['glasses-aviator.svg', 'glasses-black.svg'],
  'glass-002': ['glasses-round.svg', 'glasses-clear.svg'],
  'glass-003': ['glasses-tortoise.svg', 'glasses-brown.svg'],
  'glass-004': ['glasses-sport.svg', 'glasses-blue.svg'],
  'glass-005': ['glasses-gold.svg', 'glasses-round.svg'],
  'glass-006': ['glasses-wayfarer.svg', 'glasses-aviator.svg'],
  'glass-007': ['glasses-oversized.svg', 'glasses-tortoise.svg'],
  'glass-008': ['glasses-clubmaster.svg', 'glasses-gold.svg'],
  'glass-009': ['glasses-clear.svg', 'glasses-sport.svg'],
  'glass-010': ['glasses-mirror.svg', 'glasses-aviator.svg'],
};

function updateCatalogImages(product: Product): Product {
  const catalog = catalogById.get(product.id);
  const previousImages = legacyIllustrations[product.id]?.map(image => `/images/products/${image}`);
  if (!catalog || !previousImages) return product;

  const hasOldDefaultGallery =
    product.images.length === previousImages.length &&
    previousImages.every((image, index) => image === product.images[index]) &&
    (!product.primaryImage || product.primaryImage === previousImages[0]);
  if (hasOldDefaultGallery) {
    return { ...product, images: [...catalog.images], primaryImage: catalog.images[0] };
  }

  const samplePhoto = catalog.images[0];
  if (!samplePhoto || !product.images.includes(samplePhoto)) return product;
  const images = product.images.filter(image => !previousImages.includes(image));
  const primaryImage = product.primaryImage && images.includes(product.primaryImage)
    ? product.primaryImage
    : samplePhoto;
  return { ...product, images, primaryImage };
}

export interface ProductStorageData {
  products: Product[];
  version: number;
}

function getStorageData(): ProductStorageData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as ProductStorageData;
    }
  } catch (e) {
    console.error('Failed to read product storage:', e);
  }
  return { products: [], version: STORAGE_VERSION };
}

function setStorageData(data: ProductStorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save product storage:', e);
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please delete some products or images.');
    }
    throw e;
  }
}

export class ProductRepository {
  private static instance: ProductRepository;
  private cachedProducts: Product[] | null = null;

  private constructor() {}

  static getInstance(): ProductRepository {
    if (!ProductRepository.instance) {
      ProductRepository.instance = new ProductRepository();
    }
    return ProductRepository.instance;
  }

  getAll(): Product[] {
    return this.cachedProducts ?? this.loadProducts();
  }

  getById(id: string): Product | undefined {
    const products = this.getAll();
    return products.find(p => p.id === id);
  }

  getBySlug(slug: string): Product | undefined {
    const products = this.getAll();
    return products.find(p => p.slug === slug);
  }

  add(product: Product): { success: boolean; error?: string } {
    const products = this.getAll();
    
    if (products.some(p => p.id === product.id)) {
      return { success: false, error: 'Product with this ID already exists.' };
    }
    
    if (products.some(p => p.slug === product.slug)) {
      return { success: false, error: 'Product with this slug already exists.' };
    }

    products.push(product);
    this.saveProducts(products);
    return { success: true };
  }

  update(product: Product): { success: boolean; error?: string } {
    const products = this.getAll();
    const index = products.findIndex(p => p.id === product.id);
    
    if (index === -1) {
      return { success: false, error: 'Product not found.' };
    }

    const existingSlug = products[index].slug;
    if (product.slug !== existingSlug && products.some(p => p.slug === product.slug && p.id !== product.id)) {
      return { success: false, error: 'Another product with this slug already exists.' };
    }

    products[index] = product;
    this.saveProducts(products);
    return { success: true };
  }

  delete(id: string): { success: boolean; error?: string } {
    const products = this.getAll();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      return { success: false, error: 'Product not found.' };
    }

    products.splice(index, 1);
    this.saveProducts(products);
    return { success: true };
  }

  search(query: string): Product[] {
    const products = this.getAll();
    const lowerQuery = query.trim().toLowerCase();
    if (!lowerQuery) return [];

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.style.toLowerCase().includes(lowerQuery) ||
        p.colors.some((c) => c.toLowerCase().includes(lowerQuery)) ||
        p.tags.some((t) => t.toLowerCase().includes(lowerQuery)) ||
        p.description.toLowerCase().includes(lowerQuery)
    );
  }

  clear(): void {
    this.cachedProducts = [];
    this.saveProducts([]);
  }

  reload(): void {
    this.cachedProducts = null;
    this.loadProducts();
  }

  private loadProducts(): Product[] {
    const data = getStorageData();
    this.cachedProducts = data.products;
    if (data.version < STORAGE_VERSION) {
      this.cachedProducts = data.products.map(updateCatalogImages);
      try {
        setStorageData({ products: this.cachedProducts, version: STORAGE_VERSION });
      } catch {
        // The upgraded catalog remains usable if browser storage is full.
      }
    }
    return this.cachedProducts;
  }

  private saveProducts(products: Product[]): void {
    this.cachedProducts = products;
    setStorageData({ products, version: STORAGE_VERSION });
  }
}

export const productRepository = ProductRepository.getInstance();
