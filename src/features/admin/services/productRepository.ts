import type { Product } from '../../../types/product';

const STORAGE_KEY = 'vyro_product_repository';

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
  return { products: [], version: 1 };
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
    return this.cachedProducts;
  }

  private saveProducts(products: Product[]): void {
    this.cachedProducts = products;
    setStorageData({ products, version: 1 });
  }
}

export const productRepository = ProductRepository.getInstance();
