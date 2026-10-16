# VYRO Acceptance Criteria

> **Purpose:** Measurable, testable acceptance criteria for VYRO. Each criterion has a unique ID and maps to requirements in `PRD.md` and `FEATURE_MATRIX.md`. Criteria use **Given/When/Then** format where applicable.

---

## 1. Language & Text Direction

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-LANG-01 | **Given** a fresh browser session, **when** the application loads, **then** the `html` element has `lang="fa"` and `dir="rtl"`. | P0 |
| AC-LANG-02 | **Given** the user is on any page, **when** they switch language to English, **then** the `html` element changes to `lang="en"` and `dir="ltr"` within one render cycle. | P0 |
| AC-LANG-03 | **Given** the user switches to Persian, **when** they navigate to a product page, **then** all UI chrome text (header, footer, buttons) renders in Persian. | P0 |
| AC-LANG-04 | **Given** the user switches to English, **when** they navigate to a product page, **then** all UI chrome text renders in English. | P0 |
| AC-LANG-05 | **Given** the user changes language, **when** the page refreshes, **then** the selected language and direction are restored from `localStorage`. | P0 |
| AC-LANG-06 | **Given** the user changes language, **when** they view the cart, **then** product IDs, images, quantities, and wishlist state remain unchanged. | P0 |

---

## 2. Currency Conversion & Formatting

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-CURR-01 | **Given** a product with `priceUSD = 10`, **when** the exchange rate is `230000` Toman/USD, **then** the Persian price displays as `۲,۳۰۰,۰۰۰ ریال`. | P0 |
| AC-CURR-02 | **Given** a product with `priceUSD = 10`, **when** the language is English, **then** the price displays as `$10`. | P0 |
| AC-CURR-03 | **Given** the admin changes the exchange rate, **when** a customer views a product in Persian, **then** the displayed Rial price updates without changing the stored `priceUSD`. | P0 |
| AC-CURR-04 | **Given** a product has `oldPriceUSD = 100` and `priceUSD = 80`, **when** rendered in Persian, **then** the discount badge shows `-20%` and the old price is struck through in Rial. | P1 |
| AC-CURR-05 | **Given** the cart subtotal is `$80` in English, **when** the user switches to Persian, **then** the subtotal displays as the Rial equivalent and shipping remains free (threshold already met). | P0 |
| AC-CURR-06 | **Given** the exchange rate is set to a non-positive value, **when** formatting occurs, **then** the formatter returns a safe fallback (`نامعتبر` or `$0.00`) and does not throw. | P1 |
| AC-CURR-07 | **Given** the brief requirement, **when** the product data model is inspected, **then** the canonical price field must be in Rial (not USD). | P0 |

---

## 3. Product Discovery & Display

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-PROD-01 | **Given** the storefront, **when** the user visits `/shop`, **then** all active products are displayed. | P0 |
| AC-PROD-02 | **Given** a product with `status = 'draft'`, **when** the user visits `/shop`, **then** that product is not displayed. | P0 |
| AC-PROD-03 | **Given** the user visits `/hats`, **when** the page loads, **then** only products with `category = 'hat'` are shown. | P0 |
| AC-PROD-04 | **Given** the user visits `/glasses`, **when** the page loads, **then** only products with `category = 'glasses'` are shown. | P0 |
| AC-PROD-05 | **Given** a product card, **when** the user hovers, **then** the second image (if present) fades in. | P1 |
| AC-PROD-06 | **Given** a product with a broken image, **when** the card renders, **then** the fallback image (`/images/site/fallback.svg`) is shown. | P1 |
| AC-PROD-07 | **Given** the user clicks "Add to Cart" on a product card, **when** the action completes, **then** the cart item count increases by one and the cart drawer opens. | P0 |
| AC-PROD-08 | **Given** the user searches for "black", **when** results load, **then** products whose name, style, color, tag, or description contain "black" are shown. | P0 |
| AC-PROD-09 | **Given** the user searches for a non-existent term, **when** results load, **then** an empty state message is displayed. | P0 |
| AC-PROD-10 | **Given** the user visits a product detail page, **when** the page loads, **then** the product gallery, price, color selector, quantity selector, and CTAs are visible. | P0 |
| AC-PROD-11 | **Given** the user changes the selected color, **when** they add to cart, **then** the cart item reflects the selected color. | P0 |
| AC-PROD-12 | **Given** a product detail page, **when** the user scrolls to related products, **then** at least one related product in the same category or style is shown (if available). | P1 |

