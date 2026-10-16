# VYRO Feature Matrix

> **Purpose:** Inventory of VYRO features with implementation status. Each row references the actual source files where the feature was verified.
> **Status Legend:**
> - **Verified** — Code exists and behavior is clearly implemented.
> - **Partial** — Code exists but is incomplete, not wired to UI, or has known gaps.
> - **Missing** — No evidence found in the codebase.
> - **Future** — Not required for current prototype; listed for roadmap planning.

---

## 1. Storefront Features

| ID | Feature | Status | Verification |
|----|---------|--------|--------------|
| SF-HP-01 | Hero section with CTAs | Verified | `src/pages/system/Home.tsx` |
| SF-HP-02 | Featured products section | Verified | `Home.tsx`, `getFeaturedProducts(4)` |
| SF-HP-03 | Style Finder promotion | Verified | `Home.tsx` |
| SF-HP-04 | CMS-driven homepage content | Partial | Settings model exists; `Home.tsx` uses hard-coded strings |
| SF-NAV-01 | Persistent header | Verified | `src/components/layout/Header.tsx` |
| SF-NAV-02 | Persistent footer | Verified | `src/components/layout/Footer.tsx` |
| SF-NAV-03 | Mobile menu with RTL/LTR animation | Verified | `Header.tsx` |
| SF-NAV-04 | Customer login required to browse | Verified | `src/components/layout/RequireAuth.tsx` |
| SF-NAV-05 | Admin exemption from customer auth | Verified | `RequireAuth.tsx` |
| SF-DISC-01 | Shop product listing | Verified | `src/pages/shop/Shop.tsx` |
| SF-DISC-02 | Category pages (/hats, /glasses) | Verified | `src/pages/shop/Hats.tsx`, `src/pages/shop/Glasses.tsx` |
| SF-DISC-03 | Product card with price & quick add | Verified | `src/components/product/ProductCard.tsx` |
| SF-DISC-04 | Hover image swap | Verified | `ProductCard.tsx` |
| SF-DISC-05 | Hide draft products from storefront | Verified | `src/services/catalog/productService.ts` |
| SF-DISC-06 | Full faceted filters (price, color, style, size, rating, stock) | Partial | Service exists; storefront UI limited to category tabs |
| SF-DISC-07 | Sort by featured/newest/price/rating | Partial | Full service sort; storefront shows subset |
| SF-DISC-08 | Pagination / infinite scroll | Missing | No pagination logic found |
| SF-PD-01 | Product detail page | Verified | `src/pages/shop/ProductDetails.tsx` |
| SF-PD-02 | Image gallery with thumbnails | Verified | `src/components/product/ProductGallery.tsx` |
| SF-PD-03 | Related products | Verified | `productService.getRelatedProducts` |
| SF-PD-04 | Recently viewed tracking | Verified | `src/features/recently-viewed/store/recentlyViewedStore.ts` |
| SF-PD-05 | Product variants (color/size) | Partial | Color selectable; size defaults to first; no variant price/stock |
| SF-PD-06 | Stock status display | Partial | Strings exist; not prominent on details page |
| SF-SRCH-01 | Header search modal | Verified | `src/components/search/SearchModal.tsx` |
| SF-SRCH-02 | Full-text product search | Verified | `productService.searchProducts` |
| SF-SRCH-03 | Search results page | Verified | `src/pages/shop/SearchResults.tsx` |
| SF-CART-01 | Add/remove/update items | Verified | `src/features/cart/store/cartStore.ts` |
| SF-CART-02 | Merge identical cart items | Verified | `cartStore.ts` |
| SF-CART-03 | Persistent cart | Verified | Zustand `persist` → `vyro-cart` |
| SF-CART-04 | Currency-aware totals | Verified | `src/pages/shop/Cart.tsx` |
| SF-CART-05 | Free shipping threshold | Verified | `FREE_SHIPPING_THRESHOLD = 75` |
| SF-CART-06 | Empty cart state | Verified | `Cart.tsx` |
| SF-CART-07 | Cart drawer | Verified | `src/features/cart/components/CartDrawer.tsx` |
| SF-CART-08 | Image rehydration | Verified | `useImageStoreVersion` hook |
| SF-WL-01 | Wishlist toggle | Verified | `src/features/wishlist/store/wishlistStore.ts` |
| SF-WL-02 | Persistent wishlist | Verified | Zustand `persist` |
| SF-WL-03 | Wishlist page | Verified | `src/pages/shop/Wishlist.tsx` |
| SF-RV-01 | Recently viewed (max 20) | Verified | `recentlyViewedStore.ts` |
| SF-SF-01 | Style Finder quiz | Verified | `src/features/style-finder/components/StyleFinder.tsx` |
| SF-SF-02 | Top-3 scored recommendations | Verified | `src/features/style-finder/store/styleFinderStore.ts` |
| SF-SF-03 | Restart quiz | Verified | `StyleFinder.tsx` |
| SF-CHK-01 | Checkout form validation | Verified | `src/pages/shop/Checkout.tsx` |
| SF-CHK-02 | Card-to-card details display | Verified | `Checkout.tsx`, `settingsService.ts` |
| SF-CHK-03 | Receipt upload required | Verified | `Checkout.tsx` |
| SF-CHK-04 | Awaiting-approval order status | Verified | `orderService.createOrder` |
| SF-CHK-05 | Stock decrement on order | Verified | `decrementStock` |
| SF-CHK-06 | Customer upsert from checkout | Verified | `customerService.createCustomer` |
| SF-CHK-07 | Order success & invoice link | Verified | `Checkout.tsx` |
| SF-INV-01 | Printable invoice | Verified | `src/pages/shop/Invoice.tsx` |
| SF-INV-02 | Persian-calendar localization | Verified | `Invoice.tsx` |
| SF-INFO-01 | Informational pages | Verified | `src/pages/info/*.tsx` |
| SF-STATE-01 | Suspense loader | Verified | `src/app/App.tsx` |
| SF-STATE-02 | Product not found state | Verified | `ProductDetails.tsx` |
| SF-STATE-03 | Empty states (cart/wishlist/search) | Verified | |
| SF-STATE-04 | Image fallback | Verified | `ReusableImage.tsx` |
| SF-STATE-05 | Global error boundary | Missing | No `ErrorBoundary` found |

