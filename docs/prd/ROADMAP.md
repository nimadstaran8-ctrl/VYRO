# VYRO Implementation Roadmap

> **Purpose:** Prioritized plan of work for VYRO. Each item references requirement IDs from `PRD.md` and acceptance criteria from `ACCEPTANCE_CRITERIA.md`. Verification methods use the actual scripts and commands found in the repository.

---

## Priority Definitions

- **P0 — Critical:** Must be resolved before any production use. Covers data integrity, security, stability, and conflicts with the project brief.
- **P1 — Essential:** Required for a complete, shippable MVP. Missing features that block core user flows or create significant UX gaps.
- **P2 — Improvement:** Enhancements, technical debt, and future capabilities.

---

## P0: Critical Correctness, Stability & Data Integrity

| ID | Title | Description | Dependencies | Acceptance Criteria | Verification |
|----|-------|-------------|--------------|---------------------|--------------|
| P0-001 | **Resolve canonical price currency conflict** | The brief requires product prices to be stored canonically in Rial; the current model stores `priceUSD`. Decide whether to migrate the canonical field to Rial (`priceRial`) or update the brief. If Rial is canonical, update `Product`, `currencyService`, admin create/edit, inline price editor, cart, checkout, and order snapshots to use Rial as the source of truth and convert to USD for English display. | PRD §4.4, AC-CURR-07, AC-DATA-05 | AC-CURR-01, AC-CURR-02, AC-CURR-03, AC-DATA-05 | `npm run build`, `npm test`, manual admin/storefront price checks in both languages |
| P0-002 | **Implement production admin authentication** | Replace the frontend-only demo auth (`adminAuth.ts`) with server-side authentication (signed JWT or session cookies). Ensure all admin mutations are enforced server-side. | AD-AUTH-04, AC-ADMIN-AUTH-05 | AC-ADMIN-AUTH-01 to AC-ADMIN-AUTH-05 | Security audit, integration tests, `npm test` |
| P0-003 | **Implement production customer authentication** | Move user registration/login/password reset to a backend. Remove plaintext localStorage password storage. | SEC-02 | Login/register flows still pass; credentials not stored client-side | Security audit, integration tests |
| P0-004 | **Establish backend persistence** | Replace localStorage/IndexedDB persistence for products, orders, customers, settings, and logs with a real database and API. Ensure ACID guarantees for order creation and stock updates. | All persistence services | AC-DATA-02, AC-DATA-03, AC-ADMIN-ORD-02, AC-ADMIN-ORD-03 | Integration tests, database transaction tests |
| P0-005 | **Add bilingual product content fields** | Add separate `nameFa`, `nameEn`, `descriptionFa`, `descriptionEn`, `slugFa`, `slugEn` fields (or equivalent) to the `Product` model. Update storefront, admin create/edit, search, and URL routing to use the active language. | DM-03, DM-05, DM-07, AC-DATA-06 | AC-LANG-03, AC-LANG-04, AC-PROD-10, AC-DATA-06 | `npm run build`, `npm test`, manual bilingual product create/edit |
| P0-006 | **Encrypt sensitive data at rest and in transit** | Ensure customer PII, passwords, and payment receipts are encrypted. Use TLS for all communications. Requires backend. | P0-003, P0-004 | SEC-04, SEC-05 | Security audit, penetration test |
| P0-007 | **Unify media storage or integrate product images with Media Library** | Decide whether product images should use the Media Library (`vyro_media_db`) or keep a separate store. Eliminate the dual-storage risk by unifying on one repository with usage tracking. | MED-06, IMG-08, IMG-11 | AC-ADMIN-MEDIA-05, AC-ADMIN-MEDIA-06 | `npm test`, manual image replacement/delete flows |
| P0-008 | **Add creation/update timestamps to products** | Add `createdAt` and `updatedAt` fields to `Product` and persist them. Update admin product list to allow sorting by date. | DM-19, DM-20 | Admin product list shows creation/update dates | `npm run build`, `npm test` |

---

## P1: Essential Missing Features

