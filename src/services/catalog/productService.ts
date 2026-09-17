import type { Product, Category, Filters, SortOption } from '../../types';
import { products as mockProducts } from '../../data/mock/products';
import { productRepository } from '../../features/admin/services/productRepository';
import { imageStorage } from '../../features/admin/services/imageStorage';

const FALLBACK_IMAGE = '/images/site/fallback.svg';

let productData: Product[] = [];
let initialized = false;

function isExternalUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

function resolveImageId(imgId: string): string {
  if (!imgId) return FALLBACK_IMAGE;
  
  const stored = imageStorage.get(imgId);
  if (stored) {
    return stored.dataUrl;
  }
  if (isExternalUrl(imgId)) {
    return FALLBACK_IMAGE;
  }
  return imgId || FALLBACK_IMAGE;
}

function resolveProductImages(product: Product): Product {
  const resolvedImages = product.images
    .map(resolveImageId)
    .filter(Boolean);

  const resolvedPrimaryImage = product.primaryImage
    ? resolveImageId(product.primaryImage)
    : resolvedImages[0] || FALLBACK_IMAGE;

  return {
    ...product,
    images: resolvedImages.length > 0 ? resolvedImages : [FALLBACK_IMAGE],
    primaryImage: resolvedPrimaryImage || FALLBACK_IMAGE,
  };
}

function initializeProductData(): void {
  if (initialized) return;
  
  const storedProducts = productRepository.getAll();
  if (storedProducts.length > 0) {
    const hasExternalUrls = storedProducts.some(p => 
      p.images.some(isExternalUrl) || (p.primaryImage && isExternalUrl(p.primaryImage))
    );
    
    if (hasExternalUrls) {
      productRepository.clear();
      productData = mockProducts.map(p => ({
        ...p,
        primaryImage: p.primaryImage || p.images[0] || '',
      }));
      productData.forEach(p => productRepository.add(p));
    } else {
      productData = storedProducts.map(p => ({
        ...p,
        primaryImage: p.primaryImage || p.images[0] || '',
      }));
    }
  } else {
    productData = mockProducts.map(p => ({
      ...p,
      primaryImage: p.primaryImage || p.images[0] || '',
    }));
    productRepository.clear();
    productData.forEach(p => productRepository.add(p));
  }
  initialized = true;
}

export function initializeProducts(products: Product[]) {
  productData = [...products];
  initialized = true;
}

export function getProducts(): Product[] {
  initializeProductData();
  return productData.map(resolveProductImages);
}

export function getProductById(id: string): Product | undefined {
  initializeProductData();
  const product = productData.find((p) => p.id === id);
  return product ? resolveProductImages(product) : undefined;
}

export function getProductBySlug(slug: string): Product | undefined {
  initializeProductData();
  const product = productData.find((p) => p.slug === slug);
  return product ? resolveProductImages(product) : undefined;
}

export function createProduct(product: Product): { success: boolean; error?: string } {
  initializeProductData();
  const result = productRepository.add(product);
  if (result.success) {
    productData = productRepository.getAll();
  }
  return result;
}

export function updateProduct(product: Product): { success: boolean; error?: string } {
  initializeProductData();
  const result = productRepository.update(product);
  if (result.success) {
    productData = productRepository.getAll();
  }
  return result;
}

export function deleteProduct(id: string): { success: boolean; error?: string } {
  initializeProductData();
  const result = productRepository.delete(id);
  if (result.success) {
    productData = productRepository.getAll();
  }
  return result;
}

export function adminSearchProducts(query: string): Product[] {
  initializeProductData();
  return productRepository.search(query);
}

export function getFeaturedProducts(limit = 8): Product[] {
  initializeProductData();
  return productData
    .filter((p) => p.featured)
    .slice(0, limit)
    .map(resolveProductImages);
}

export function getTrendingProducts(limit = 6): Product[] {
  initializeProductData();
  return productData
    .filter((p) => p.isBestSeller || p.rating >= 4.8)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, limit)
    .map(resolveProductImages);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  initializeProductData();
  return productData
    .filter((p) => p.id !== product.id && (p.category === product.category || p.style === product.style))
    .slice(0, limit)
    .map(resolveProductImages);
}

export function getProductsByCategory(category: Category): Product[] {
  initializeProductData();
  return productData.filter((p) => p.category === category).map(resolveProductImages);
}

export function getComplementaryProduct(product: Product): Product | undefined {
  initializeProductData();
  const targetCategory: Category = product.category === 'hat' ? 'glasses' : 'hat';
  const found = productData.find((p) => p.category === targetCategory && p.style === product.style);
  return found ? resolveProductImages(found) : undefined;
}

export function searchProducts(query: string): Product[] {
  initializeProductData();
  const lowerQuery = query.trim().toLowerCase();
  if (!lowerQuery) return [];

  return productData
    .filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.style.toLowerCase().includes(lowerQuery) ||
        p.colors.some((c) => c.toLowerCase().includes(lowerQuery)) ||
        p.tags.some((t) => t.toLowerCase().includes(lowerQuery)) ||
        p.description.toLowerCase().includes(lowerQuery)
    )
    .map(resolveProductImages);
}

export function filterProducts(products: Product[], filters: Filters): Product[] {
  return products
    .filter((product) => {
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
        return false;
      }

      if (product.priceUSD < filters.priceRange[0] || product.priceUSD > filters.priceRange[1]) {
        return false;
      }

      if (filters.colors.length > 0 && !product.colors.some((c) => filters.colors.includes(c))) {
        return false;
      }

      if (filters.styles.length > 0 && !filters.styles.includes(product.style)) {
        return false;
      }

      if (filters.sizes.length > 0 && !product.sizes.some((s) => filters.sizes.includes(s))) {
        return false;
      }

      if (filters.rating > 0 && product.rating < filters.rating) {
        return false;
      }

      if (filters.availability === 'in-stock' && product.stock <= 0) {
        return false;
      }

      return true;
    })
    .map(resolveProductImages);
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];

  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    case 'price-low':
      return sorted.sort((a, b) => a.priceUSD - b.priceUSD);
    case 'price-high':
      return sorted.sort((a, b) => b.priceUSD - a.priceUSD);
    case 'best-rated':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'featured':
    default:
      return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
}