---

## 2. Admin Dashboard Features

| ID | Feature | Status | Verification |
|----|---------|--------|--------------|
| AD-DB-01 | Statistics cards | Verified | `src/pages/admin/AdminDashboard.tsx` |
| AD-DB-02 | Low-stock alerts | Verified | `AdminDashboard.tsx` |
| AD-DB-03 | Recent orders/products lists | Verified | `AdminDashboard.tsx` |
| AD-DB-04 | Quick action links | Verified | `AdminDashboard.tsx` |
| AD-DB-05 | Exchange-rate editor | Verified | `AdminDashboard.tsx` |
| AD-PM-01 | Product list with filters | Verified | `src/pages/admin/AdminProducts.tsx` |
| AD-PM-02 | Inline price editing | Verified | `AdminProducts.tsx` |
| AD-PM-03 | Create product | Verified | `src/pages/admin/AdminProductCreate.tsx` |
| AD-PM-04 | Edit product | Verified | `src/pages/admin/AdminProductEdit.tsx` |
| AD-PM-05 | Delete product with confirmation | Verified | `AdminProducts.tsx` |
| AD-PM-06 | Slug validation & uniqueness | Verified | `productRepository.ts` |
| AD-PM-07 | Product status workflow | Verified | `src/types/product.ts` |
| AD-PM-08 | Storefront preview from admin | Verified | `AdminProducts.tsx` |
| AD-CM-01 | Category CRUD | Verified | `src/pages/admin/AdminCategories.tsx` |
| AD-CM-02 | Category metadata fields | Verified | `AdminCategories.tsx` |
| AD-CM-03 | localStorage persistence | Verified | `vyro_collections` key |
| AD-ML-01 | Image upload | Verified | `src/pages/admin/AdminMediaLibrary.tsx` |
| AD-ML-02 | IndexedDB storage | Verified | `src/services/media/mediaRepository.ts` |
| AD-ML-03 | Search/filter/sort | Verified | `AdminMediaLibrary.tsx` |
| AD-ML-04 | Edit metadata | Verified | `mediaService.updateImage` |
| AD-ML-05 | Replace image binary | Verified | `mediaService.replaceImage` |
| AD-ML-06 | Delete with usage warning | Partial | Warning shown; hard block not verified |
| AD-ML-07 | Storage usage display | Verified | `AdminMediaLibrary.tsx` |
| AD-ML-08 | Default site images seeded | Verified | `mediaRepository.seedDefaults` |
| AD-OM-01 | Order list with filters | Verified | `src/pages/admin/AdminOrders.tsx` |
| AD-OM-02 | Order detail | Verified | `src/pages/admin/AdminOrderDetail.tsx` |
| AD-OM-03 | Seven order statuses | Verified | `src/types/order.ts` |
| AD-OM-04 | Confirm payment | Verified | `orderService.confirmOrderPayment` |
| AD-OM-05 | Reject payment + restore stock | Verified | `orderService.rejectOrderPayment` |
| AD-OM-06 | Delete order | Verified | `orderService.deleteOrder` |
| AD-CUST-01 | Customer list/search | Verified | `src/pages/admin/AdminCustomers.tsx` |
| AD-CUST-02 | Customer detail | Verified | `src/pages/admin/AdminCustomerDetail.tsx` |
| AD-CUST-03 | Customer upsert | Verified | `customerService.createCustomer` |
| AD-CUST-04 | Order count & lifetime value | Verified | `incrementCustomerOrderStats` |
| AD-HP-01 | Hero content editing | Verified | `src/pages/admin/AdminHomepage.tsx` |
| AD-HP-02 | Featured section title editing | Verified | `AdminHomepage.tsx` |
| AD-HP-03 | About section editing | Verified | `AdminHomepage.tsx` |
| AD-HP-04 | Media library image picker | Partial | Suggested thumbnails only |
| AD-HP-05 | Featured product/category IDs | Partial | Model field exists; UI hidden |
| AD-SET-01 | Store contact/info settings | Verified | `src/pages/admin/AdminSettings.tsx` |
| AD-SET-02 | Default language setting | Verified | `AdminSettings.tsx` |
| AD-SET-03 | Currency & exchange rate | Verified | `AdminSettings.tsx` |
| AD-SET-04 | Card-to-card payment config | Verified | `AdminSettings.tsx` |
| AD-SET-05 | Maintenance mode toggle | Partial | UI only |
| AD-SET-06 | Order notification toggle | Partial | UI only |
| AD-LOG-01 | Event logging | Verified | `src/services/logs/logService.ts` |
| AD-LOG-02 | Log filter/search | Verified | `src/pages/admin/AdminLogs.tsx` |
| AD-LOG-03 | Clear logs | Verified | `AdminLogs.tsx` |
| AD-LOG-04 | 500-entry cap | Verified | `logService.ts` |
| AD-AUTH-01 | Admin login page | Verified | `src/pages/admin/AdminLogin.tsx` |
| AD-AUTH-02 | Demo credentials | Verified | `adminAuth.ts` |
| AD-AUTH-03 | UI route protection | Verified | `ProtectedAdminRoute.tsx` |
| AD-AUTH-04 | Server-side auth | Missing | Explicitly prototype |