---

## 4. Cart & Checkout

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-CART-01 | **Given** an empty cart, **when** the user adds a product, **then** the cart contains one item with quantity 1. | P0 |
| AC-CART-02 | **Given** a cart containing a product with quantity 1, **when** the user adds the same product/color/size again, **then** the quantity becomes 2 and no duplicate line is created. | P0 |
| AC-CART-03 | **Given** a cart with items, **when** the user updates quantity to 0, **then** the item is removed. | P0 |
| AC-CART-04 | **Given** a cart subtotal below $75, **when** totals are calculated, **then** shipping is $6 (or Rial equivalent). | P0 |
| AC-CART-05 | **Given** a cart subtotal of $75 or more, **when** totals are calculated, **then** shipping is free. | P0 |
| AC-CART-06 | **Given** the user refreshes the page, **when** the cart loads, **then** previously added items are restored. | P0 |
| AC-CHK-01 | **Given** an empty cart, **when** the user navigates to `/checkout`, **then** an empty-cart message is shown. | P0 |
| AC-CHK-02 | **Given** a cart with items but no shop card configured, **when** the user views checkout, **then** card-to-card payment is disabled and a notice is displayed. | P0 |
| AC-CHK-03 | **Given** a cart with items and a configured shop card, **when** the user views checkout, **then** the card number, holder, and amount to transfer are displayed. | P0 |
| AC-CHK-04 | **Given** the checkout form, **when** the user submits without required fields, **then** inline validation errors appear and the order is not placed. | P0 |
| AC-CHK-05 | **Given** a valid checkout form, **when** the user submits without a receipt, **then** a receipt-required error appears and the order is not placed. | P0 |
| AC-CHK-06 | **Given** a valid checkout form and uploaded receipt, **when** the user submits, **then** an order is created with status `awaiting-approval` and stock is decremented. | P0 |
| AC-CHK-07 | **Given** a placed order, **when** the user clicks "View Invoice", **then** a printable invoice for that order ID is rendered. | P0 |
| AC-CHK-08 | **Given** a placed order in Persian, **when** the invoice renders, **then** the date is formatted with the Persian calendar (`fa-IR`). | P1 |

---

## 5. Wishlist & Recently Viewed

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-WL-01 | **Given** a product, **when** the user clicks the heart icon, **then** the product is added to the wishlist. | P0 |
| AC-WL-02 | **Given** a product in the wishlist, **when** the user clicks the heart icon again, **then** the product is removed. | P0 |
| AC-WL-03 | **Given** the user refreshes the page, **when** the wishlist loads, **then** previously saved items are restored. | P0 |
| AC-WL-04 | **Given** the wishlist page, **when** the user clicks "Move to Cart", **then** the item is added to the cart and removed from the wishlist. | P0 |
| AC-RV-01 | **Given** the user visits three different product pages, **when** they view recently viewed data, **then** the three product IDs are stored in reverse chronological order. | P1 |
| AC-RV-02 | **Given** 21 unique product views, **when** recently viewed data is inspected, **then** only the most recent 20 IDs are retained. | P1 |

---

## 6. Style Finder

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-SF-01 | **Given** the user starts the Style Finder, **when** they answer all questions, **then** up to 3 scored product recommendations are shown. | P1 |
| AC-SF-02 | **Given** the user selects a budget range, **when** results load, **then** all recommendations fall within that range. | P1 |
| AC-SF-03 | **Given** results are displayed, **when** the user clicks "Start Over", **then** the quiz resets to the first step. | P1 |
| AC-SF-04 | **Given** the user selects "glasses", **when** results load, **then** no hats are recommended (unless "both" is selected). | P1 |

---