| ID | Title | Description | Dependencies | Acceptance Criteria | Verification |
|----|-------|-------------|--------------|---------------------|--------------|
| P1-001 | **Full faceted filter UI on shop page** | Implement the filter panel for price range, colors, styles, sizes, rating, and availability using the existing `Filters` type and `filterProducts` service. | SF-DISC-06, SF-DISC-07 | AC-PROD-08, filter acceptance tests | Manual UI test, add unit tests |
| P1-002 | **Pagination or virtual scrolling for product lists** | Add pagination to `/shop`, `/hats`, `/glasses`, admin product list, and media library to handle large catalogs. | SF-DISC-08 | Large catalog loads without performance degradation | Performance test with 500+ products |
| P1-003 | **Global error boundary** | Add a React error boundary to catch runtime errors and display a fallback UI instead of a blank screen. | SF-STATE-05, AC-ERR-06 | AC-ERR-06 | Unit test with `react-error-boundary` or custom component |
| P1-004 | **Stock display and out-of-stock enforcement** | Show stock status prominently on product details. Prevent adding out-of-stock items to cart. | SF-PD-06 | AC-PROD-07 (with stock check) | Manual test, unit tests |
| P1-005 | **Full sort options in storefront** | Expose all sort options (featured, newest, price low/high, best rated) in the storefront UI. | SF-DISC-07 | Sort dropdown contains all options and works correctly | Manual test |
| P1-006 | **Wire maintenance mode toggle** | Connect the maintenance mode toggle in `AdminSettings.tsx` to a global flag that blocks storefront access for non-admin users. | AD-SET-05 | Maintenance mode active → non-admin visitors see maintenance page | Manual test |
| P1-007 | **Wire order notification toggle** | Connect the order notification toggle to an actual notification mechanism (email/SMS/webhook) once backend is available. | AD-SET-06, P0-004 | Toggle on → notification sent on new order | Integration test |
| P1-008 | **Media library picker in product create/edit** | Allow admins to select existing images from the Media Library when creating/editing products, instead of uploading new files each time. | P0-007 | Product images can be chosen from Media Library | Manual test |
| P1-009 | **Featured product/category management on homepage** | Expose `featuredProductIds` and `featuredCategoryIds` in `AdminHomepage.tsx` and wire them to the storefront homepage. | AD-HP-05, SF-HP-04 | Homepage shows admin-selected featured products/categories | Manual test |
| P1-010 | **Comprehensive component/integration tests** | Add React Testing Library tests for key components (Header, ProductCard, CartDrawer, Checkout form, AdminProductCreate). | TQ-11 | Component test coverage ≥ 70% | `npm test` |
| P1-011 | **Accessibility audit and fixes** | Audit against WCAG 2.1 AA, fix issues (missing labels, color contrast, keyboard traps, focus management). | NF-05 | axe-core or Lighthouse a11y score ≥ 90 | Automated a11y scan |
| P1-012 | **Complete translation coverage** | Remove remaining inline language-conditional strings and ensure all text is driven by `fa.ts` / `en.ts`. | LC-05 | No hard-coded bilingual strings outside translation files | Grep/scan |

---

## P2: Improvements & Future Enhancements

| ID | Title | Description | Dependencies | Acceptance Criteria | Verification |
|----|-------|-------------|--------------|---------------------|--------------|
| P2-001 | **Add product variant model** | Support per-variant price, stock, SKU, and images (e.g., different prices for size/color). | SF-PD-05 | Variants have independent price/stock | Unit + manual tests |
| P2-002 | **Reviews and ratings workflow** | Allow customers to submit reviews; admin moderation; average rating updates. | DM-17 | Reviews appear after moderation | Manual test |
| P2-003 | **Coupon/discount system** | Add coupon codes and automatic discounts in checkout. | SF-CHK | Discount applied correctly in totals | Unit tests |
| P2-004 | **Real payment gateway integration** | Integrate a payment provider or bank gateway when available, replacing card-to-card. | P0-004 | Payments processed through gateway | Integration test |
| P2-005 | **Shipping carrier integration** | Integrate with a shipping provider for live rates and tracking. | SF-CHK, P0-004 | Shipping rates fetched live; tracking numbers returned | Integration test |
| P2-006 | **Email/SMS notifications** | Send order confirmation, shipping, and password-reset emails. | P0-004, P1-007 | Emails sent for triggered events | Integration test |
| P2-007 | **Customer account dashboard** | Allow logged-in customers to view order history, manage addresses, and edit profile. | Customer auth backend | Customer dashboard shows order history | Manual test |
| P2-008 | **Analytics dashboard** | Add charts/trends for sales, visitors, and top products. | Backend analytics data | Dashboard renders charts | Manual test |
| P2-009 | **SEO server-side rendering or prerendering** | Implement SSR/SSG for product pages to improve SEO and social sharing. | Backend or static generation | Meta tags render server-side | SEO audit |
| P2-010 | **E2E test suite** | Add Playwright or Cypress tests covering storefront and admin critical paths. | Stable feature set | E2E tests pass in CI | CI pipeline |
| P2-011 | **PWA support** | Add service worker, manifest, and offline cache for core assets. | — | Lighthouse PWA score ≥ 90 | Lighthouse |
| P2-012 | **Multi-currency display** | Support additional currencies beyond USD/IRR with configurable rates. | Currency backend | Additional currencies selectable | Manual test |

---

## Dependencies & Sequencing

```
P0-004 (Backend persistence)
  ├─ enables P0-003, P0-006, P1-007, P2-004, P2-005, P2-006
  └─ recommended before production

P0-001 (Canonical Rial price)
  ├─ blocks P1-001, P1-005 (sort/filter by price)
  └─ should be decided before adding more price-dependent features

P0-005 (Bilingual product fields)
  ├─ impacts P1-012 (translations)
  └─ should precede major storefront SEO work

P0-007 (Unified media storage)
  └─ enables P1-008 (Media Library picker)

P1-003 (Error boundary)
  └─ low dependency; can be done early

P1-011 (Accessibility)
  └─ should be done before public launch
```

---

## Verification Methods Summary

| Method | Command/Action | Applies To |
|--------|----------------|------------|
| Type check & production build | `npm run build` | All code changes |
| Lint | `npm run lint` | All code changes |
| Unit tests | `npm test` | Service/store changes |
| Manual browser test | `npm run dev` | UI/UX changes |
| Security audit | Manual/code review | Auth, checkout, data handling |
| Performance test | Large dataset + DevTools | Pagination, product lists |
| Accessibility scan | axe-core / Lighthouse | UI components |
| E2E tests | Playwright/Cypress (future) | Critical user journeys |

---

## Recommended First Sprint

1. **P0-001** — Resolve canonical price currency (decision + migration).
2. **P0-005** — Add bilingual product fields.
3. **P0-008** — Add product timestamps.
4. **P1-003** — Add global error boundary.
5. **P1-012** — Complete translation coverage.

These five items remove the highest-risk conflicts between the brief and the current implementation while improving stability and maintainability.
