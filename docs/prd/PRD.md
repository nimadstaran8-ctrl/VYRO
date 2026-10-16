# VYRO Product Requirements Document (PRD)

> **Document Version:** 1.0  
> **Project:** VYRO — Premium hats & sunglasses ecommerce storefront with integrated admin panel  
> **Repository:** `C:\Users\Admin\Videos\mk\vyro` (the active Git working tree)  
> **Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7, Zustand, Framer Motion, Lucide React, React Helmet Async  
> **Target Languages:** Persian (Farsi, default) and English  
> **Status:** Existing application under active development; browser-only prototype, no verified backend.

---

## 1. Executive Summary

VYRO is a single-page ecommerce application for a premium hat and sunglasses brand. It combines a customer-facing storefront with an integrated admin dashboard. The current implementation is a **frontend prototype**: product, order, customer, settings, and media metadata are persisted in the browser's `localStorage`; uploaded image binaries are persisted in `IndexedDB`. There is no verified backend, payment gateway, or shipping integration.

This PRD documents:

1. The verified existing functionality discovered by inspecting the codebase.
2. The product requirements preserved from the project brief.
3. Gaps, conflicts, and risks between the brief and the current implementation.
4. Acceptance criteria and a prioritized roadmap.

> **Important note on repository path:** The project brief specifies `E:\mk\vyro`, but the actual Git repository and working directory verified during this exercise are `C:\Users\Admin\Videos\mk\vyro`. The documentation files are therefore created under `C:\Users\Admin\Videos\mk\vyro\docs\prd\`.

---

## 2. Project Scope & Objectives

### 2.1 Business Goals

- Sell premium hats and sunglasses online.
- Provide a bilingual (Persian/English) shopping experience.
- Allow the store owner to manage products, categories, media, orders, customers, homepage content, and settings from an integrated admin panel.
- Support a manual card-to-card payment workflow for the Iranian market.

### 2.2 In Scope

- Storefront: homepage, shop, category pages, product details, search, cart, wishlist, recently viewed, Style Finder, checkout, invoice, and informational pages.
- Customer accounts: registration, login, logout, password reset (frontend-only).
- Admin dashboard: dashboard, products, categories, media library, orders, customers/users, homepage settings, store settings, activity logs.
- Localization (Persian/English) and currency conversion display (USD → Rial).
- Media upload, preview, replacement, deletion, and usage tracking.

### 2.3 Explicitly Out of Scope (Current Prototype)

- Real backend API or database.
- Production-grade authentication/authorization.
- Real payment gateway integration.
- Real shipping carrier integration or live rate calculation.
- Email/SMS notifications.
- Multi-device data synchronization.
- SEO server-side rendering.

---

## 3. Current Architecture

### 3.1 Application Shell

| Item | Verified Implementation |
|------|--------------------------|
| Entry point | `src/main.tsx` |
| Root component & routing | `src/app/App.tsx`, `src/app/routes/routes.ts`, `src/app/routes/routeConfig.tsx` |
| Layout | `src/components/layout/Layout.tsx` wraps storefront; `src/components/layout/AdminLayout.tsx` wraps admin |
| Page transitions | `src/components/layout/PageTransition.tsx` using `framer-motion` |
| State management | Zustand with persistence (`persist` middleware) for language, cart, wishlist, recently viewed, and Style Finder |
| SEO | `src/components/ui/SEO.tsx` via `react-helmet-async` |

### 3.2 Routing

Routes are declared in `src/app/routes/routes.ts` and rendered lazily with `React.lazy`. Storefront routes (except `/login`, `/register`, `/forgot-password`) are wrapped in `RequireAuth`. Admin routes (except `/admin/login`) are wrapped in `ProtectedAdminRoute`.

| Route | Page Component | Verified File |
|-------|----------------|---------------|
| `/` | Home | `src/pages/system/Home.tsx` |
| `/shop` | Shop | `src/pages/shop/Shop.tsx` |
| `/hats` | Hats category | `src/pages/shop/Hats.tsx` |
| `/glasses` | Glasses category | `src/pages/shop/Glasses.tsx` |
| `/product/:slug` | Product details | `src/pages/shop/ProductDetails.tsx` |
| `/style-finder` | Style Finder | `src/pages/shop/StyleFinder.tsx` |
| `/wishlist` | Wishlist | `src/pages/shop/Wishlist.tsx` |
| `/cart` | Cart | `src/pages/shop/Cart.tsx` |
| `/checkout` | Checkout | `src/pages/shop/Checkout.tsx` |
| `/invoice/:id` | Printable invoice | `src/pages/shop/Invoice.tsx` |
| `/search` | Search results | `src/pages/shop/SearchResults.tsx` |
| `/about`, `/contact`, `/faq`, `/shipping`, `/returns`, `/privacy`, `/terms` | Informational pages | `src/pages/info/*.tsx` |
| `/login`, `/register`, `/forgot-password` | Customer auth | `src/pages/account/*.tsx` |
| `/admin/login` | Admin login | `src/pages/admin/AdminLogin.tsx` |
| `/admin` | Dashboard | `src/pages/admin/AdminDashboard.tsx` |
| `/admin/products` | Product list | `src/pages/admin/AdminProducts.tsx` |
| `/admin/products/new` | Create product | `src/pages/admin/AdminProductCreate.tsx` |
| `/admin/products/:id/edit` | Edit product | `src/pages/admin/AdminProductEdit.tsx` |
| `/admin/media` | Media library | `src/pages/admin/AdminMediaLibrary.tsx` |
| `/admin/categories` | Categories | `src/pages/admin/AdminCategories.tsx` |
| `/admin/orders` | Orders | `src/pages/admin/AdminOrders.tsx` |
| `/admin/orders/:id` | Order detail | `src/pages/admin/AdminOrderDetail.tsx` |
| `/admin/users`, `/admin/customers` | Customers | `src/pages/admin/AdminCustomers.tsx` |
| `/admin/users/:id`, `/admin/customers/:id` | Customer detail | `src/pages/admin/AdminCustomerDetail.tsx` |
| `/admin/homepage` | Homepage settings | `src/pages/admin/AdminHomepage.tsx` |
| `/admin/settings` | Store settings | `src/pages/admin/AdminSettings.tsx` |
| `/admin/logs` | Activity logs | `src/pages/admin/AdminLogs.tsx` |

### 3.3 Data Persistence (Browser-Only)

| Data | Service | Storage Key/DB | Verified File |
|------|---------|----------------|---------------|
| Products | `productRepository` | `localStorage` `vyro_product_repository` | `src/features/admin/services/productRepository.ts` |
| Product image binaries | `imageStorage` | `IndexedDB` `vyro_image_db` | `src/features/admin/services/imageStorage.ts` |
| Media library metadata + binaries | `mediaRepository` | `IndexedDB` `vyro_media_db` | `src/services/media/mediaRepository.ts` |
| Orders | `orderService` | `localStorage` `vyro_orders_repository` | `src/services/orders/orderService.ts` |
| Customers | `customerService` | `localStorage` `vyro_customers_repository` | `src/services/customers/customerService.ts` |
| User accounts | `userAuth` | `localStorage` `vyro_users_repository` | `src/features/account/services/userAuth.ts` |
| User session | `userAuth` | `localStorage` `vyro_user_session` | `src/features/account/services/userAuth.ts` |
| Admin session | `adminAuth` | `localStorage` `vyro_admin_session` | `src/features/admin/services/adminAuth.ts` |
| Settings | `settingsService` | `localStorage` `vyro_settings` | `src/services/settings/settingsService.ts` |
| Exchange rate | `currencyService` | `localStorage` `vyro_currency_rate` | `src/services/currency/currencyService.ts` |
| Activity log | `logService` | `localStorage` `vyro_logs_repository` | `src/services/logs/logService.ts` |
| Cart | `cartStore` (Zustand) | `localStorage` `vyro-cart` | `src/features/cart/store/cartStore.ts` |
| Wishlist | `wishlistStore` (Zustand) | `localStorage` `vyro-wishlist` | `src/features/wishlist/store/wishlistStore.ts` |
| Recently viewed | `recentlyViewedStore` (Zustand) | `localStorage` `vyro-recently-viewed` | `src/features/recently-viewed/store/recentlyViewedStore.ts` |
| Language | `languageStore` (Zustand) | `localStorage` `vyro_language` | `src/stores/languageStore.ts` |
| Collections/categories | inline | `localStorage` `vyro_collections` | `src/pages/admin/AdminCategories.tsx` |

### 3.4 Build & Quality Scripts

| Script | Command | Verified Result |
|--------|---------|-----------------|
| Dev server | `npm run dev` | Available at `http://localhost:5173` |
| Production build | `npm run build` | Pass (`tsc -b && vite build`) |
| Lint | `npm run lint` | Passes with warnings only (`oxlint`) |
| Tests | `npm test` | **105 tests passed across 9 files** |

Detailed warnings are recorded in the QA plan (Section 10).

---

## 4. Product Requirements

### 4.1 Storefront Requirements

#### 4.1.1 Homepage

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| SF-HP-01 | Display a full-screen hero section with title, subtitle, and CTAs. | Verified | `src/pages/system/Home.tsx` |
| SF-HP-02 | Render featured products (up to 4 by default). | Verified | Uses `getFeaturedProducts(4)` |
| SF-HP-03 | Promote the Style Finder assistant. | Verified | Hard-coded section; not CMS-driven beyond homepage settings |
| SF-HP-04 | Use homepage settings (hero title, subtitle, hero image, featured title, about title/description) configurable from admin. | Partial | Settings model exists (`src/services/settings/settingsService.ts`) but `Home.tsx` currently uses hard-coded bilingual strings instead of reading `homepageSettings` |

#### 4.1.2 Navigation & Layout

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| SF-NAV-01 | Persistent header with logo, nav links, search, language switcher, wishlist, cart, and account/admin icons. | Verified | `src/components/layout/Header.tsx` |
| SF-NAV-02 | Persistent footer with quick links, support links, newsletter signup, and social links. | Verified | `src/components/layout/Footer.tsx` |
| SF-NAV-03 | Mobile-responsive hamburger menu with RTL/LTR slide direction. | Verified | `Header.tsx` |
| SF-NAV-04 | Customer must register/log in to browse storefront pages. | Verified | `RequireAuth` in `src/components/layout/RequireAuth.tsx` |
| SF-NAV-05 | Store owner logged into admin is exempt from customer auth gate. | Verified | `RequireAuth` checks `isUserAuthenticated() \|\| isAdminAuthenticated()` |

#### 4.1.3 Product Discovery

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| SF-DISC-01 | Shop page lists all storefront-visible products. | Verified | `src/pages/shop/Shop.tsx` |
| SF-DISC-02 | Category pages (`/hats`, `/glasses`) list only products in that category. | Verified | `src/pages/shop/Hats.tsx`, `src/pages/shop/Glasses.tsx` |
| SF-DISC-03 | Product cards display primary image, name, price, old price/discount, and quick-add button. | Verified | `src/components/product/ProductCard.tsx` |
| SF-DISC-04 | Product cards support hover image swap when a second image exists. | Verified | `ProductCard.tsx` |
| SF-DISC-05 | Draft products must be hidden from storefront listings. | Verified | `productService.ts` `isStorefrontVisible` |
| SF-DISC-06 | Full faceted filtering (category, price range, color, style, size, rating, availability). | Partial | Filter type exists (`src/types/filters.ts`) and `filterProducts` service exists, but the storefront UI (`Shop.tsx`) only provides category tabs and simple sort |
| SF-DISC-07 | Sorting by featured, newest, price low/high, best rated. | Partial | Full sort options exist in service; storefront only shows featured/newest/price |
| SF-DISC-08 | Pagination or infinite scroll for large product lists. | Missing | No pagination in storefront |

#### 4.1.4 Product Details

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| SF-PD-01 | Display product name, description, price, rating, color options, quantity selector, add-to-cart, and buy-now. | Verified | `src/pages/shop/ProductDetails.tsx` |
| SF-PD-02 | Image gallery with main image, thumbnails, and fallback on error. | Verified | `src/components/product/ProductGallery.tsx` |
| SF-PD-03 | Show related products. | Verified | `getRelatedProducts` |
| SF-PD-04 | Track product in recently viewed list. | Verified | `useRecentlyViewedStore` |
| SF-PD-05 | Support product variants (color, size). | Partial | Color selectable; size defaults to first entry; no variant-specific price/stock |
| SF-PD-06 | Display stock status. | Partial | `inStock`/`outOfStock` strings exist but not prominently shown on details page |

#### 4.1.5 Search

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| SF-SRCH-01 | Search modal accessible from header. | Verified | `src/components/search/SearchModal.tsx` |
| SF-SRCH-02 | Search by product name, style, color, tags, description. | Verified | `productService.searchProducts` |
| SF-SRCH-03 | Search results page with empty state. | Verified | `src/pages/shop/SearchResults.tsx` |

#### 4.1.6 Cart

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| SF-CART-01 | Add/remove/update quantities. | Verified | `src/features/cart/store/cartStore.ts` |
| SF-CART-02 | Merge identical items (same product, color, size). | Verified | `cartStore.ts` |
| SF-CART-03 | Persist cart across refreshes. | Verified | Zustand `persist` to `vyro-cart` |
| SF-CART-04 | Show subtotal, shipping, and total in active currency. | Verified | `src/pages/shop/Cart.tsx` |
| SF-CART-05 | Free shipping threshold ($75 USD / equivalent Rial). | Verified | `FREE_SHIPPING_THRESHOLD = 75`, `DEFAULT_SHIPPING_COST = 6` |
| SF-CART-06 | Empty cart state with CTA. | Verified | `Cart.tsx` |
| SF-CART-07 | Cart drawer (slide-out). | Verified | `src/features/cart/components/CartDrawer.tsx` |
| SF-CART-08 | Cart item images and prices rehydrate when image store loads. | Verified | `CartItem.tsx` uses `useImageStoreVersion` |

#### 4.1.7 Wishlist & Recently Viewed

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| SF-WL-01 | Toggle products in wishlist. | Verified | `src/features/wishlist/store/wishlistStore.ts` |
| SF-WL-02 | Persist wishlist across refreshes. | Verified | Zustand `persist` |
| SF-WL-03 | Wishlist page with move-to-cart and remove actions. | Verified | `src/pages/shop/Wishlist.tsx` |
| SF-RV-01 | Track recently viewed product IDs (max 20). | Verified | `src/features/recently-viewed/store/recentlyViewedStore.ts` |

#### 4.1.8 Style Finder

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| SF-SF-01 | Multi-step quiz: style, shopping for, colors, budget. | Verified | `src/features/style-finder/components/StyleFinder.tsx` |
| SF-SF-02 | Score and return top 3 matching products. | Verified | `src/features/style-finder/store/styleFinderStore.ts` |
| SF-SF-03 | Allow restart. | Verified | `StyleFinder.tsx` |

#### 4.1.9 Checkout & Invoice

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| SF-CHK-01 | Collect customer and shipping information with validation. | Verified | `src/pages/shop/Checkout.tsx` |
| SF-CHK-02 | Display shop card number for card-to-card transfer. | Verified | Reads `paymentSettings.cardNumber` |
| SF-CHK-03 | Require receipt image upload before placing order. | Verified | JPG/PNG/WEBP ≤5MB; stored in `vyro_image_db` |
| SF-CHK-04 | Create order with `awaiting-approval` status for card-to-card. | Verified | `orderService.createOrder` |
| SF-CHK-05 | Decrement stock on order creation. | Verified | `decrementStock` |
| SF-CHK-06 | Create/upset customer record from checkout. | Verified | `customerService` |
| SF-CHK-07 | Show order success screen with invoice link. | Verified | `Checkout.tsx` |
| SF-INV-01 | Generate printable invoice at `/invoice/:id`. | Verified | `src/pages/shop/Invoice.tsx` |
| SF-INV-02 | Invoice localized with Persian calendar when language is Persian. | Verified | `Invoice.tsx` |

#### 4.1.10 Informational Pages

| ID | Requirement | Status |
|----|-------------|--------|
| SF-INFO-01 | About, Contact, FAQ, Shipping, Returns, Privacy, Terms pages. | Verified |

#### 4.1.11 Loading, Error, Empty, Success States

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| SF-STATE-01 | Suspense page loader for lazy routes. | Verified | `src/app/App.tsx` |
| SF-STATE-02 | Product not found page. | Verified | `ProductDetails.tsx` |
| SF-STATE-03 | Empty cart, empty wishlist, empty search results. | Verified | |
| SF-STATE-04 | Image fallback for broken/missing images. | Verified | `ReusableImage.tsx`, `ProductGallery.tsx`, `ProductCard.tsx` |
| SF-STATE-05 | Global error boundary. | Missing | No `ErrorBoundary` component found |

---

### 4.2 Admin Dashboard Requirements

#### 4.2.1 Dashboard Overview

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| AD-DB-01 | Display product, order, customer, and revenue stats. | Verified | `src/pages/admin/AdminDashboard.tsx` |
| AD-DB-02 | Highlight low-stock products (threshold = 10). | Verified | |
| AD-DB-03 | List recent orders and recent products. | Verified | |
| AD-DB-04 | Quick actions to products, add product, media library, storefront. | Verified | |
| AD-DB-05 | Inline exchange-rate editor. | Verified | |

#### 4.2.2 Product Management

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| AD-PM-01 | List products with search, status filter, category filter. | Verified | `src/pages/admin/AdminProducts.tsx` |
| AD-PM-02 | Inline price editing (Toman for Persian, USD for English). | Verified | `EditablePrice` component in `AdminProducts.tsx` |
| AD-PM-03 | Create product with name, slug, description, category, style, colors, sizes, stock, price, old price, tags, status, flags. | Verified | `src/pages/admin/AdminProductCreate.tsx` |
| AD-PM-04 | Edit product with same fields. | Verified | `src/pages/admin/AdminProductEdit.tsx` |
| AD-PM-05 | Delete product with confirmation. | Verified | |
| AD-PM-06 | Validate slug format and uniqueness. | Verified | `productRepository` |
| AD-PM-07 | Product status: `active`, `draft`, `out-of-stock`. | Verified | `src/types/product.ts` |
| AD-PM-08 | Preview product on storefront. | Verified | Eye icon in product list |

#### 4.2.3 Category Management

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| AD-CM-01 | List, create, edit, delete collections/categories. | Verified | `src/pages/admin/AdminCategories.tsx` |
| AD-CM-02 | Fields: title, slug, subtitle, description, image URL. | Verified | |
| AD-CM-03 | Store categories in `localStorage` key `vyro_collections`. | Verified | |

#### 4.2.4 Media Library

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| AD-ML-01 | Upload images (JPG, JPEG, PNG, WEBP, SVG) up to 5MB. | Verified | `src/pages/admin/AdminMediaLibrary.tsx`, `src/services/media/mediaService.ts` |
| AD-ML-02 | Store binaries in `IndexedDB` `vyro_media_db`. | Verified | `mediaRepository.ts` |
| AD-ML-03 | Search, filter by location, sort by name/date/size. | Verified | |
| AD-ML-04 | Edit metadata (name, alt, description, location). | Verified | |
| AD-ML-05 | Replace image binary while preserving ID and usage. | Verified | `replaceImage` |
| AD-ML-06 | Delete image with usage warning. | Verified | Shows `usedIn` list; no hard block verified in code but warning exists |
| AD-ML-07 | Display storage usage vs 200MB budget. | Verified | |
| AD-ML-08 | Seed default site images on first run. | Verified | `mediaRepository.seedDefaults` |

#### 4.2.5 Order Management

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| AD-OM-01 | List orders with search and status filter. | Verified | `src/pages/admin/AdminOrders.tsx` |
| AD-OM-02 | Order detail with customer info, items, totals, status history. | Verified | `src/pages/admin/AdminOrderDetail.tsx` |
| AD-OM-03 | Seven statuses: pending, awaiting-approval, paid, processing, shipped, completed, cancelled. | Verified | `src/types/order.ts` |
| AD-OM-04 | Confirm card-to-card payment (`awaiting-approval` → `paid`). | Verified | `confirmOrderPayment` |
| AD-OM-05 | Reject card-to-card payment (`awaiting-approval` → `cancelled`) and restore stock. | Verified | `rejectOrderPayment` |
| AD-OM-06 | Delete order. | Verified | `deleteOrder` |

#### 4.2.6 Customer Management

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| AD-CUST-01 | List customers with search. | Verified | `src/pages/admin/AdminCustomers.tsx` |
| AD-CUST-02 | Customer detail page. | Verified | `src/pages/admin/AdminCustomerDetail.tsx` |
| AD-CUST-03 | Upsert customer from checkout. | Verified | `customerService.createCustomer` |
| AD-CUST-04 | Track order count and total spent. | Verified | `incrementCustomerOrderStats` |

#### 4.2.7 Homepage Content Management

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| AD-HP-01 | Edit hero title, subtitle, background image. | Verified | `src/pages/admin/AdminHomepage.tsx` |
| AD-HP-02 | Edit featured section title. | Verified | |
| AD-HP-03 | Edit about section title/description. | Verified | |
| AD-HP-04 | Select images from media library. | Partial | UI suggests Media Library but uses manual URL / suggested thumbnails; no deep integration |
| AD-HP-05 | Manage featured product/category IDs. | Partial | Fields exist in settings model but UI does not expose them |

#### 4.2.8 Store Settings

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| AD-SET-01 | Edit store name, email, phone, address, description. | Verified | `src/pages/admin/AdminSettings.tsx` |
| AD-SET-02 | Set default language (Persian/English). | Verified | |
| AD-SET-03 | Set default currency and exchange rate. | Verified | |
| AD-SET-04 | Configure card-to-card payment card number and holder. | Verified | |
| AD-SET-05 | Maintenance mode toggle (UI only, not wired to block storefront). | Partial | Toggle exists but no enforcement logic found |
| AD-SET-06 | Order notification toggle (UI only, not wired). | Partial | Toggle exists but no notification logic found |

#### 4.2.9 Activity Logs

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| AD-LOG-01 | Log order/product/customer/media/settings/auth events. | Verified | `src/services/logs/logService.ts` |
| AD-LOG-02 | Filter and search logs. | Verified | `src/pages/admin/AdminLogs.tsx` |
| AD-LOG-03 | Clear logs. | Verified | |
| AD-LOG-04 | Cap at 500 entries. | Verified | `logService.ts` |

#### 4.2.10 Admin Authentication

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| AD-AUTH-01 | Login page at `/admin/login`. | Verified | `src/pages/admin/AdminLogin.tsx` |
| AD-AUTH-02 | Demo credentials `nima1389` / `898989`. | Verified | `src/features/admin/services/adminAuth.ts` |
| AD-AUTH-03 | UI-level route protection. | Verified | `ProtectedAdminRoute.tsx` |
| AD-AUTH-04 | Production-grade server-side authentication. | Missing | Explicitly documented as prototype only |

---

### 4.3 Product Data Model

#### 4.3.1 Canonical Product Model

The current TypeScript product model is defined in `src/types/product.ts`:

```ts
export interface Product {
  id: string;              // Stable unique identifier
  name: string;            // Product name (single-language currently)
  slug: string;            // URL slug
  category: Category;      // 'hat' | 'glasses'
  priceUSD: number;        // Canonical price in USD (see currency note below)
  oldPriceUSD?: number;    // Optional compare-at price in USD
  description: string;     // Single-language description
  images: string[];        // Ordered gallery; values are image IDs or paths
  primaryImage?: string;   // Explicit primary image reference
  status?: ProductStatus;  // 'active' | 'draft' | 'out-of-stock'
  colors: Color[];         // e.g. 'Black' | 'White' | ...
  sizes: string[];         // e.g. 'One Size', 'S/M'
  rating: number;
  reviewCount: number;
  reviews: Review[];
  stock: number;
  tags: string[];
  style: Style;            // 'Street' | 'Minimal' | 'Classic' | 'Sport' | 'Luxury' | 'Casual'
  featured: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  isLimited?: boolean;
}
```

#### 4.3.2 Requirements vs. Current Implementation

| Requirement | Brief Mandate | Current Implementation | Gap |
|-------------|---------------|------------------------|-----|
| Canonical price storage | Store in **Rial** | Stored in **USD** (`priceUSD`) | **Critical gap** — see Section 4.4 |
| Bilingual content | Separate Persian & English names, descriptions, slugs | Single `name`, `description`, `slug` fields | **Major gap** |
| Stable IDs | Stable unique product ID | `id` field used; IDs generated with `generateId()` | OK |
| Ordered gallery | Ordered image gallery + primary image | `images: string[]`, `primaryImage?: string` | OK |
| Timestamps | Creation/update timestamps | **Missing** | Gap |
| Specifications | Category and specifications | Category, style, colors, sizes, tags present | OK |
| Publication status | Inventory and publication status | `status` + `stock` present | OK |

#### 4.3.3 Data Validation

| Rule | Verified |
|------|----------|
| Name required | `AdminProductCreate.tsx` |
| Slug required; lowercase letters, numbers, hyphens only | `AdminProductCreate.tsx`, `productRepository.ts` |
| Slug uniqueness enforced | `productRepository.ts` |
| Price must be a non-negative finite number | `AdminProductCreate.tsx` |
| Stock must be a non-negative integer | `AdminProductCreate.tsx` |
| At least one image required | `AdminProductCreate.tsx` |
| Category required | `AdminProductCreate.tsx` |

#### 4.3.4 Data Integrity Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| DI-01 | Product IDs must never change during language/currency switches. | Verified by implementation |
| DI-02 | Product images must resolve by stable ID even when language changes. | Verified (`imageStorage.getUrl`) |
| DI-03 | Inventory updates from checkout must be atomic and persisted. | Partial (localStorage only) |
| DI-04 | Historical order line items must snapshot product name, price, and image at order time. | Verified (`OrderItem`) |
| DI-05 | Deleting a product must not break existing orders that reference it. | Verified (orders snapshot data) |
| DI-06 | Creation and update timestamps must be recorded. | Missing |

---

### 4.4 Language & Currency Requirements

#### 4.4.1 Language Rules

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| LANG-01 | Persian (Farsi) is the default language. | Verified | `languageStore.ts` defaults to `'fa'`; `index.html` has `lang="fa" dir="rtl"` |
| LANG-02 | Persian uses RTL layout. | Verified | `App.tsx` sets `document.documentElement.dir = 'rtl'` |
| LANG-03 | English uses LTR layout. | Verified | |
| LANG-04 | Language preference persists across sessions. | Verified | Zustand `persist` to `vyro_language` |
| LANG-05 | All UI text rendered via translation keys. | Partial | Most UI uses `t()`; some admin inline strings remain language-conditional |

#### 4.4.2 Currency Rules

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| CURR-01 | Product prices stored canonically in **Rial**. | **Not implemented** | Current canonical field is `priceUSD` |
| CURR-02 | Persian prices displayed in **Rial**. | Verified | `formatProductPrice` with `locale: 'fa'` converts USD → Rial |
| CURR-03 | English prices displayed in **USD**. | Verified | `formatProductPrice` with `locale: 'en'` shows USD |
| CURR-04 | Initial exchange rate: 230,000 Toman/USD = 2,300,000 Rial/USD. | Verified | `CURRENCY_CONFIG.USD_TO_TOMAN = 230000`, `TOMAN_TO_RIAL = 10` |
| CURR-05 | Exchange rate is static and configurable, no external API. | Verified | `currencyService.ts` reads/writes `vyro_currency_rate` |
| CURR-06 | Currency conversion centralized. | Verified | `src/services/currency/currencyService.ts`, `src/lib/format.ts`, `src/components/ui/Price.tsx` |
| CURR-07 | Canonical product price must not be overwritten during conversion. | Verified in behavior | USD price is never mutated by rate changes |
| CURR-08 | All price surfaces use consistent currency rules. | Verified | Product pages, Style Finder, cart, checkout, admin use `formatProductPrice` / `Price` |
| CURR-09 | Language switching must not corrupt product IDs, images, inventory, cart, or wishlist. | Verified | These are stored independently of language |

#### 4.4.3 Conversion Formulas

```
Rial = USD × usdToTomanRate × 10
Toman = USD × usdToTomanRate
USD = Rial ÷ (usdToTomanRate × 10)
```

- `usdToTomanRate` defaults to `230000` and is persisted in `localStorage`.
- Conversion rounds to the nearest integer using `Math.round`.
- Invalid or non-positive inputs return `0` or fallback strings (`'نامعتبر'` / `'$0.00'`).

#### 4.4.4 Known Conflict

> **The project brief requires prices to be stored canonically in Rial. The current codebase stores prices canonically in USD (`priceUSD`).** This is the most significant product-data conflict. Converting the canonical store to Rial is a **P0** roadmap item (see `ROADMAP.md`).

---

### 4.5 Media & Image Management Requirements

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| MED-01 | Stable media identifiers (IDs) for uploaded images. | Verified | `generateImageId()`, `generateMediaId()` |
| MED-02 | Upload validation (type, size ≤5MB). | Verified | `validateImageFile` in `imageStorage.ts` and `mediaService.ts` |
| MED-03 | Image previews after upload. | Verified | Object URLs from `IndexedDB` blobs |
| MED-04 | Image replacement while preserving references. | Verified | `mediaService.replaceImage` |
| MED-05 | Gallery ordering and primary image selection. | Verified | `ImageUpload.tsx` supports drag/click ordering and primary selection |
| MED-06 | Media reuse across products and homepage sections. | Partial | Media library exists; product create/edit uses separate `imageStorage` IDs, not media library references |
| MED-07 | Missing-image fallback (`/images/site/fallback.svg`). | Verified | `ReusableImage.tsx` |
| MED-08 | Safe deletion with usage warning. | Partial | Warning shown; hard enforcement not verified |
| MED-09 | Error handling and storage budget enforcement (200MB). | Verified | `IMAGE_STORAGE_BUDGET`, `hasImageBudgetFor` |
| MED-10 | Persistence across page refreshes. | Verified | `IndexedDB` |
| MED-11 | Future backend/cloud-storage integration path. | Future | Repository pattern is abstracted; replace adapters behind `src/services/*` |

#### 4.5.1 Media vs. Product Image Storage

The application currently maintains **two separate image stores**:

1. **`imageStorage`** (`vyro_image_db`) — used by product create/edit and checkout receipts.
2. **`mediaRepository`** (`vyro_media_db`) — used by the Media Library and homepage/category images.

This split is a maintainability risk. A future improvement should unify them or at least allow product images to reference Media Library records.

---

### 4.6 UI/UX Requirements

#### 4.6.1 Brand & Design Tokens

| Token | Value | Source |
|-------|-------|--------|
| Primary color | `#111111` | `src/index.css` `--color-primary` |
| Background | `#F7F6F2` | `--color-background` |
| Surface | `#FFFFFF` | `--color-surface` |
| Accent | `#D6FF3F` | `--color-accent` |
| Text | `#171717` | `--color-text` |
| Text secondary | `#777777` | `--color-text-secondary` |
| Border | `#E8E8E8` | `--color-border` |
| Font | System UI stack | `--font-sans` |

#### 4.6.2 Layout & Components

| Requirement | Status | Notes |
|-------------|--------|-------|
| Responsive mobile/tablet/desktop layouts | Verified | Tailwind breakpoints `sm`, `md`, `lg` used throughout |
| RTL/LTR direction switching | Verified | `dir` attribute + Tailwind RTL utilities |
| Accessible focus indicators | Verified | `:focus-visible` outline in `index.css` |
| Reduced motion support | Verified | `prefers-reduced-motion` media query |
| Consistent buttons, inputs, dialogs, tables | Verified | Shared components in `src/components/ui/*` |
| Product card aspect ratio 4:5 / 1:1 | Verified | `ProductCard.tsx` `aspect-[4/5]`, images `aspect-ratio: 1/1` |
| Keyboard navigable accordions, selects | Partial | Basic focus states present; full a11y audit not performed |

---

### 4.7 Technical Requirements

#### 4.7.1 Current Implementation

| Area | Implementation |
|------|----------------|
| Framework | React 19 with TypeScript |
| Bundler | Vite 8 |
| Styling | Tailwind CSS 4 with Vite plugin |
| Routing | React Router 7 (`BrowserRouter` inferred) |
| State | Zustand for client state; service singletons for data access |
| Forms | Controlled inputs with inline validation |
| Icons | Lucide React |
| Animations | Framer Motion |
| Tests | Vitest + jsdom (105 tests passing) |
| Lint | Oxlint |

#### 4.7.2 Recommended Future Architecture

| Area | Current | Recommended |
|------|---------|-------------|
| Backend | None | REST/GraphQL API with real database |
| Auth | localStorage session flags | Server-side sessions/JWT with HTTP-only cookies |
| Media | IndexedDB blobs | Object storage (S3/MinIO/Cloudflare R2) with CDN URLs |
| Currency | Static configurable rate | Admin-configurable rate persisted in database; optional caching |
| Product content | Single-language fields | Bilingual schema (`nameFa`, `nameEn`, `descriptionFa`, `descriptionEn`, `slugFa`, `slugEn`) |
| Orders | localStorage | Database with ACID transactions and audit log |
| Testing | Unit tests only | Add component (RTL) and E2E (Playwright) tests |

---

### 4.8 Security & Non-Functional Requirements

#### 4.8.1 Security

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| SEC-01 | Admin authentication must be server-side enforced. | Missing | Current auth is UI-only prototype |
| SEC-02 | Customer passwords must not be stored in plain text. | Verified | `userAuth.ts` salts and hashes with SHA-256 (frontend-only, not production-secure) |
| SEC-03 | Input validation on forms and file uploads. | Verified | `Checkout.tsx`, `AdminProductCreate.tsx`, `validateImageFile` |
| SEC-04 | Customer data protection (encryption at rest/transit). | Missing | localStorage is plaintext; no TLS guarantee beyond browser |
| SEC-05 | Secrets (credentials, card numbers) must not be hardcoded in source. | Partial | Admin demo credentials are constants; shop card number is configurable in settings |

#### 4.8.2 Non-Functional

| ID | Requirement | Status |
|----|-------------|--------|
| NF-01 | Production build passes TypeScript and Vite build. | Verified |
| NF-02 | All automated tests pass. | Verified (105/105) |
| NF-03 | Responsive on mobile, tablet, desktop. | Verified |
| NF-04 | RTL and LTR layout correctness. | Verified |
| NF-05 | Accessibility focus states and reduced motion. | Partial |
| NF-06 | Browser compatibility (modern evergreen). | Verified by Vite/React 19 target |
| NF-07 | Maintainable modular structure. | Verified |
| NF-08 | Error recovery from localStorage/IndexedDB failures. | Partial — failures are swallowed but UX may degrade silently |

---

## 5. Assumptions, Risks & Open Questions

### 5.1 Assumptions

1. The browser-only prototype is acceptable for demo/development; production will require a backend.
2. The store owner operates in a market where card-to-card transfers are acceptable.
3. Customers and store owner use the same browser session for receipt visibility.
4. The current USD canonical price model is treated as an implementation detail that will be reconciled with the brief's Rial requirement.

### 5.2 Risks

| ID | Risk | Severity |
|----|------|----------|
| RISK-01 | Canonical price stored in USD contradicts the brief's Rial requirement and may cause accounting/reporting errors. | High |
| RISK-02 | Single-language product fields prevent a true bilingual storefront. | High |
| RISK-03 | Browser-only persistence means data loss on cache clear and no multi-device sync. | High |
| RISK-04 | Frontend-only admin auth is trivially bypassable. | High |
| RISK-05 | Product images and media library use separate storage systems, risking inconsistency. | Medium |
| RISK-06 | No global error boundary; runtime errors may crash the app. | Medium |
| RISK-07 | Maintenance mode and notification toggles are UI-only. | Low |

### 5.3 Open Questions

1. Should the canonical price be migrated to Rial (as the brief states) or should the brief be updated to reflect USD as canonical?
2. Should product names, descriptions, and slugs be fully bilingual, or is the current single-field model with translated UI strings sufficient?
3. What is the target launch environment, and when should backend/API development begin?
4. Are there specific accessibility standards (e.g., WCAG 2.1 AA) that must be met?

---

## 6. Related Documentation

- `README.md` — Project overview and run instructions.
- `docs/admin-panel.md` — Detailed admin panel architecture, limitations, and security notes. This PRD preserves and cross-references that content.
- `docs/prd/FEATURE_MATRIX.md` — Feature-by-feature implementation status.
- `docs/prd/ACCEPTANCE_CRITERIA.md` — Testable acceptance criteria.
- `docs/prd/ROADMAP.md` — Prioritized implementation roadmap.
