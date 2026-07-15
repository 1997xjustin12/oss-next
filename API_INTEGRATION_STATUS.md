# API Integration Status

Tracks every endpoint from the backend integration plan: whether the local Next.js route + service exist, whether the frontend UI actually calls it yet, and what's blocking full integration. Update this file as each endpoint gets wired up — don't let it go stale.

**Status legend**
- ✅ **Live** — route + service exist and a real page/component calls it today.
- 🟡 **Built, not integrated** — route + service exist and work, but no UI calls it yet.
- 🆕 **Created, not integrated** — created in this pass as a scaffold; service has open TODOs (response shape unconfirmed against the real backend) and nothing calls it yet.
- ⛔ **Blocked** — scaffold exists but will fail at runtime until missing config (env vars, SDK credentials) is added.
- 🔁 **Mapped to existing route** — the plan's documented path already has a working equivalent under a different path; no duplicate file was created (see Notes).

---

## Auth

| Endpoint (per plan) | Method | Status | Actual route | Notes |
|---|---|---|---|---|
| `/api/login` | POST | 🔁 Mapped | `/api/auth/login` | Already live — wired into `LoginForm.tsx`. Sets `isLoggedIn` cookie. Didn't duplicate under `/api/login`. |
| `/api/logout` | POST | 🆕 Created | `/api/logout` | Clears the `isLoggedIn` cookie server-side. `AuthContext.logout()` currently does this client-side only (localStorage + cookie) — not yet calling this route. |
| `/api/register` | POST | 🔁 Mapped | `/api/auth/register` | Already live — wired into `RegisterForm.tsx`. **Gap:** plan says registration should verify reCAPTCHA first; current implementation doesn't yet (form has a reCAPTCHA UI placeholder only, see `RegisterForm.tsx`). |
| `/api/refresh` | POST | 🆕 Created | `/api/refresh` | Calls `refreshAccessToken()` → `POST {NEXT_OSS_BACKEND_URL}api/auth/token/refresh`. Response field name (`access` vs `token`) unconfirmed. Nothing calls this yet — no token-refresh flow exists in `AuthContext` today. |
| `/api/auth/forgot-password` | POST | 🔁 Mapped | `/api/auth/lost-password` | Already live — wired into `LostPasswordForm.tsx`. Same feature (send reset email), different name. |
| `/api/reset-password` | POST | 🆕 Created | `/api/reset-password` | Calls `resetPassword(token, uidb64, newPassword)`. This is the follow-up step after the emailed reset link — distinct from forgot/lost-password. No UI page consumes the token+uidb64 link yet. |
| `/api/auth/change-password` | PUT | 🆕 Created | `/api/auth/change-password` | Calls `changePassword()` with Bearer auth. Distinct from account-details (below) — dedicated old/new password only. Not called from any UI yet. |
| `/api/profile` | GET | 🔁 Mapped | `/api/auth/profile` | Already exists — used internally by `services/user.service.ts` (`getUserProfile`) to fetch the user after login/register, not called directly from a client component. |
| `/api/profile/update` | PUT | 🔁 Mapped | `/api/auth/account-details` (PATCH) | Already live — wired into `AccountDetailsForm.tsx`. Same feature (update name/email), different path + verb. |

## Cart

