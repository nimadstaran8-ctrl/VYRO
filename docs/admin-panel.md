# VYRO Admin Panel — Architecture, Limitations & Security Notes

This document describes how the admin panel is built, what is real, and what is
a prototype. Read it before deploying anything to production.

## Routes

| Route | Page |
| --- | --- |
| `/admin/login` | Admin login (standalone, outside the admin layout) |
| `/admin` | Dashboard (stats, low stock, recent orders/products, currency rate) |
| `/admin/products` | Product list (search, status/category filters, preview, delete) |
| `/admin/products/new` | Create product |
| `/admin/products/:id/edit` | Edit product |
| `/admin/orders` | Order list (search, six-status filter) |
| `/admin/orders/:id` | Order detail (customer info, status updates) |
| `/admin/users` | Users (alias: `/admin/customers`) |
| `/admin/users/:id` | User detail (alias: `/admin/customers/:id`) |
| `/admin/media` | Media library (multi-upload, edit, replace, delete, filter, sort) |
| `/admin/categories` | Collections/categories manager (pre-existing) |
| `/admin/homepage` | Homepage settings (pre-existing) |
| `/admin/settings` | Store, language, currency settings |
| `/admin/logs` | Activity log (filter by type, search, clear) |

All admin pages except `/admin/login` are wrapped in `ProtectedAdminRoute`
(`src/components/layout/ProtectedAdminRoute.tsx`), which redirects to
`/admin/login` when no session exists.

## Authentication status: frontend prototype, NOT secure

`src/features/admin/services/adminAuth.ts` implements a demo login:

- Credentials are **demo constants** (`nima1389` / `898989`, defined in
  `adminAuth.ts`; they are deliberately not displayed on the login screen).
  They are not real credentials and protect nothing.
- The session flag lives in `sessionStorage` and is trivially editable or
  bypassable from the browser.
- Route protection is **UI-level only**. There is no backend to enforce
  authorization.

For production, replace this with server-side authentication (signed session
tokens, OAuth, etc.) and enforce permissions on the API.

## Persistence status: browser-only, no backend

Product/order/customer/settings **metadata** lives in the browser's
localStorage. **Uploaded image binaries live in IndexedDB** (`vyro_image_db`
for product images, `vyro_media_db` for the media library), stored as Blobs
and displayed via session object URLs. Legacy base64 records from the old
localStorage stores are migrated automatically on startup.

| Data | Service | Storage |
| --- | --- | --- |
| Products | `productRepository` | localStorage `vyro_product_repository` |
| Product image binaries | `imageStorage` | IndexedDB `vyro_image_db` |
| Media library metadata + binaries | `mediaRepository` | IndexedDB `vyro_media_db` |
| Orders | `orderService` | localStorage `vyro_orders_repository` |
| Users/customers | `customerService` | localStorage `vyro_customers_repository` |
| Settings | `settingsService` | localStorage `vyro_settings` |
| Exchange rate | `currencyService` | localStorage `vyro_currency_rate` |
| Activity log | `logService` | localStorage `vyro_logs_repository` |

Consequences (these are hard limits, not bugs):

- **Data is per-browser and per-device.** Changes made in Chrome do not appear
  in Firefox or on another machine. IndexedDB is also per-origin.
- **Image budget: 200 MB total** (`IMAGE_STORAGE_BUDGET` in
  `src/config/storage.ts`), shared across product images and the media
  library, with a 5 MB per-file limit. Browsers would allow far more, but the
  app enforces this budget and rejects further uploads once it is reached.
- **No server-side durability.** Clearing site data deletes products, orders,
  users and uploaded images.
- **Orders and users are real only in the sense that they are created by real
  interactions** (checkout creates an order and upserts the customer). On first
  run the order/customer services seed a small set of clearly-labeled **demo
  records** (ORD-001…005, CUST-001…005) so the dashboard is not empty. These are
  sample data, not sales. The dashboard, orders and users pages display a
  notice (`admin.demoDataNotice`) stating this. Users can be deleted from the
  admin; their orders remain in the orders list.
- Legacy order status `delivered` (pre-expansion) is migrated to `completed`
  when old localStorage data is loaded.

A production deployment should replace the localStorage/IndexedDB adapters
behind `src/services/*` with a real backend (the media repository already
encapsulates its storage behind repository functions for this purpose).

## Currency system

Single source of truth: `src/services/currency/currencyService.ts` +
`src/config/currency.ts`.

- Product prices are **stored in USD** everywhere (product model field
  `priceUSD`).
- Defaults: `USD_TO_TOMAN = 230000`, `TOMAN_TO_RIAL = 10`, so
  `USD_TO_RIAL = 2,300,000`. No external rate APIs (no TGJU).
- Persian locale displays Rial converted from USD at the configured rate;
  English displays USD. Changing the rate in the dashboard or settings updates
  all Persian price displays **without touching stored USD prices**.
- All price rendering goes through this service (`formatProductPrice` directly,
  or the `Price` component / `lib/format.ts` wrappers used by product cards,
  details, search, cart, checkout, wishlist and style finder).

## Product status

`Product.status` (`src/types/product.ts`): `active | draft | out-of-stock`
(default `active`). Drafts are hidden from all storefront-facing catalog
functions (`getProducts`, `getProductBySlug`, search, featured/trending,
category listings). `getProductById` and `getAllProducts` remain unfiltered for
admin use (cart/wishlist item resolution, edit pages).

## Activity log (frontend-only)

`/admin/logs` (`src/pages/admin/AdminLogs.tsx`) shows a chronological feed of
events recorded by `src/services/logs/logService.ts` (storage key
`vyro_logs_repository`, capped at 500 entries, oldest dropped first).

- **What gets logged** — order created / status changed / deleted,
  product created / updated / deleted, customer created (e.g. from checkout
  upsert) / deleted, media uploaded / updated / deleted, settings section
  saved or reset, admin login / logout. The wiring lives inside the existing
  services (`orderService`, `productService`, `customerService`,
  `settingsService`, `mediaService`, `adminAuth`), so every code path that
  mutates those stores is covered. Logging never throws: storage failures are
  swallowed so they can't break the action being logged.
- **Rendering helpers** in `src/lib/activityLog.ts` (labels, badge colors,
  localized descriptions, Persian-calendar timestamps via
  `Intl.DateTimeFormat('fa-IR')`).
- **Limitations** — the log is `localStorage`-only: it records only what
  happens in the current browser, it starts empty (seeded demo orders are NOT
  logged), failed login attempts are not logged, and it is trivially editable
  or clearable by anyone with devtools access (same caveat as all other
  client-side data here). "Clear logs" wipes all entries permanently.

## Commands

```bash
npm run dev      # start dev server (admin at /admin/login)
npm run build    # type-check + production build
npm run lint     # oxlint
npm test         # vitest (includes orderService + adminAuth suites)
npx tsc --noEmit
```