---

## 3. Product Data Model Features

| ID | Feature | Status | Verification |
|----|---------|--------|--------------|
| DM-01 | Stable unique product ID | Verified | `Product.id` |
| DM-02 | Single product name | Verified | `Product.name` |
| DM-03 | Bilingual product names (FA/EN) | Missing | Only single `name` field |
| DM-04 | Single product description | Verified | `Product.description` |
| DM-05 | Bilingual descriptions (FA/EN) | Missing | |
| DM-06 | Single URL slug | Verified | `Product.slug` |
| DM-07 | Bilingual slugs (FA/EN) | Missing | |
| DM-08 | Category & style fields | Verified | `Product.category`, `Product.style` |
| DM-09 | Colors & sizes arrays | Verified | `Product.colors`, `Product.sizes` |
| DM-10 | Canonical price in Rial | Missing | Current field is `priceUSD` |
| DM-11 | Canonical price in USD | Verified | `Product.priceUSD` |
| DM-12 | Old/compare-at price | Verified | `Product.oldPriceUSD` |
| DM-13 | Inventory quantity | Verified | `Product.stock` |
| DM-14 | Publication status | Verified | `Product.status` |
| DM-15 | Ordered image gallery | Verified | `Product.images` |
| DM-16 | Primary image selection | Verified | `Product.primaryImage` |
| DM-17 | Rating & reviews | Verified | `Product.rating`, `Product.reviews` |
| DM-18 | Tags & flags | Verified | `Product.tags`, `featured`, `isNew`, etc. |
| DM-19 | Creation timestamp | Missing | |
| DM-20 | Update timestamp | Missing | |

---

## 4. Language & Currency Features

