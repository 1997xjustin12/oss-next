# Backend API Usage & Trigger Checklist

Companion to `API_INTEGRATION_STATUS.md` (which tracks endpoint/route status). This file tracks the other half: for each user action that should trigger an API call, does the page/component exist, and is it actually wired up? Audited against the real app state — not a fresh template. Update as each row gets built/wired.

**Status legend**
- ✅ **Done** — page/component exists and calls the (or an equivalent) endpoint.
- 🟡 **Partial** — page/component exists, but isn't wired to this call yet (or is wired to the wrong thing).
- ❌ **Not built** — no page/component exists for this trigger at all.

---

## Auth

- [x] ✅ **Login page/form** — submit → `POST /api/login`
  `LoginForm.tsx` (`my-account/_components/auth/`) exists and submits to `/api/auth/login` (mapped equivalent, see other tracker).
- [x] ✅ **Logout control** (nav/account menu) — click → `POST /api/logout`
  `AuthContext.logout()` now also fires `POST /api/logout` (fire-and-forget) alongside the existing client-side cookie/localStorage clear. Covers both the sidebar "Logout" link (`my-account/logout` → `LogoutHandler.tsx`) and the inline "Log out" button in `AccountView.tsx`, since both call the same context function.
- [x] ✅ **Register page/form** — submit → `POST /api/register`
  `RegisterForm.tsx` exists and submits to `/api/auth/register` (mapped). **Known gap:** reCAPTCHA is a UI placeholder only, not verified server-side yet.
- [x] ✅ **Background token refresh** (~10 min interval + app init) → `POST /api/refresh`
  `AuthContext.tsx` now runs a 10-minute interval that calls `/api/refresh` with the stored `refreshToken` and rotates the access token in place. Requires the backend's login/register response to actually include a `refresh` field (SimpleJWT convention) — `normalizeSession()` now captures it if present, but this hasn't been exercised against a real response yet.
- [x] ✅ **Forgot Password form** — submit → `POST /api/auth/forgot-password`
  `LostPasswordForm.tsx` (`my-account/lost-password/page.tsx`) exists and submits to `/api/auth/lost-password` (mapped, same feature, different name).
