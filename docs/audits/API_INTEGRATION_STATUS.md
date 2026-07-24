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
| `/api/profile/update` | PUT | ✅ **Verified against real backend** (2026-07-15) | `/api/auth/account-details` (PATCH) | **Correction**: previously marked "already live" here, but that was never actually true — `updateAccountDetails()` called a fictional `api/auth/account-details/` URL that 404s in every form. The real contract (confirmed via user-supplied `MY_ACCOUNT_PROFILE.md`, extracted from the original WordPress app, then live-verified): `PUT` (not `PATCH`) to the *same* `api/auth/profile` URL the working GET already uses, full-object replace (every profile field resent every time). Fixed; `AccountDetailsForm.tsx` and the new `edit-address` page (see below) each resend the fields the other owns so neither wipes the other's data. Verified live end-to-end: name-only save, address-only save, re-fetch, restore — all correct. |
| `/api/auth/edit-address` (net-new page, not a plan endpoint) | PUT | ✅ **Verified** | `/api/auth/account-details` (same route as above) | `my-account/edit-address` was a static "not set up yet" stub — rebuilt as a real billing + shipping + phone form on the same fixed profile endpoint. `AccountSidebar.tsx`'s `downloads`/`payment-methods` links removed (no backend behind either); the page files themselves are left as unlinked stubs. |

## Cart

| Endpoint (per plan) | Method | Status | Actual route | Notes |
|---|---|---|---|---|
| `/api/auth/cart/active` | GET | ✅ **Verified against real backend** (2026-07-14) | `/api/cart/active` | `CartContext` fetches this once authenticated and merges the result in — server wins when it has items. Confirmed cross-device restore works: added an item in one browser context, logged in fresh (zero localStorage) in a second context, item correctly appeared. Returns 400 `{error:"No active cart found"}` when there's no cart yet — handled gracefully. |
| `/api/auth/cart/create` | POST | ✅ **Verified** | `/api/cart/create` | Confirmed real response is `{ cart_id, ...billing/shipping fields, items[] }` — **no `reference_number` field exists** (removed that assumption). Confirmed Bearer-token-only cart identity (no cart_id needed in the request). |
| `/api/auth/cart/update` | PUT | ✅ **Verified** | `/api/cart/update` | Confirmed response is `{ message, cart: {...} }`. Debounced 800ms so rapid qty clicks batch into one call. |
| `/api/auth/cart/close` | POST | ✅ **Verified** | `/api/cart/close` | Confirmed response `{ message, cart_id, status: "closed", closed_at }`. Fires whenever the cart reaches zero items and a `cartId` exists. Not yet reachable from an actual checkout-success event (see Orders section — no real checkout flow exists yet), only from manual item removal. |
| `/api/abandoned-carts/create` | POST | 🟡 Logged-in: unblocked now that `edit-address` exists; Guest: structurally blocked | `/api/abandoned-carts/create` | `NEXT_UPSTASH_REDIS_REST_URL`/`_TOKEN` are now configured. Triggered a real "forced" notify (via an actual logout click, client-side nav so `CartContext` stays mounted) — Django rejected it with `400`, but the validation errors **confirm our payload contract is correct**: it wants exactly `abandoned_cart_id` + `billing_first_name/last_name/email/address/city/province/zip_code/country`, which is exactly what `buildAbandonedCartPayload()` + `userProfileToCart()` already send. It 400s only because **this test account's profile has blank address fields** — now that the real `edit-address` page exists (see Auth section), a logged-in user can actually fill those in, which should unblock this for real. Not yet re-tested with a fully-filled-in address.<br><br>**New finding, 2026-07-15 — guest carts remain structurally blocked, not just data-blocked.** Built `components/layout/GuestCartCapture.tsx` (exit-intent on desktop, tab-backgrounded on mobile, ~15s dwell-time armed, capped via `lib/guestCapture.ts` so it shows at most once and never re-prompts a captured/dismissed guest) to capture a guest's email into `localStorage['oss-guest-email']`, and gated `notifyAbandonedCart`/`sendAbandonedCartBeacon` (`context/cartSync.ts`) on its presence — mirrors the reference app's own early-exit ("no billing email yet" skips), per `ABANDONED_CART_EXPLAINER.md` §3. **Live-tested the actual POST this produces against the real backend once email is captured: still a real `400`.** Raw Django response: `abandoned_cart_id` required, plus all `billing_first_name/last_name/address/city/province/zip_code/country` required — email alone was never going to be enough. Two compounding gaps, not one: (1) guests never get a `cart_id` at all (`/api/cart/*` is logged-in-only, confirmed elsewhere in this doc) so `abandoned_cart_id` is always empty for a guest notify regardless of email; (2) a guest, by design, only has an email — asking for full billing address in the same low-friction capture modal would defeat the point of it. **Net effect: the email-capture gate is real and working (client-side), but a guest abandoned-cart notify cannot currently succeed end-to-end against this backend no matter what the modal captures.** Fixing this for real needs a backend-side decision: either let guest notifies through with just an email (relax the required-fields validation for carts with no `abandoned_cart_id`), or extend guest carts to mint a `cart_id` the same way logged-in ones do. Neither is fixable from this Next.js app alone. |