## 7. Admin Product Management

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-ADMIN-PROD-01 | **Given** the admin is logged in, **when** they visit `/admin/products`, **then** the product list is displayed with filters and search. | P0 |
| AC-ADMIN-PROD-02 | **Given** the admin clicks "Add Product", **when** they fill all required fields and save, **then** a new product is created and appears in the list. | P0 |
| AC-ADMIN-PROD-03 | **Given** the admin creates a product with a duplicate slug, **when** they save, **then** an error is returned and the product is not created. | P0 |
| AC-ADMIN-PROD-04 | **Given** the admin edits a product price inline in Persian, **when** they enter Toman and save, **then** the USD canonical price is updated using the current exchange rate. | P0 |
| AC-ADMIN-PROD-05 | **Given** the admin edits a product, **when** they change the status to "draft", **then** the product is hidden from the storefront. | P0 |
| AC-ADMIN-PROD-06 | **Given** the admin deletes a product, **when** they confirm, **then** the product is removed from the product list but existing orders referencing it remain intact. | P0 |
| AC-ADMIN-PROD-07 | **Given** the admin uploads product images, **when** they set one as primary and reorder, **then** the stored `images` array reflects the new order and `primaryImage` is set. | P0 |
| AC-ADMIN-PROD-08 | **Given** the admin saves a product, **when** they open the storefront, **then** the product details are visible immediately (same browser). | P0 |

---

## 8. Admin Media Library

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-ADMIN-MEDIA-01 | **Given** the admin uploads a valid image, **when** the upload completes, **then** the image appears in the library with a preview. | P0 |
| AC-ADMIN-MEDIA-02 | **Given** the admin uploads a 6MB image, **when** they submit, **then** an error is shown and the image is not stored. | P0 |
| AC-ADMIN-MEDIA-03 | **Given** the admin uploads a non-image file, **when** they submit, **then** an error is shown and the file is rejected. | P0 |
| AC-ADMIN-MEDIA-04 | **Given** the admin edits image metadata, **when** they save, **then** the changes persist after refresh. | P0 |
| AC-ADMIN-MEDIA-05 | **Given** the admin replaces an image binary, **when** the operation completes, **then** all references display the new image without changing the ID. | P0 |
| AC-ADMIN-MEDIA-06 | **Given** the admin attempts to delete an image used on the homepage, **when** they confirm, **then** a warning listing usages is shown. | P1 |
| AC-ADMIN-MEDIA-07 | **Given** the total uploaded size exceeds 200MB, **when** the admin uploads another image, **then** the upload is rejected with a budget-exceeded message. | P1 |

---

## 9. Admin Order & Customer Management

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-ADMIN-ORD-01 | **Given** a new card-to-card order, **when** the admin views `/admin/orders`, **then** the order appears with status `awaiting-approval`. | P0 |
| AC-ADMIN-ORD-02 | **Given** an `awaiting-approval` order, **when** the admin confirms payment, **then** the status changes to `paid` and an activity log entry is created. | P0 |
| AC-ADMIN-ORD-03 | **Given** an `awaiting-approval` order, **when** the admin rejects payment, **then** the status changes to `cancelled` and stock is restored. | P0 |
| AC-ADMIN-ORD-04 | **Given** an order status change, **when** the activity log is viewed, **then** the change is recorded with previous and new status. | P0 |
| AC-ADMIN-CUST-01 | **Given** a new customer email at checkout, **when** the order is placed, **then** a customer record is created with `orderCount = 1` and `totalSpent = order.total`. | P0 |
| AC-ADMIN-CUST-02 | **Given** an existing customer places another order, **when** the order completes, **then** the customer's `orderCount` and `totalSpent` are incremented. | P0 |

---

## 10. Admin Settings & Homepage

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-ADMIN-SET-01 | **Given** the admin changes the default language in settings, **when** they save, **then** the application language updates and persists. | P0 |
| AC-ADMIN-SET-02 | **Given** the admin changes the exchange rate, **when** they save, **then** Persian prices across the app update immediately. | P0 |
| AC-ADMIN-SET-03 | **Given** the admin configures a card number with at least 13 digits, **when** they save, **then** checkout displays the card number and enables payment. | P0 |
| AC-ADMIN-HP-01 | **Given** the admin changes the hero title in homepage settings, **when** they save, **then** the homepage hero title reflects the change. | P1 |
| AC-ADMIN-HP-02 | **Given** the admin selects a hero image from suggested thumbnails, **when** they save, **then** the homepage hero background updates. | P1 |

---

