import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { expect, it, vi } from 'vitest';
import { products } from '../../data/mock/products';
import { imageStorage } from '../../features/admin/services/imageStorage';
import { ProductDetails } from '../../pages/shop/ProductDetails';
import { getProductById, getProductForEditing, initializeProducts } from '../../services/catalog/productService';
import { useRecentlyViewedStore } from '../../stores/recentlyViewedStore';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it('records one visit and shows a fallback for an expired product image URL', async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const expiredUrl = 'blob:http://127.0.0.1:5173/expired';
  const product = { ...products[0], images: [expiredUrl], primaryImage: expiredUrl };
  initializeProducts([product]);
  const addItem = useRecentlyViewedStore.getState().addItem;
  const recordVisit = vi.fn((id: string) => {
    if (recordVisit.mock.calls.length === 1) addItem(id);
  });
  useRecentlyViewedStore.setState({ addItem: recordVisit });

  try {
    await act(async () => {
      root.render(
        <HelmetProvider>
          <MemoryRouter initialEntries={['/product/' + product.slug]}>
            <Routes>
              <Route path="/product/:slug" element={<ProductDetails />} />
            </Routes>
          </MemoryRouter>
        </HelmetProvider>,
      );
    });

    expect(recordVisit).toHaveBeenCalledExactlyOnceWith(product.id);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/images/site/fallback.svg');
  } finally {
    await act(async () => root.unmount());
    container.remove();
    useRecentlyViewedStore.setState({ addItem, items: [] });
    initializeProducts(products);
  }
});

it('keeps the uploaded image ID in the edit form and resolves it for display', () => {
  const imageId = 'img_saved';
  const preview = 'blob:http://127.0.0.1:5173/current';
  const product = { ...products[0], images: [imageId], primaryImage: imageId };
  initializeProducts([product]);
  const getUrl = vi.spyOn(imageStorage, 'getUrl').mockReturnValue(undefined);

  try {
    expect(getProductById(product.id)?.primaryImage).toBe('/images/site/fallback.svg');
    getUrl.mockReturnValue(preview);
    expect(getProductById(product.id)?.primaryImage).toBe(preview);
    expect(getProductForEditing(product.id)?.images).toEqual([imageId]);
    expect(getProductForEditing(product.id)?.primaryImage).toBe(imageId);
  } finally {
    getUrl.mockRestore();
    initializeProducts(products);
  }
});