| Endpoint (per plan) | Method | Status | Actual route | Notes |
|---|---|---|---|---|
| `/api/auth/cart/active` | GET | ✅ **Verified against real backend** (2026-07-14) | `/api/cart/active` | `CartContext` fetches this once authenticated and merges the result in — server wins when it has items. Confirmed cross-device restore works: added an item in one browser context, logged in fresh (zero localStorage) in a second context, item correctly appeared. Returns 400 `{error:"No active cart found"}` when there's no cart yet — handled gracefully. |
| `/api/auth/cart/create` | POST | ✅ **Verified** | `/api/cart/create` | Confirmed real response is `{ cart_id, ...billing/shipping fields, items[] }` — **no `reference_number` field exists** (removed that assumption). Confirmed Bearer-token-only cart identity (no cart_id needed in the request). |
| `/api/auth/cart/update` | PUT | ✅ **Verified** | `/api/cart/update` | Confirmed response is `{ message, cart: {...} }`. Debounced 800ms so rapid qty clicks batch into one call. |
| `/api/auth/cart/close` | POST | ✅ **Verified** | `/api/cart/close` | Confirmed response `{ message, cart_id, status: "closed", closed_at }`. Fires whenever the cart reaches zero items and a `cartId` exists. Not yet reachable from an actual checkout-success event (see Orders section — no real checkout flow exists yet), only from manual item removal. |
| `/api/abandoned-carts/create` | POST | 🟡 Client trigger verified; backend notify blocked on test data | `/api/abandoned-carts/create` | `NEXT_UPSTASH_REDIS_REST_URL`/`_TOKEN` are now configured. Triggered a real "forced" notify (via an actual logout click, client-side nav so `CartContext` stays mounted) — Django rejected it with `400`, but the validation errors **confirm our payload contract is correct**: it wants exactly `abandoned_cart_id` + `billing_first_name/last_name/email/address/city/province/zip_code/country`, which is exactly what `buildAbandonedCartPayload()` + `userProfileToCart()` already send. It 400s only because **this test account's profile has blank address fields** — a test-data gap, not a code bug. Re-test once a test account with a real address is available, or once the account-address-edit flow is built. |

