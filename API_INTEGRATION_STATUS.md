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
| `/api/logout` | POST | ✅ Live | `/api/logout` | `AuthContext.logout()` calls this (fire-and-forget) alongside the existing client-side cookie/localStorage clear. Covers both the sidebar "Logout" link and the inline "Log out" button. |
| `/api/register` | POST | 🔁 Mapped | `/api/auth/register` | Already live — wired into `RegisterForm.tsx`. **Gap closed 2026-07-15:** the fake "I'm not a robot" checkbox is replaced with the real `Recaptcha` widget (`components/ui/Recaptcha.tsx`), and the route now calls `verifyRecaptcha()` when `isRecaptchaConfigured()` — same opt-in reCAPTCHA pattern as checkout, reusing the same infrastructure rather than duplicating it. |
| `/api/refresh` | POST | ✅ Live | `/api/refresh` | `AuthContext.tsx` runs a 10-minute interval (`REFRESH_INTERVAL_MS`) calling `refreshAccessToken()` and rotating the access token in place. Confirmed live: login response really does include a `refreshToken` (SimpleJWT `refresh` field). |
| `/api/auth/forgot-password` | POST | 🔁 Mapped | `/api/auth/lost-password` | Already live — wired into `LostPasswordForm.tsx`. Same feature (send reset email), different name. |
| `/api/reset-password` | POST | ✅ Live | `/api/reset-password` | New page at `my-account/reset-password/` reads `token`/`uidb64` from the query string and submits here. Verified responsive + dark mode in both the form and invalid-link states; not yet exercised with a real emailed reset link end-to-end. |
| `/api/auth/change-password` | PUT | ✅ Live | `/api/auth/change-password` | Split into its own `ChangePasswordForm.tsx` (separate section on the `edit-account` page, below `AccountDetailsForm.tsx`). Distinct from account-details — dedicated old/new password only. |
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
| `/api/orders/checkout` | POST | ⛔ Blocked (wired, awaiting credentials) | Calls `checkoutOrder()`. Wired into `CheckoutClient.tsx`'s `handlePlaceOrder()` — builds a `CheckoutPayload` from the address forms + cart + Braintree transaction id after a successful charge. `types/order.ts`'s `CheckoutPayload`/`Order` response shape is still **unconfirmed against the real backend** — no reference doc exists for this endpoint (unlike Order History/Reviews), so treat the contract as a well-reasoned guess until tested live. |
| `/api/orders/get-total` | POST | ✅ Live | Calls `getOrderTotal()`. Wired into `CheckoutClient.tsx` via a debounced (600ms) effect keyed on cart items + shipping ZIP/country. **Verified live** by calling the real backend directly with a real product: response is `{sub_total, total_tax, total_shipping, total_price, items_count, message}` — corrected `OrderTotal` in `types/order.ts` to match (was previously a guessed `{subtotal, shipping, tax, total}` shape). Tax is genuinely computed from the shipping location, not a flat rate — confirmed 10.5% for a 90210/US test vs. the client-side fallback's flat 8.875%. Also confirmed live in the UI: entering a ZIP updates the displayed Sales Tax in real time. |
| `/api/auth/orders` | GET | ✅ Live, wired into `my-account/orders` | Calls `listUserOrders()`. No pagination (confirmed via `ORDER_HISTORY_ANSWER.md`). Response wrapper handled defensively (bare array or `{orders:[]}` — our own test hit confirmed the latter). Field names (`order_number`, `status`, `total_price`, `items[].product_id/quantity/price`) confirmed via the same doc. Verified live for the empty case; **populated-list shape still unconfirmed** — no order exists yet to test against (needs real checkout, which doesn't exist yet either). |
| `/api/products/by-ids` *(not in original plan)* | GET | ✅ Live | New endpoint + `getProductsByIds()` (`services/search.service.ts`) — order items only carry `product_id`/`quantity`/`price`, so this does an ES `terms` lookup on the `product_id` field (present on our documents alongside `objectID`/`handle`) to enrich order history with title/image/handle for display and "Buy Again". |
| `/api/braintree_token` | GET | ⛔ Blocked (wired, awaiting credentials) | Calls `getBraintreeClientToken()`. Wired into `BraintreeDropIn.tsx`, which fetches this on mount and mounts the real `braintree-web-drop-in` UI on success. **Missing `BRAINTREE_MERCHANT_ID` / `BRAINTREE_PUBLIC_KEY` / `BRAINTREE_PRIVATE_KEY` in `.env.local`** (placeholders added) — until set, this 500s with a clear "Braintree is not configured" message, which the component renders as an inline notice instead of breaking the page. Confirmed live in light/dark, desktop/mobile. |
| `/api/braintree_checkout` | POST | ⛔ Blocked (wired, awaiting credentials) | Calls `chargeBraintreeCheckout()`. Wired into `handlePlaceOrder()` — requests a nonce from the Drop-in instance, then POSTs it here with the computed total. reCAPTCHA is now **optional by design**: `verifyRecaptcha()` only runs when `isRecaptchaConfigured()` is true (i.e. `RECAPTCHA_SECRET_KEY` is set); with it blank, the check is skipped entirely rather than failing closed. |
| `https://api.zippopotam.us/us/{zip}` | GET | ✅ Live | External public API, called directly from the browser via `lib/zippopotam.ts`'s `lookupZip()` — no backend proxy, per the plan. Wired into `CheckoutClient.tsx`'s address ZIP field `onBlur`. Verified live: `90210` → Beverly Hills, CA. |

**reCAPTCHA is opt-in, not a blocker.** `lib/recaptcha.ts` gained `isRecaptchaConfigured()`; both the server check (`/api/braintree_checkout`) and the client widget (`Recaptcha.tsx`, only rendered by `CheckoutClient.tsx` when `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set) key off the presence of their respective env vars. Both are blank placeholders today — fill in both together to turn reCAPTCHA on, no code changes needed either way.

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

Placeholders already added to `.env.local` — just needs real values:
```
BRAINTREE_ENVIRONMENT=sandbox   # or "production"
BRAINTREE_MERCHANT_ID=
BRAINTREE_PUBLIC_KEY=
BRAINTREE_PRIVATE_KEY=

# Optional — leave blank to skip reCAPTCHA entirely (server and client both
# check for these before doing anything reCAPTCHA-related)
RECAPTCHA_SECRET_KEY=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
```

Once the three `BRAINTREE_*` values are set, checkout should work end-to-end without further code changes — but run one real sandbox transaction through it before trusting that, since `CheckoutPayload`'s contract with `/api/orders/checkout` is still unverified (see the Orders table above).

## Suggested integration order

1. ~~**Cart**~~ (`/api/cart/*`) — done, verified live.
2. ~~**Orders / checkout**~~ — built and wired (Braintree Drop-in, order creation on success, real backend-computed totals via `get-total`). One blocker left: real Braintree credentials.
3. ~~**Auth extras**~~ (refresh, reset-password, change-password) — done, verified live.
4. ~~**Reviews (OSS backend)**~~ — write/edit path built and verified live (Order-History-gated entry point only). PDP display (`CustomerReviews.tsx`) still reads from WordPress and stays that way until the OSS table has enough approved reviews to be worth switching to.
5. **Newsletter** — lowest priority, no dependent UI exists yet.