## 11. Admin Access Control

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-ADMIN-AUTH-01 | **Given** an unauthenticated user, **when** they visit `/admin`, **then** they are redirected to `/admin/login`. | P0 |
| AC-ADMIN-AUTH-02 | **Given** the user enters correct demo credentials, **when** they submit, **then** they are authenticated and redirected to `/admin`. | P0 |
| AC-ADMIN-AUTH-03 | **Given** the user enters incorrect credentials, **when** they submit, **then** an error is shown and they remain unauthenticated. | P0 |
| AC-ADMIN-AUTH-04 | **Given** an authenticated admin, **when** they click logout, **then** the session is cleared and they are redirected to `/admin/login`. | P0 |
| AC-ADMIN-AUTH-05 | **Given** a production deployment requirement, **when** admin security is audited, **then** server-side authentication must be implemented (not yet verified). | P0 |

---

## 12. Responsive Layouts

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-RESP-01 | **Given** a viewport width of 375px, **when** the homepage loads, **then** the hero text, CTAs, and product grid are readable without horizontal scroll. | P0 |
| AC-RESP-02 | **Given** a viewport width of 768px, **when** the shop page loads, **then** the product grid shows 2–3 columns. | P0 |
| AC-RESP-03 | **Given** a viewport width of 1440px, **when** the shop page loads, **then** the product grid shows 4 columns. | P0 |
| AC-RESP-04 | **Given** a mobile viewport, **when** the user opens the menu, **then** the slide-out menu opens from the correct edge based on text direction. | P0 |
| AC-RESP-05 | **Given** a mobile viewport in Persian, **when** the user opens the menu, **then** the menu slides in from the right (RTL). | P0 |

---

## 13. Error & Empty States

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-ERR-01 | **Given** a lazy route is loading, **when** the user navigates, **then** a centered spinner is shown. | P0 |
| AC-ERR-02 | **Given** the user visits `/product/non-existent-slug`, **when** the page loads, **then** a "Product not found" message and back-to-shop CTA are shown. | P0 |
| AC-ERR-03 | **Given** the user searches for a term with no results, **when** results load, **then** a "No results" message is shown. | P0 |
| AC-ERR-04 | **Given** an empty cart, **when** the user visits `/cart`, **then** an empty-cart illustration/message and shop CTA are shown. | P0 |
| AC-ERR-05 | **Given** an image fails to load, **when** the error event fires, **then** the fallback SVG is displayed. | P0 |
| AC-ERR-06 | **Given** a runtime JavaScript error in a component, **when** it occurs, **then** a global error boundary displays a user-friendly message. | P1 |

---

## 14. Product Data Integrity

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-DATA-01 | **Given** a product exists, **when** the language is switched, **then** the product `id`, `images`, and `stock` remain unchanged. | P0 |
| AC-DATA-02 | **Given** an order is placed, **when** the product is later edited, **then** the order line item retains the original name, price, and image. | P0 |
| AC-DATA-03 | **Given** a product is deleted, **when** an existing order is viewed, **then** the order line item still shows the product name and price. | P0 |
| AC-DATA-04 | **Given** a product is created, **when** it is saved, **then** it has a non-empty `id`, `name`, `slug`, `priceUSD`, `category`, and at least one image. | P0 |
| AC-DATA-05 | **Given** the brief requirement, **when** the product model is validated, **then** the canonical price field is in Rial. | P0 |
| AC-DATA-06 | **Given** the brief requirement, **when** a product is created in Persian and English modes, **then** both language names and descriptions can be stored independently. | P1 |

---

## 15. Currency-Specific Edge Cases

| ID | Criterion | Priority |
|----|-----------|----------|
| AC-CURR-EDGE-01 | **Given** a product price of `0.01` USD, **when** converted to Rial at rate 230000, **then** the result is rounded to `2,300` Rial (no negative/zero due to rounding). | P1 |
| AC-CURR-EDGE-02 | **Given** a product price is `NaN` or negative, **when** formatted, **then** the formatter returns a safe fallback. | P1 |
| AC-CURR-EDGE-03 | **Given** the exchange rate is cleared from `localStorage`, **when** the app loads, **then** the default rate `230000` is used. | P0 |
| AC-CURR-EDGE-04 | **Given** a very large product price (e.g., 1,000,000 USD), **when** formatted in Persian, **then** the Rial value is displayed with proper Persian digit grouping. | P1 |