**Real backend item shape discovered (important):** cart items do **not** echo back the ES hit we send — Django reshapes everything into its own schema (`product_sku`/`product_title`/`unit_price`/`product_image_url`/`custom_fields`, integer `id`), discarding `objectID`/`title`/`sale_price`/`images`. **`product_sku` is the only stable identifier the backend gives back**, so items restored from the server are keyed by SKU instead of objectID (`context/cartSync.ts`'s `lineItemToCartItem`) — with a matching fallback added to the `ADD_ITEM` reducer (`CartContext.tsx`) so re-adding an already-in-cart product from a PDP/PLP increments the existing (SKU-keyed) line instead of creating a duplicate.

**`/api/cart/update` requires `product_id` per item** (confirmed via a real `400`: `{"items":[{"product_id":["This field is required."]}]}`) — `create` doesn't enforce it, but `cartItemsToLineItems()` (`lib/cart.ts`) now sends it on both for consistency. Retested after the fix: `update` returns `200`/`"Cart updated successfully"`.

## Orders / Checkout / Payments

| Endpoint (per plan) | Method | Status | Notes |
|---|---|---|---|
| `/api/orders/checkout` | POST | ⛔ **Blocked on a real backend bug, not just credentials** | Calls `checkoutOrder()`. Wired into `CheckoutClient.tsx`'s `handlePlaceOrder()`. **Tested live 2026-07-15** (bypassing payment, with the test account's real cart) — our request payload is fine, but the Django endpoint itself 500s: `ValueError: Currency formatting is not possible using the 'C' locale.`, raised in `app.orders.views.PlaceOrderView.perform_create` (`app/orders/views.py` line 89: `locale.currency(float(item.total), grouping=True)`) — the server's OS locale isn't configured, so Python's `locale.currency()` always fails. **The order is saved before the crash** — confirmed real order records were created despite the 500, so a real customer would see a broken checkout even though their order (and charge, once Braintree is live) actually went through. This needs a backend code fix (call `locale.setlocale()` at startup, or better, stop using `locale.currency()` and format the amount manually) — nothing on our side can work around it. Separately confirmed: setting `payment_method: "braintree"` in the request does **not** by itself set order `status` to `"paid"` — that's controlled by something else server-side.<br><br>**Update 2026-07-24 (B2):** the checkout payload now also sends `status: "paid"` (`CheckoutPayload.status`, set in `handlePlaceOrder()`). This path only runs after a successful Braintree charge, so an order created here is paid on arrival; every later status is backend-managed. This is the frontend expressing intent — the backend should honor it, but must confirm the `transaction_id` against Braintree before treating money as received rather than trusting a browser-supplied status (the order POST is client-made, so a blindly-trusted `status` would let a forged request create a free paid order — same class as the client-amount hole fixed in `/api/braintree_checkout`). Whether Django currently reads this field is unverified — the endpoint still 500s on the locale bug above, so no order-create has succeeded to test it against. |
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
| `/api/reviews` *(not in plan)* | GET | 🟡 Built, not integrated | Pre-existing WordPress proxy (`custom/v1/reviews-by-variant`) via `services/review.service.ts`'s `getReviewsByVariant()`. **Swapped out of the PDP 2026-07-15** in favor of the OSS-backed carousel below — `CustomerReviews.tsx` (the component that called this) is commented out in `ProductDetail.tsx`, not deleted, so it's a one-line revert if needed. |
| `/api/reviews/list` *(homepage display)* | GET | ✅ Live, side-by-side for comparison | New `ReviewsSectionLive.tsx` (`app/(market)/(home)/_components/`) — same carousel look as the existing hardcoded `ReviewsSection.tsx`, but fetches the real, site-wide review feed (`GET /api/reviews/list`, no `product_id`, per `REVIEWS_FLOW.md`). Rendered directly below the static one on the homepage for comparison, not a replacement yet — both are live in `(home)/page.tsx`. Differences from the static version: initials avatar instead of a photo (OSS reviews carry none), no Google badge (these aren't Google reviews), and a "on {product.title}" line since this is the site-wide feed. **Bug found and fixed**: our own `/api/reviews/list` route + `listProductReviews()` required `product_id` and 400'd when it was omitted — both were only ever built for their first two consumers (Order History dup-check, PDP carousel), which always pass one, so the optional/site-wide case documented in `REVIEWS_FLOW.md` had never actually been implemented. Made `productId` optional in both; confirmed live against the real backend that omitting it genuinely returns a site-wide feed (`count: 2`, the real reviews the user added via backend admin). Verified live end-to-end in the browser — both real reviews now render correctly. |
| `/api/reviews/list` *(PDP display)* | GET | ✅ Live | New `ReviewsCarousel.tsx` (`app/(market)/product/[slug]/_components/`) — same carousel structure as the homepage's `ReviewsSection.tsx` (auto-advance, snap-scroll, prev/next + dots), but fetches `GET /api/reviews/list?product_id=X` instead of hardcoded data. Now the active PDP reviews section. Verified live in the real browser: renders the correct empty state ("No reviews yet for this product") since the OSS table has no approved reviews yet — no console errors. Will need a second look once real approved reviews exist, to confirm the populated-carousel layout (avatars are initials-based since OSS reviews carry no photo, unlike the WordPress source). |

> **⚠️ SUPERSEDED 2026-07-21 — read this first.** The paragraph below is kept for history
> but is no longer accurate. The backend now indexes `ratings` as an object,
> `{ "rating": 4, "review_count": 3 }`, instead of a bare number, so a real review count
> reaches the PLP and PDP. The hardcoded `reviews: 0` is gone, the PDP shows
> "4.0 · 3 Reviews", and `Product` JSON-LD emits `aggregateRating` (which was previously
> impossible for exactly the reason given below — no `reviewCount`). Verified live:
> ES → `/api/search` → PLP/PDP all carry the object. Read it via `normaliseRating()`
> (`lib/ratings.ts`), never directly — the raw shape change crashed every PDP with
> `TypeError: rating.toFixed is not a function` until that helper landed. The ES `ratings`
> field is still populated at index time, so the "backend job syncs an aggregate" option
> described below is what actually happened.

**PLP ratings/reviews are NOT connected to this reviews system at all (confirmed 2026-07-15, not a caching issue).** The real PLP (`InstantSearchSection.tsx`, backed by `/api/search`) renders each card's rating as `hit.ratings ?? 0` — a static field baked into the Elasticsearch product document at index time, with zero live connection to `/api/reviews/list` or the OSS backend's reviews table. Review count is hardcoded to `0` on every card, full stop. Adding a review via the backend admin will never surface on PLP cards — there's no stale cache to bust, because the PLP never queries review data live at all. (Also found `ProductCard.tsx`/`services/product.service.ts`, a second, WordPress-sourced rating implementation — confirmed dead code, not imported/rendered anywhere, not the cause of anything.) User's call: leave as-is for now. If revisited later, the options are a live per-card `/api/reviews/list` lookup (simple, but a real per-card request cost on a list page) or a backend-side job that syncs a real rating aggregate into the ES `ratings` field.

## Converted WordPress Pages (Django pages API)

Added 2026-07-21. Replaces the live-scrape iframe proxy, which is deleted.

| Endpoint | Method | Status | Actual route | Notes |
|---|---|---|---|---|
| `/api/pages/detail/<path>/` | GET | ✅ **Verified against real backend** (2026-07-21) | `app/(market)/[...slug]/page.tsx` via `services/wp-pages.service.ts` | Key-protected (`NEXT_OSS_BACKEND_KEY`, server-side only). Returns `html`, `css`, `global_css`, `body_classes`, `seo_*`/`og_*`, `canonical_url`. Rendered inline and indexable, not iframed. **Confirmed the converted markup contains no WordPress header/footer** (homepage, `privacy-policy`, nested gallery page), so the `(market)` layout supplies the only chrome. Theme CSS is scoped to a `.wp-content` wrapper — unscoped it repaints the app's own Navbar/Footer, since it styles bare `a`/`span`/`div` with `!important`. Cached with `'use cache'` + `cacheLife('minutes')` + `CACHE_TAGS.PAGES`, so Django can bust just this via `POST /api/revalidate {"tag":"pages"}`. |

**Backend bug found — malformed CSS.** The API's CSS minifier strips `/* */` delimiters
but keeps the comment text, and emits unbalanced braces. `postcss.parse` throws on it;
we now use `postcss-safe-parser`, which recovers the way a browser does. Browsers on the
live WordPress site silently discard every rule after the error point, so this is losing
real styling in production today. Needs a Django-side fix.

## Newsletter

| Endpoint (per plan) | Method | Status | Notes |
|---|---|---|---|
| `/api/subscribers/subscribe` | POST | 🟡 Wired, not verified | Calls `subscribeToNewsletter()` (`services/subscriber.service.ts`). **Now wired to real UI (2026-07-24):** `/my-account/newsletter` (`NewsletterPanel.tsx`, in the account nav) calls `lib/newsletter.ts`'s `subscribeToNewsletter(email)`. Response shape still unconfirmed against the real backend (subscribing a real email has a real side effect, so not test-fired). |
| `/api/subscribers/unsubscribe` | POST | 🟡 Wired, not verified | Calls `unsubscribeFromNewsletter()`. Wired into the same `/my-account/newsletter` panel's Unsubscribe action. Unconfirmed against the real backend for the same reason. |
| Logged-in status via `is_subscribed` | GET | ✅ **Authoritative** (via `/api/auth/profile`) | **Correction (2026-07-24):** a status read *does* exist for logged-in users — the profile's `is_subscribed` boolean. Our `normalizeUser` was dropping it; now mapped to `User.isSubscribed`, and `NewsletterPanel.tsx` reads it and writes it back through the auth context after a toggle. Confirmed a real backend field per the reference app's end-to-end trace; not re-verified against a live authenticated fetch here (no test login). |
| Guest status by email *(does not exist)* | GET | 🟡 Gap, not currently needed | There is still no way to read an **arbitrary email's** subscription status — the subscriber routes are write-only, and `is_subscribed` only exists on an authenticated profile. The account page doesn't need this; a future public/guest newsletter widget would (e.g. `GET /api/subscribers/status?email=`). |

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
4. ~~**Reviews (OSS backend)**~~ — write/edit path built and verified live (Order-History-gated entry point only). PDP display now tries the OSS-backed `ReviewsCarousel.tsx` (2026-07-15) instead of WordPress's `CustomerReviews.tsx` — the latter is commented out in `ProductDetail.tsx`, not deleted, in case it needs to come back before the OSS table has enough approved reviews.
5. **Newsletter** — lowest priority, no dependent UI exists yet.