- [x] ✅ **Reset Password page** (token+uidb64 in URL) — submit → `POST /api/reset-password`
  New page at `my-account/reset-password` (Server Component page + Client Component form, per the app's page/`_components` split convention). Reads `token`/`uidb64` from the query string via `useSearchParams()`; shows an "invalid or expired link" state if either is missing. Verified responsive + dark mode in both the form and invalid-link states.
  Not built. No page exists to land on from the reset-password email link.
- [x] ✅ **Account > Change Password form** — submit → `PUT /api/auth/change-password`
  Split out into its own `ChangePasswordForm.tsx`, rendered as a separate section below `AccountDetailsForm.tsx` on the same `edit-account` page (not a new route — no sidebar nav slot exists for one). `AccountDetailsForm`/`AccountDetailsPayload` had `currentPassword`/`newPassword` removed since that's no longer their concern.
- [x] ✅ **Auth check on app load** → `GET /api/profile`
  `AuthContext` now optimistically restores the stored session, then verifies it against `/api/auth/profile` (mapped) in the background — if the backend rejects the token, the session is cleared. Network errors (vs. an explicit rejection) intentionally leave the optimistic session in place rather than logging the user out.
- [x] ✅ **Account > Profile edit form** — submit → `PUT /api/profile/update`
  Same `AccountDetailsForm.tsx` as above — submits to `/api/auth/account-details` (mapped, `PATCH` not `PUT`).

## Cart

- [x] ✅ **Cart page/drawer, load** (logged-in user) → `GET /api/auth/cart/active`
  `CartContext` now fetches the active cart once authenticated and merges it in — server cart wins when it has items, otherwise the local (guest) cart is preserved and synced up via `create` on the next mutation. Response parsing (`parseServerCart` in `context/cartSync.ts`) is defensive/best-effort since the real Django response shape is still unconfirmed.
- [x] ✅ **Add-to-cart action, first item** (logged-in user) → `POST /api/auth/cart/create`
  `CartItem` gained an optional `rawHit` (the raw ES hit captured at add-time — see `types/cart.ts`) so the sync layer can build the backend's full `CartLineItem[]` payload. Wired at all 3 add-to-cart call sites (`ProductInfoPanel`, `AccessoryDetail`, `QuickViewModal`).
- [x] ✅ **Cart page/drawer, qty change or remove item** → `PUT /api/auth/cart/update`
  Debounced 800ms so rapid qty +/- clicks batch into one call instead of one per click.
- [x] ✅ **Post-checkout success** → `POST /api/auth/cart/close`
  Wired at the *data* level — whenever the cart reaches zero items (for any reason) and a `cartId` exists, `close` fires and clears it. **Still not hooked to an actual checkout-success event**, since `CheckoutClient.tsx` has no real payment/order-creation step yet (see Orders section below) — today "cart reaches zero" only happens via manual removal.
- [x] ✅ **Tab close / cart inactivity** (`navigator.sendBeacon`) → `POST /api/abandoned-carts/create`
  Full client trigger built in `CartContext`: 2s-debounced activity listener (`click`/`keydown`/`scroll`) compared against `isCartTimedOut()` (5 min guest / 24h logged-in, `lib/cartAbandonment.ts`), `visibilitychange`/`beforeunload` → `sendAbandonedCartBeacon()`, and a "forced" notify on logout. Verified live: guest add-to-cart works normally, and a simulated tab-hide correctly fires the beacon with no console errors. Resuming a flagged-abandoned cart (`isAbandoned` truthy) drops the old `cartId` and calls `create` fresh on the next mutation, matching the reference app's `resetAbandonedCart`.

## Orders / Checkout / Payments

> **Rollup #9 — everything is now built and wired except real Braintree credentials, picked back up 2026-07-15.**
> `CheckoutClient.tsx` is a real payment checkout: Braintree Drop-in UI, "Place Order" charges the card then creates the order, and the old "reserve, not a purchase" disclaimer/copy is gone. The **only remaining blocker is `BRAINTREE_MERCHANT_ID`/`PUBLIC_KEY`/`PRIVATE_KEY` in `.env.local`** (placeholders already added, sandbox env selected via `BRAINTREE_ENVIRONMENT`). Until those are filled in, `/api/braintree_token` 500s with a clear "Braintree is not configured" message, which `BraintreeDropIn.tsx` renders as an inline amber notice instead of breaking the page — confirmed live in light/dark, desktop/mobile.
>
> **reCAPTCHA is now fully optional, resolved without needing a decision from the user:** `lib/recaptcha.ts` gained `isRecaptchaConfigured()`; `/api/braintree_checkout` only calls `verifyRecaptcha()` when a `RECAPTCHA_SECRET_KEY` is actually set, and `CheckoutClient.tsx` only renders the `Recaptcha` widget (`app/(market)/checkout/_components/Recaptcha.tsx`) when `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set. Both env vars are blank placeholders today, so reCAPTCHA is silently skipped end-to-end — fill in both together to turn it on, no code change needed.
>
> **Still unconfirmed (real risk once credentials arrive):** `CheckoutPayload`'s field set (`types/order.ts`) and the order-of-operations it assumes — client gets nonce → `POST /api/braintree_checkout` charges it → `POST /api/orders/checkout` is called with the resulting `transaction_id`. This is built and internally consistent, but **not verified against the real backend contract** (no reference doc exists for this one, unlike Order History/Reviews). Also `POST /api/orders/get-total` is still not called anywhere — checkout still computes subtotal/tax/total client-side with the flat `0.08875` rate; wiring it needs its response shape confirmed first (currently a guessed `OrderTotal` type).

- [x] ✅ **Checkout page, on mount** (init Braintree Drop-in UI) → `GET /api/braintree_token`
  `BraintreeDropIn.tsx` fetches the client token on mount and mounts `braintree-web-drop-in` into a container div. Renders a loading state, then either the real Drop-in UI or an "unavailable" notice depending on whether the fetch succeeds — verified live (currently always shows "unavailable" since credentials aren't set yet).
- [x] ✅ **Checkout page, "Place Order" button** → `POST /api/braintree_checkout`
  `handlePlaceOrder()` in `CheckoutClient.tsx` requests a payment nonce from the Drop-in instance, then POSTs it here with the computed total (and a reCAPTCHA token, if configured). Button now reads "Place Order" (was "Reserve My Container Today"); the old "not a purchase" disclaimer is replaced with a real "your card is charged" note.
- [x] ✅ **Checkout page, after payment nonce received** → `POST /api/orders/checkout`
  On a successful charge, `handlePlaceOrder()` builds a `CheckoutPayload` (billing/shipping mapped from the on-page address forms, `items` via the existing `cartItemsToLineItems()`, plus the transaction id) and POSTs it here. On success, calls `clearCart()` and shows a dedicated order-confirmation screen (`OrderComplete`) instead of leaving the emptied cart visible. **Unverified against real data** — see the contract-risk note above.
- [ ] 🟡 **Cart/Checkout page, qty/shipping/coupon change** → `POST /api/orders/get-total`
  Still not called — checkout computes subtotal/tax/total client-side with a flat tax rate. Left alone this pass since `OrderTotal`'s real field names are still a guess (see above).
- [x] ✅ **Account > Order History page, load** → `GET /api/auth/orders`
  New `OrdersList.tsx` fetches real orders, enriches line items (which only carry `product_id`/`quantity`/`price`) via a new `getProductsByIds()` ES lookup (`services/search.service.ts`) + `/api/products/by-ids` route, and renders order cards with status badges and a "Buy Again" action (fully wired to `CartContext.addItem`). Field names (`order_number`, `status` enum, `total_price`) and scope (list-only, no pagination) confirmed via `ORDER_HISTORY_ANSWER.md`. Verified live against the real backend — empty state renders correctly in light/dark, no unexpected console errors. **Not yet verified: the populated-list rendering** (order card, enrichment, Buy Again) — this test account has zero historical orders and nothing in the app can create one yet (no real checkout flow). Re-test once either a test account with real orders is available, or real checkout (rollup #9) exists.
- [ ] ❌ **Checkout address form, ZIP field blur** → autofill city/state (`api.zippopotam.us`, external)
  Not built. `CheckoutClient.tsx`'s address fields (city/state/zip) are independent plain inputs with no autofill. Note: this app already has a *different* ZIP-based feature (Geoapify depot/delivery-zone lookup in `useGeoapify.ts`/`DeliveryZipCheck.tsx`) — don't confuse the two; that one finds the nearest depot, this one would autofill an address form.

## Reviews

- [x] ✅ **PDP reviews section, load** → *(wired to a different endpoint than planned)*
  `CustomerReviews.tsx` on the PDP is live and working — but it calls `/api/reviews` (WordPress-based `getReviewsByVariant`), not `/api/reviews/list` (OSS backend). Intentional for now: the OSS backend's reviews table is empty. See `API_INTEGRATION_STATUS.md` for the switch-over plan.
- [x] ✅ **Order History, "Write / Edit Review" button** (delivered items only) — submit → `POST /api/reviews/create` or `PUT /api/reviews/update`
  Per `REVIEWS_FLOW.md`'s recommendation, this is the *only* review entry point built — no standalone/ungated PDP form, since the reference app's PDP form had no purchase check at all. `ReviewFormModal.tsx` (star rating + title + comment) opens from `OrdersList.tsx`, gated to `order.status === 'delivered'` line items. Before opening, `openReviewForm()` calls `GET /api/reviews/list?product_id=X` and matches `results[].user.email` to pre-fill edit mode. **Verified live end-to-end against the real backend:** create returns 200 with the full review object (`id`, `product: {id, title}`, `rating`, `title`, `comment`, `admin_reply`, `created_at`, `user`); a second create for the same product/user correctly 400s with backend's real duplicate check. **Real finding:** newly-created reviews do not appear via `list` at all (tried site-wide, product-filtered, and authenticated — all `count: 0`), so the review table is evidently moderated/pending-approval before it's publicly listed — meaning the edit-detection pre-fill is a best-effort that won't actually trigger until a review is approved. **Bug fixed as a result:** the backend's duplicate-review error arrives as DRF-style `{"non_field_errors": ["You have already reviewed this product."]}`, not `error`/`detail` — `review.service.ts` was only checking those two fields, so users hit a generic "Could not save your review." instead of the real message. Added `extractReviewError()` to also check `non_field_errors`; confirmed the real message now surfaces through `/api/reviews/create`.

## Newsletter

> Shared client utility now exists — `lib/newsletter.ts`'s `subscribeToNewsletter(email)`/`unsubscribeFromNewsletter(email)`, both returning `{ ok: true } | { ok: false; error }`. Every row below is now "build the UI and call this," not "build the fetch logic from scratch." Untested against the real backend by design (subscribing a real email has a real side effect) — verify with a disposable test email before shipping any of these.

- [ ] ❌ **Newsletter signup widget** (footer/homepage/standalone Subscribe page) → `POST /api/subscribers/subscribe`
  Not built. No newsletter signup UI exists anywhere in the app (checked footer, homepage, standalone pages).
- [ ] ❌ **Account Dashboard subscribe toggle** — toggle on → `POST /api/subscribers/subscribe`
  Not built. The account "Dashboard" (`/my-account`) is just a text blurb (`AccountView.tsx`) — no settings/toggles of any kind live there yet.
- [ ] ❌ **Unsubscribe page** (email link) — confirm → `POST /api/subscribers/unsubscribe`
  Not built.
- [ ] ❌ **Account Dashboard subscribe toggle** — toggle off → `POST /api/subscribers/unsubscribe`
  Not built, same as the dashboard toggle above.

---

## Rollup: what actually needs building (not just wiring)

Grouped by how much net-new UI is required, roughly cheapest → most involved:

1. ~~**Logout → `/api/logout`**~~ — done.
2. ~~**Auth check on load + background refresh**~~ — done.
3. ~~**Reset Password page**~~ — done.
4. ~~**Change Password**~~ — done.
5. ~~**Cart backend sync**~~ — done, including the abandoned-cart trigger.
6. ~~**Order History page**~~ — done (empty state verified live; populated-list rendering still needs a real order to test against).
7. **Newsletter** — utility functions done (`lib/newsletter.ts`); still touches multiple places (footer widget, dashboard toggle, unsubscribe page) with no existing UI to build from.
8. ~~**Review submission/edit form**~~ — done. Built as the Order-History-gated entry point only (no standalone PDP form, per `REVIEWS_FLOW.md`). Verified live: create/duplicate-detection/error-message-surfacing all confirmed against the real backend. Known gap: the backend appears to moderate/hide new reviews from `list` before approval, so the edit pre-fill can't be exercised until a review gets approved server-side.
9. **Real payment checkout** — built and wired (Braintree Drop-in UI, nonce handling, order creation on success), leaving exactly one blocker: real Braintree credentials in `.env.local`. `get-total` integration is deliberately left for later (guessed response shape). Once credentials land, needs a real sandbox transaction test before calling this done — see the contract-risk note above.