**Real backend item shape discovered (important):** cart items do **not** echo back the ES hit we send — Django reshapes everything into its own schema (`product_sku`/`product_title`/`unit_price`/`product_image_url`/`custom_fields`, integer `id`), discarding `objectID`/`title`/`sale_price`/`images`. **`product_sku` is the only stable identifier the backend gives back**, so items restored from the server are keyed by SKU instead of objectID (`context/cartSync.ts`'s `lineItemToCartItem`) — with a matching fallback added to the `ADD_ITEM` reducer (`CartContext.tsx`) so re-adding an already-in-cart product from a PDP/PLP increments the existing (SKU-keyed) line instead of creating a duplicate.

**`/api/cart/update` requires `product_id` per item** (confirmed via a real `400`: `{"items":[{"product_id":["This field is required."]}]}`) — `create` doesn't enforce it, but `cartItemsToLineItems()` (`lib/cart.ts`) now sends it on both for consistency. Retested after the fix: `update` returns `200`/`"Cart updated successfully"`.

## Orders / Checkout / Payments

| Endpoint (per plan) | Method | Status | Notes |
|---|---|---|---|
| `/api/orders/checkout` | POST | 🆕 Created | Calls `checkoutOrder()`. `types/order.ts` created for `CheckoutPayload`/`Order` — response shape unconfirmed. No checkout page wired yet. |
| `/api/orders/get-total` | POST | 🆕 Created | Calls `getOrderTotal()`. `OrderTotal` shape (subtotal/shipping/tax/total) is a guess pending backend confirmation. |
| `/api/auth/orders` | GET | ✅ Live, wired into `my-account/orders` | Calls `listUserOrders()`. No pagination (confirmed via `ORDER_HISTORY_ANSWER.md`). Response wrapper handled defensively (bare array or `{orders:[]}` — our own test hit confirmed the latter). Field names (`order_number`, `status`, `total_price`, `items[].product_id/quantity/price`) confirmed via the same doc. Verified live for the empty case; **populated-list shape still unconfirmed** — no order exists yet to test against (needs real checkout, which doesn't exist yet either). |
| `/api/products/by-ids` *(not in original plan)* | GET | ✅ Live | New endpoint + `getProductsByIds()` (`services/search.service.ts`) — order items only carry `product_id`/`quantity`/`price`, so this does an ES `terms` lookup on the `product_id` field (present on our documents alongside `objectID`/`handle`) to enrich order history with title/image/handle for display and "Buy Again". |
| `/api/braintree_token` | GET | ⛔ Blocked | Calls `getBraintreeClientToken()` (real `braintree` SDK, now installed). **Missing `BRAINTREE_MERCHANT_ID` / `BRAINTREE_PUBLIC_KEY` / `BRAINTREE_PRIVATE_KEY` in `.env.local`** — will throw a clear "Braintree is not configured" error until added. |
| `/api/braintree_checkout` | POST | ⛔ Blocked | Calls `chargeBraintreeCheckout()` after `verifyRecaptcha()` (`lib/recaptcha.ts`). **Missing both `BRAINTREE_*` credentials and `RECAPTCHA_SECRET_KEY`** — reCAPTCHA check will always fail closed until the secret is set. |
| `https://api.zippopotam.us/us/{zip}` | GET | N/A | External public API, not a backend endpoint — call directly from the frontend when the ZIP autofill feature is built (not yet present). |

## Reviews

| Endpoint (per plan) | Method | Status | Notes |
|---|---|---|---|
| `/api/reviews/list` | GET | ✅ Live | Calls `listProductReviews()` against `{NEXT_OSS_BACKEND_URL}api/reviews/list`. Wired into `OrdersList.tsx`'s duplicate-review-detection (`openReviewForm()`). **Verified live**, `200` with the confirmed `count/next/previous/results/summary` shape — but returns `count: 0` for a product this test account just successfully reviewed, tried site-wide/product-filtered/authenticated. Reviews are evidently moderated/pending-approval before they're publicly listed, so the edit-mode pre-fill can't be exercised until a review is approved server-side. |
| `/api/reviews/create` | POST | ✅ Live | Calls `createProductReview()`. Wired into `ReviewFormModal.tsx`, gated to delivered orders via `OrdersList.tsx` (see `API_TRIGGER_CHECKLIST.md`). **Verified live**: `200` with the full review object on first submit; a second submit for the same product/user correctly `400`s with the backend's real duplicate-review check (`non_field_errors: ["You have already reviewed this product."]`). Fixed a bug where that message wasn't surfacing — `review.service.ts` only checked `error`/`detail`, added `extractReviewError()` to also read `non_field_errors`. |
| `/api/reviews/update` | PUT | ✅ Live | Calls `updateProductReview()`. Upstream is `PUT .../reviews/{id}/update` — since this local route has no `[id]` segment, `id` is read from the JSON body instead. Wired into `ReviewFormModal.tsx`'s edit mode; not yet exercised live since the pending-approval behavior above means `openReviewForm()` hasn't yet found an existing review to edit against the real backend — code path shares the same request-building as the verified `create` call. |
| `/api/reviews` *(not in plan)* | GET | ✅ Live | Pre-existing, separate from the above — proxies WordPress's `custom/v1/reviews-by-variant` endpoint. This is the **currently active** review data source, wired into the PDP's Customer Reviews section (`CustomerReviews.tsx`) via `services/review.service.ts`'s `getReviewsByVariant()`. Once the OSS backend's reviews table above has real data, the PDP can switch over to `/api/reviews/list`. |

## Newsletter

| Endpoint (per plan) | Method | Status | Notes |
|---|---|---|---|
| `/api/subscribers/subscribe` | POST | 🆕 Created | Calls `subscribeToNewsletter()` (`services/subscriber.service.ts`). Client-side counterpart now exists too — `lib/newsletter.ts`'s `subscribeToNewsletter(email)` — for any future form to call directly. No signup form wired yet. |
| `/api/subscribers/unsubscribe` | POST | 🆕 Created | Calls `unsubscribeFromNewsletter()` (`services/subscriber.service.ts`). Client-side counterpart in `lib/newsletter.ts` too. No unsubscribe page wired yet. |

---

## What's needed before the ⛔ Blocked rows can work

Add to `.env.local`:
```
BRAINTREE_ENVIRONMENT=sandbox   # or "production"
BRAINTREE_MERCHANT_ID=
BRAINTREE_PUBLIC_KEY=
BRAINTREE_PRIVATE_KEY=
RECAPTCHA_SECRET_KEY=
```

## Suggested integration order

1. **Cart** (`/api/cart/*`) — routes already work, just needs `CartContext` switched from localStorage-only to also syncing with the backend.
2. **Orders / checkout** — needs Braintree credentials first (blocks the payment step), plus a real checkout page.
3. **Auth extras** (refresh, reset-password, change-password) — refresh matters most once sessions start expiring; the other two are self-serve account pages.
4. ~~**Reviews (OSS backend)**~~ — write/edit path built and verified live (Order-History-gated entry point only). PDP display (`CustomerReviews.tsx`) still reads from WordPress and stays that way until the OSS table has enough approved reviews to be worth switching to.
5. **Newsletter** — lowest priority, no dependent UI exists yet.