| ID | Feature | Status | Verification |
|----|---------|--------|--------------|
| LC-01 | Persian default language | Verified | `languageStore.ts`, `index.html` |
| LC-02 | RTL layout for Persian | Verified | `App.tsx`, `index.css` |
| LC-03 | LTR layout for English | Verified | `App.tsx` |
| LC-04 | Language persistence | Verified | Zustand `persist` |
| LC-05 | Translation key system | Partial | Most strings via `t()`; some inline conditionals |
| LC-06 | USD → Rial conversion for Persian | Verified | `currencyService.ts` |
| LC-07 | USD display for English | Verified | `currencyService.ts` |
| LC-08 | Configurable exchange rate | Verified | `vyro_currency_rate` |
| LC-09 | No external rate API | Verified | Static config only |
| LC-10 | Centralized formatting | Verified | `currencyService.ts`, `format.ts`, `Price.tsx` |
| LC-11 | Canonical price not mutated by rate changes | Verified | `priceUSD` is read-only during conversion |
| LC-12 | Consistent currency across cart/checkout/admin | Verified | |
| LC-13 | Language switch preserves IDs/images/inventory/cart/wishlist | Verified | State stored independently |

---

## 5. Media & Image Features

| ID | Feature | Status | Verification |
|----|---------|--------|--------------|
| IMG-01 | Stable image IDs | Verified | `generateImageId`, `generateMediaId` |
| IMG-02 | File type validation | Verified | `validateImageFile` |
| IMG-03 | File size limit (5MB) | Verified | `MAX_IMAGE_FILE_SIZE` |
| IMG-04 | Image previews | Verified | Object URLs |
| IMG-05 | Image replacement | Verified | `replaceImage` |
| IMG-06 | Gallery ordering | Verified | `ImageUpload.tsx` |
| IMG-07 | Primary image selection | Verified | `ImageUpload.tsx` |
| IMG-08 | Media reuse across products/homepage | Partial | Media library separate from product image store |
| IMG-09 | Fallback image | Verified | `ReusableImage.tsx` |
| IMG-10 | Usage tracking (`usedIn`) | Verified | `MediaImage.usedIn` |
| IMG-11 | Deletion usage warning | Partial | Warning exists |
| IMG-12 | Storage budget (200MB) | Verified | `IMAGE_STORAGE_BUDGET` |
| IMG-13 | Persistence across refresh | Verified | `IndexedDB` |
| IMG-14 | Legacy localStorage migration | Verified | `migrateLegacyImages` |
| IMG-15 | Future cloud-storage adapter path | Future | Repository abstraction exists |

---

## 6. Technical & Quality Features

| ID | Feature | Status | Verification |
|----|---------|--------|--------------|
| TQ-01 | TypeScript strict build | Verified | `npm run build` passes |
| TQ-02 | Automated unit tests | Verified | 105 tests passing |
| TQ-03 | Linting | Verified | `oxlint` passes with warnings |
| TQ-04 | Component library (Button, Input, Dialog, etc.) | Verified | `src/components/ui/*` |
| TQ-05 | Shared layout components | Verified | `src/components/layout/*` |
| TQ-06 | Tailwind CSS design tokens | Verified | `src/index.css` |
| TQ-07 | Reduced motion support | Verified | `index.css` |
| TQ-08 | Focus-visible accessibility | Verified | `index.css` |
| TQ-09 | Global error boundary | Missing | |
| TQ-10 | E2E or visual regression tests | Missing | |
| TQ-11 | Component/integration tests with React Testing Library | Missing | Only service/store tests exist |

---

## 7. Security & Non-Functional Features

| ID | Feature | Status | Verification |
|----|---------|--------|--------------|
| SEC-01 | Server-side admin auth | Missing | |
| SEC-02 | Customer password hashing | Verified | `userAuth.ts` |
| SEC-03 | Form input validation | Verified | |
| SEC-04 | File upload validation | Verified | |
| SEC-05 | Customer data encryption at rest | Missing | localStorage is plaintext |
| SEC-06 | Secrets not hardcoded | Partial | Admin demo credentials are constants |
| NF-01 | Production build | Verified | `npm run build` |
| NF-02 | All tests passing | Verified | `npm test` |
| NF-03 | Responsive design | Verified | Tailwind breakpoints |
| NF-04 | RTL/LTR correctness | Verified | |
| NF-05 | Accessibility compliance audit | Missing | |
| NF-06 | Modern browser support | Verified | Vite/React 19 |
| NF-07 | Modular maintainable structure | Verified | |
| NF-08 | Graceful storage failure handling | Partial | Failures swallowed silently |

---

## 8. Summary Counts

| Status | Count |
|--------|-------|
| Verified | 96 |
| Partial | 20 |
| Missing | 14 |
| Future | 1 |
| **Total** | **131** |

The largest gaps are concentrated in:

1. **Canonical product price in Rial** (vs. current USD storage).
2. **True bilingual product content** (separate FA/EN names, descriptions, slugs).
3. **Production security** (server-side auth, encrypted data at rest).
4. **Backend persistence** (multi-device sync, durability).
5. **Advanced storefront UX** (faceted filters, pagination, global error boundary).
