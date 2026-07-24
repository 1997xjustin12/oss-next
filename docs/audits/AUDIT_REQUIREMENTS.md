# OSS-Next Completion Audit — Requirements & Task Tracker

Single source of truth for re-running the completion audit and tracking the resulting task
list. Update this file after every audit pass — don't let it go stale (same convention as
`API_INTEGRATION_STATUS.md`/`API_TRIGGER_CHECKLIST.md`, alongside this file in
`docs/audits/`). Feature-build reference docs live in `docs/reference/`; audit PDFs in
`docs/audits/pdf/`.

---

## 1. Scope

**In scope** (this Next.js app owns these, everything else stays on WordPress):
Home, Product Detail Page (PDP), Product Listing Page (PLP), My Account + subpages,
Login/Register, Cart, Checkout.

**Out of scope**: everything else — WordPress-authored content pages, rendered by
`app/(market)/[...slug]/page.tsx`.

> **Changed 2026-07-21.** These no longer come from a live scrape of onsitestorage.com
> inside an iframe. They are pre-converted and served by the Django pages API
> (`/api/pages/detail/<path>/`), rendered inline as part of the Next.js document, inside
> the app's own TopBar/Navbar/Footer. The old iframe proxy (`/api/wp-proxy`,
> `wp-proxy.service.ts`, `WpPageRenderer.tsx`) is deleted. Consequence for auditing: this
> content is now server-rendered and indexable, so it is in scope for SEO/CWV checks in a
> way the iframe never was.

**Data sources**: Elasticsearch (product catalog/search), a separate Django REST backend
(auth, cart, orders, reviews, newsletter).

---

## 2. Confirmed Product Decisions

Things that could look like gaps in a naive audit but are **intentional and final** —
don't re-flag these in future audit passes.

1. **Login/Register placement is final.** Both forms render side-by-side at `/my-account`
   (no dedicated `/login` or `/register` route) — this deliberately replicates the original
   WordPress app's URL structure, where `/my-account` served both the login/registration
   form (logged out) and the account dashboard (logged in). Confirmed 2026-07-15.

2. **PDP Product schema intentionally has no `hasMerchantReturnPolicy`.** The real policy
   (a money-back guarantee minus shipping, per the PDP Warranty tab) hasn't been finalized
   into concrete schema.org terms (return window, conditions) yet — sales hasn't decided.
   Don't add a guessed value; wait for real terms. Confirmed 2026-07-15.
3. **GTIN in the Product schema deliberately reuses the SKU value** (same as `mpn`), even
   though a SKU isn't technically a GTIN — no real GTIN/barcode data exists anywhere in the
   product data, and this matches the original WordPress site's own schema convention.
   Confirmed 2026-07-15.

4. **Guest cart-save email capture uses a hybrid trigger** — exit-intent (desktop, cursor
   leaves through the top of the viewport) + tab-backgrounded (mobile, no cursor to read
   exit-intent from), both armed only after ~15s dwell time, capped to at most once per
   guest (localStorage-gated). Confirmed 2026-07-17. See `components/layout/GuestCartCapture.tsx`
   and the "guest carts remain structurally blocked" finding in `API_INTEGRATION_STATUS.md`'s
   Cart section — the capture modal is real and working, but a guest abandoned-cart notify
   still can't succeed end-to-end against the real backend (needs a backend-side fix).

5. **Missing route-level `loading.tsx` on PDP/PLP/cart/checkout/my-account is NOT a gap.**
   Two parallel research passes disagreed on this during the 2026-07-17 re-audit — one
   flagged it as a coverage hole, the other traced it further and confirmed it's
   architecturally correct: PDP/PLP use real page-level `<Suspense>` (which is what
   `loading.tsx` would otherwise provide), while cart/checkout/my-account are thin server
   shells around `'use client'` leaves that manage their own dimension-matched skeleton
   state via `useEffect`/`useState` (e.g. `OrdersList.tsx`'s `OrdersSkeleton`) — `loading.tsx`
   governs server-streamed async boundaries, not client-side data fetches, so it wouldn't
   apply here. Confirmed 2026-07-17.

6. **Homepage A/B/C testing is real and intentional, not orphaned scaffolding** — but
   implemented as a single URL (`/`) with server-side sticky variant selection
   (`middleware.ts` + a request header), not as separate crawlable routes. The old
   `/version2`/`/version3` routes were removed 2026-07-17 in favor of this pattern; don't
   re-suggest separate variant routes in a future audit. See `middleware.ts` and
   `(home)/page.tsx`'s `VariantHero`.
7. **Client-confirmed feature decisions, 2026-07-18** — don't re-flag these in future audits:
   - Both homepage reviews carousels (`ReviewsSection.tsx` static + `ReviewsSectionLive.tsx`
     live) are kept side by side, on purpose, for now.
   - Product comparison, recently-viewed products, account deletion/data export, and
     back-in-stock/price-drop alerts are **not required by the client** — not being built.
   - Payment methods stay **Braintree card-only** — no PayPal/Venmo/Apple Pay planned.
   - Live chat and newsletter signup UI are **still pending** a client decision (not
     resolved either way — don't mark done, but don't re-report as newly-found either).
8. **`app/(market)/(home)/loading.tsx` is a deliberate exception, not a gap.** It's the one
   in-scope area that actually uses the `loading.tsx` convention (a real branded full-viewport
   preloader) — everywhere else, `loading.tsx` is correctly absent because PDP/PLP use
   page-level `<Suspense>` instead, and cart/checkout/my-account use client-managed skeleton
   state (see decision #5 above). Confirmed 2026-07-18 — don't flag Home as inconsistent with
   the rest of the app; it's the deliberate one that actually needs this file.

9. **WordPress content pages render inline, not in an iframe, and use the app's own
   chrome.** Confirmed 2026-07-21. The converted markup contains no WordPress
   header/footer (verified against the homepage, `privacy-policy` and a nested gallery
   page), so the `(market)` layout supplies the only chrome. The theme CSS it ships is
   scoped to a `.wp-content` wrapper — it styles bare `a`/`span`/`div` with `!important`,
   so unscoped injection repaints the app's own Navbar/Footer. Don't "simplify" that
   scoping away, and don't reintroduce `global_css_url` as a `<link>` fallback: a plain
   stylesheet link can't be scoped.

10. **`ratings` is an object, not a number.** Confirmed 2026-07-21:
    `{ "rating": 4, "review_count": 3 }`. Read it via `normaliseRating()`
    (`lib/ratings.ts`), never directly — the helper also accepts the legacy bare
    number/string so documents not yet reindexed keep rendering. Don't re-flag the old
    "PLP review count is hardcoded 0" finding; that was fixed once `review_count` existed.

_(Add new confirmed decisions here as they come up, so they persist across future audits.)_

---

## 3. Audit Methodology

Re-run this exact checklist every time so results are comparable across audits. The
methodology below was used to produce the 2026-07-15 baseline (§5).

### Dimension A — Functional Completeness (per in-scope area)

For each of the 8 areas, determine: what routes/pages exist, what's genuinely live (real
data/backend calls) vs. static/hardcoded/placeholder vs. entirely missing, and any known
bugs or unverified contracts (cross-check `API_INTEGRATION_STATUS.md` /
`API_TRIGGER_CHECKLIST.md` first — don't re-discover what's already tracked there).

Also always check cross-cutting concerns: `error.tsx`/`not-found.tsx`/`global-error.tsx`
existence, route-level `loading.tsx` coverage, and that the WordPress catch-all doesn't
conflict with native routes.

### Dimension B — Common E-Commerce Feature Coverage

Check each of these 41 items, organized into 6 groups. For each: ✅ done (file evidence),
🟡 partial/static-only (file evidence + what's missing), or ❌ not found (confirm you
searched, don't assume).

- **Discovery & Browsing (10)**: site-wide search, faceted filtering, sorting, pagination,
  breadcrumbs, related/similar products, recently viewed, product comparison, wishlist,
  quick view modal.
- **Product Page (7)**: image gallery/zoom, variant selection, stock/availability indicator,
  reviews & ratings, Q&A/FAQ, social sharing, frequently-bought-together/upsell.
- **Cart & Checkout (9)**: persistent cart, quantity editing/removal, coupon/discount codes,
  shipping calculator, tax calculation, guest checkout, multiple payment methods, order
  confirmation, abandoned cart recovery.
- **Account & Post-Purchase (6)**: order history/tracking, order status updates, re-order,
  address book, wishlist persistence, account deletion/data export.
- **Trust & Conversion (6)**: live chat, trust badges, newsletter signup, social proof,
  return/refund policy visibility, contact/support access.
- **Notifications (3)**: order confirmation emails, back-in-stock alerts, price drop alerts.

### Dimension C — Core Web Vitals, PageSpeed & SEO

Audited against this repo's own stated rules in `AGENTS.md` ("Performance, SEO & Quality
Non-Negotiables", 13 numbered rules) — this project defines its own bar; the audit checks
real compliance against it, not a generic external standard.

1. Metadata (`generateMetadata`/`metadata`) on every in-scope page — list any exceptions.
2. `generateMetadata` parallelized with page data fetch (or covered by `'use cache'` dedup).
3. `alternates.canonical` present and consistent.
4. `sitemap.ts` + `robots.ts` existence, and whether dynamic ES-backed URLs are included.
5. Shared `<JsonLd>` component existence; which pages emit JSON-LD and which schema types
   (Organization+WebSite/SearchAction on home, Product+offers+aggregateRating on PDP,
   BreadcrumbList on PLP/category pages).
6. Zero raw `<img>` — `next/image` only. LCP candidates have `priority`. CLS-safe sizing
   (`width`/`height` or `fill` in a sized container).
7. Fonts via `next/font` only, no raw font `<link>` tags.
8. `'use cache'` + `cacheLife` usage — deliberate vs. missed; profile variety
   (`seconds`/`minutes`/`hours`/`days`); `force-dynamic` scoped only to cart/checkout/account.
9. `revalidateTag`/`updateTag` actually wired to real mutation flows (not just webhook routes).
10. `<Suspense>` usage per in-scope page, and whether fallbacks are real dimension-matched
    skeletons vs. generic/missing.
11. `next/script` usage and `strategy=` values for any third-party script.
12. Semantic landmarks (`<main>`/`<nav>`/`<header>`/`<footer>`) — including checking for
    **duplicate/nested landmarks** (e.g. a page rendering its own `<main>` inside a layout
    that already has one).
13. `<Link>` used for all internal nav (no raw `<a href="/...">`); `config/routes.ts` typed
    constants used instead of hardcoded path string literals.
14. Bundle hygiene: no heavy client-side imports of server-only packages (e.g. the ES
    client); named imports (`import { x } from 'pkg'`) over default imports for tree-shaking.

### How to regenerate this audit

Run three research passes in parallel (as separate agents/sessions, or sequentially if
working solo), each scoped to one dimension above, then synthesize into an updated §5 and
refresh the task list in §6. Read `API_INTEGRATION_STATUS.md`/`API_TRIGGER_CHECKLIST.md`
and §2 of this file FIRST each time so already-tracked bugs and confirmed decisions aren't
re-reported as new findings.

---

## 4. Output Format

Every audit pass should produce:
1. An updated §5 (latest scores) and §6 (task list) in this file.
2. A **PDF export of the current task list** (§6) for sharing/printing — regenerate
   whenever the task list changes materially.

---

## 5. Latest Audit Results — 2026-07-24

| Dimension | Score | 2026-07-21 | 2026-07-18 | 2026-07-15 |
|---|---|---|---|---|
| **Overall (blended)** | **~83%** | ~81% | ~79% | ~65% |
| Functional Completeness (8 areas) | ~90% | ~88% | ~87% | ~62% |
| E-Commerce Feature Coverage (41 items) | ~64% | ~64% | ~62% | ~65% |
| Core Web Vitals / PageSpeed / SEO | ~91% | ~91% | ~89% | ~68% |

**Event-driven pass, not a full three-dimension re-run** — it records what changed while
hardening checkout and adding the maintenance wall. Treat the scores as a delta on
2026-07-21. A full methodology pass (§3) is still owed.

Task list: **50 done / 0 partial / 6 open** (was 42 / 0 / 12 on 2026-07-21). Nothing regressed.

A second batch of closures landed 2026-07-24 on client answers:
- **Order confirmation emails** — client confirmed Django owns them; no Next.js email code
  expected. Closed.
- **Address book** — client confirmed edit-address stays singular; multi-address not wanted.
  Not a gap, closed.
- **Newsletter** — done: built `/my-account/newsletter` (registered-user
  subscribe/unsubscribe, in the account nav), reading the authoritative `is_subscribed`
  profile flag; client confirmed it works live. The public homepage widget was descoped by
  the client (not wanted for now; backend handles status), so there's no open work left.
- Checkout now also sends `status: "paid"` (only created post-charge), leaving the backend
  to honor/verify it — see the checkout row in `API_INTEGRATION_STATUS.md`.

- **Functional +2** — the two payment defects from the 07-21 pass are fixed and verified
  end-to-end against the real Braintree sandbox: `/api/braintree_checkout` now charges a
  server-recomputed total (a crafted request could previously buy a $3,000 container for a
  cent), and a charge that fails to record an order now lands on a dedicated
  "payment received, order needs attention" screen instead of a raw error beside a live —
  and re-chargeable — Place Order button. The `middleware.ts` → `proxy.ts` deprecation is
  resolved with the A/B test verified still running.
- **New capability** — a site-wide maintenance wall (env kill-switch + runtime Redis
  toggle + browser control page), gated in the proxy so it covers native and WP catch-all
  routes uniformly. Not scored against the 41-item e-commerce rubric (it's operational
  tooling, not a storefront feature), but recorded in §6.
- **Feature Coverage / CWV flat** — no storefront features flipped state this pass; the
  ratings/`aggregateRating`/inline-WP-render gains were already booked on 2026-07-21.

**The most serious open item is unchanged and remains the Django checkout crash** (§6,
Backend). With the two front-end payment defects now closed and Braintree credentials
configured, that single backend bug is the last thing between here and a working purchase —
three further items sit behind it. See `BLOCKERS_2026-07-24.pdf`.

Functional Completeness and CWV/SEO both moved up again — reflects the homepage A/B/C
rebuild (real `middleware.ts` + `VariantHero` Suspense, replacing the crawlable
`/version2`/`/version3` duplicate-content routes), the wishlist feature, PDP social
sharing, the checkout/cart metadata fixes, the checkout consent-link and thumbnail fixes,
and the `braintree`/`cheerio` named-import fixes — all shipped between the two audits.

E-Commerce Feature Coverage holds flat at ~62% despite two genuine feature flips
(**wishlist** and **social sharing** both went from ❌ to ✅) — those +2 points were offset
by scoring several previously-generous items more conservatively this pass: the address
book turns out to be exactly one billing + one shipping address baked into the profile,
not a true multi-address book; and order history has no shipment/carrier tracking number,
only order-status display. Nothing that worked before stopped working — this is stricter
grading, not regression, same pattern as the 07-15→07-17 dip.

Full per-area/per-item breakdown from this pass lives in the 3 parallel research reports
that produced it (not persisted verbatim here, to avoid this file going stale) — §6 below is
the actionable distillation, with every genuinely NEW finding from this pass folded in
alongside the existing punch list.

---

## 6. Current Task List

Living punch list, regenerated after each audit. Check items off as they're completed;
don't delete completed items until the next full regeneration (so progress is visible).

### High priority

- [x] **NEW 2026-07-21 — `/api/braintree_checkout` charged a client-supplied amount.**
      The route read `amount` straight from the request body and passed it to
      `transaction.sale()`; nothing server-side reconciled it against the cart. A crafted
      request charged $0.01 for a $3,000 container.
      _Fixed 2026-07-24 — the route recomputes the total server-side via_
      _`/api/orders/get-total` and never charges the client's number. Confirmed the obvious_
      _follow-up attack is also dead: the backend prices from `product_id` and ignores item_
      _price fields, verified by tampering an item to 0.01 and watching sub_total stay 3100._
      _The client sends the displayed total only as `expectedAmount`; if the server figure_
      _is higher it 409s rather than overcharging. Verified end-to-end against the real_
      _Braintree sandbox: attack with a usable nonce → 409 no charge; honest purchase →_
      _200 charged 3425.50; AVS M/M. Also fixed a latent bug in the payer-details commit —_
      _`compact()` returned undefined for a blank address but the key was still passed, and_
      _the SDK rejects a present-but-undefined `billing`/`shipping` outright._

- [x] **NEW 2026-07-21 — a successful charge with a failed order-create showed a raw error.**
      `handlePlaceOrder()` charges first, then POSTs `/api/orders/checkout`. If the second
      call failed, the customer was charged and left on the checkout page with a live Place
      Order button — retrying would charge them twice.
      _Fixed 2026-07-24 — routes to a dedicated "payment received, order needs attention"_
      _screen with no retry, showing the Braintree `transaction_id` as the support_
      _reference. The cart is left intact (no order was recorded, so it's still the only_
      _record of what they bought). Independent of the backend crash below, since a network_
      _failure can produce the same state in production._

- [x] **NEW 2026-07-21 — PDP crashed on every shipping-container page.**
      The backend changed `ratings` from a number to `{ rating, review_count }`;
      `ProductInfoPanel.tsx` threw `TypeError: rating.toFixed is not a function`,
      rendering "Something Went Wrong" on the PDP and on every option change.
      _Fixed — `lib/ratings.ts`'s `normaliseRating()` now fronts every read, tolerant of_
      _the object, a bare number and a numeric string. Five call sites were affected;_
      _**two failed silently rather than crashing**, which was the more dangerous half:_
      _the PLP card's `typeof hit.ratings === 'number'` guard scored every product 0_
      _forever, and the `best_rated` sort ordered on a field that is no longer a number._
      _Both would have looked fine indefinitely. Verified live: PDP 200, renders 4.0 /_
      _3 Reviews._

- [x] **NEW 2026-07-21 — WordPress theme CSS repainted the app's own header/footer.**
      Converted pages ship a theme stylesheet that styles bare `body`/`a`/`span`/`div`
      with `!important`; injected unscoped it overrode the Navbar/Footer font.
      _Fixed by scoping every selector to a `.wp-content` wrapper. Found a second, worse_
      _bug while verifying: `postcss.parse` threw on the API's CSS and the `catch` silently_
      _dropped the entire 400KB stylesheet, rendering pages nearly unstyled while the build_
      _stayed green. Now uses `postcss-safe-parser`. See the backend item below._

- [x] **NEW 2026-07-21 — finish the `NEXT_SOLANA_*` → `NEXT_OSS_*` env rename.**
      _Done. Every other service had already migrated; `wp-pages.service.ts` was the last_
      _holdout. `.env.local` carried both URL vars with byte-identical values — duplicate_
      _dropped, key renamed to `NEXT_OSS_BACKEND_KEY`. `docs/reference/*` deliberately_
      _still says `NEXT_SOLANA_BACKEND_URL`: those files document the original WordPress_
      _app and cite its `src/pages/api/*.js` paths, so that is its variable name, not ours._

- [x] **Fix the account-update endpoint — it was a wrong URL/verb on our side, not a**
      **missing backend feature.** Found 2026-07-15 while investigating whether
      `edit-address` could be built for real: `services/user.service.ts`'s
      `ACCOUNT_DETAILS_URL` (`api/auth/account-details/`) 404s against the real backend
      in every HTTP method tried. Pulled the complete registered `api/auth/` route list
      from a Django debug 404 page, which confirmed no `account-details` route exists —
      initially logged as a backend gap. **Correction**: the user supplied
      `MY_ACCOUNT_PROFILE.md`, extracted from the original WordPress app's real working
      profile-update flow, which revealed the actual contract: `PUT` (not `PATCH`) to the
      *same* `api/auth/profile` URL the working GET already uses (no trailing slash), as
      a **full-object replace** (every profile field resent every time, not a diff).
      Verified live against the real backend: 200, data genuinely persists.
      _Done 2026-07-15 — `updateAccountDetails()` in `services/user.service.ts` now PUTs_
      _`api/auth/profile` with the full name+email+profile payload; `AccountDetailsForm.tsx`_
      _resends the user's current full `profile` unchanged alongside its own edits, and the_
      _new `edit-address` page (see below) does the mirror image, so neither form can wipe_
      _out what the other saved. Dropped the "Display name" field from `AccountDetailsForm`_
      _entirely — the real backend has no such field, it was always a dead input. Live-_
      _verified end-to-end (name-only save → address-only save → re-fetch → restore),_
      _confirming each save preserves the fields the other form owns and data genuinely_
      _persists. Typecheck + lint clean._
- [ ] **Fix the Django backend checkout crash.** `/api/orders/checkout` throws
      `ValueError: Currency formatting is not possible using the 'C' locale` in
      `app/orders/views.py` line 89 (`locale.currency(...)` with no server locale
      configured) — on EVERY call, and the order saves before the crash. Blocks real
      checkout entirely once Braintree credentials exist. **Backend fix, not fixable here.**
      _Still open as of 2026-07-21. Now compounded by the charged-but-no-order item above:_
      _this crash is what makes that state reachable on the first real transaction._

- [ ] **NEW 2026-07-21 — the Django pages API serves malformed CSS. Backend fix.**
      Its minifier strips `/* */` delimiters but leaves the comment text behind, and emits
      unbalanced braces:
      `once slick adds its class,show it smoothly .shipping-container-slider…{…}` followed
      by a stray `}`. Strict parsers throw; browsers error-recover by **discarding rules
      after the error point**. Worked around here with `postcss-safe-parser`, but this same
      CSS is served to real browsers on the live WordPress site, which are silently losing
      styling nobody has noticed. Fix in the Django CSS pipeline.

- [x] **NEW 2026-07-21 — `middleware.ts` is deprecated in Next 16.** The build warned to use
      `proxy.ts` instead. An earlier same-name rename attempt silently emptied
      `middleware-manifest.json` and disabled the homepage A/B/C assignment (§2 decision #6)
      with a green build, and was reverted.
      _Done 2026-07-24 — renamed `middleware.ts` → `proxy.ts` and `export function_
      _middleware` → `export function proxy` (Next 16's convention; verified against the_
      _installed docs). The manifest now registers the proxy correctly and the A/B variant_
      _cookie is assigned on `/` again — the failure mode was a stale prior attempt, not the_
      _rename itself. The proxy has since taken on the maintenance wall too (see below)._
- [x] **NEW 2026-07-24 — Maintenance wall (net-new capability, client-requested).**
      A site-wide maintenance mode was added end to end. `app/maintenance/page.tsx` is a
      self-contained 503 page (no backend, no cache — it must not depend on what's down).
      The gate lives in `proxy.ts`, so it covers every route uniformly, native and WP
      `[...slug]` catch-all alike — verified live that WP content pages return 503 with the
      maintenance body exactly as native routes do. State is layered: a Redis flag
      (`oss-next:maintenance`, flipped in seconds via `POST /api/maintenance` with the
      `x-revalidate-token` secret, cached ~20s in the proxy) under a `MAINTENANCE_MODE` env
      kill-switch that forces the wall on even if Redis is down; a failed Redis read fails
      OPEN so a blip can't wall the site. `/maintenance-control` is a token-gated browser
      page with On/Off buttons. `MAINTENANCE_BYPASS_TOKEN` enables a preview cookie so
      admins/QA can view the live site while it's walled. The toggle route and control page
      are exempt from the wall (else turning it on would lock you out of turning it off) —
      a lockout that live testing caught and fixed. Full on→off cycle verified against real
      Redis and the Braintree sandbox.
- [x] **NEW 2026-07-24 — Converted page titles were double-branded.** WordPress `seo_title`
      already carries the brand suffix ("… | On-Site Storage Solutions"), and the root
      layout's title template appended a second one.
      _Done — the WP catch-all marks `seo_title` as `absolute` so the template doesn't_
      _re-brand it, while the unbranded bare-`title` fallback still uses the template._
- [x] **Add `sitemap.ts` and `robots.ts`** covering all static routes plus dynamic
      ES-backed PDP/PLP URLs. Currently zero SEO route declarations exist.
      _Done 2026-07-15 — new `getAllProductHandles()` in `search.service.ts` paginates_
      _via `search_after` (ES's 10,000-result window is smaller than the real catalog)._
      _Verified live: `/sitemap.xml` returns exactly 10,267 URLs (3 static + 10,264 real_
      _published products, matching a direct ES count), with real `lastmod` dates._
      _`/robots.txt` disallows `/my-account`, `/cart`, `/checkout`. Typecheck + lint clean._
- [x] **Add `error.tsx`, `not-found.tsx`, and `global-error.tsx`** for the in-scope areas —
      none exist anywhere in the app today.
      _Done 2026-07-15 — all 3 added at the true `app/` root (the only other route group,_
      _`(admin)`, is entirely unbuilt placeholder folders, so no separate scoped versions_
      _needed yet). Styled to match the site's existing empty-state pattern (icon + heading_
      _+ description + CTA), with a phone-support link consistent with the rest of the site._
      _Verified live: a nonexistent `/product/{handle}` correctly renders `not-found.tsx`'s_
      _content. **Known caveat, pre-existing, not introduced by this change**: the PDP's_
      _`notFound()` call happens inside a `<Suspense>` boundary, so the HTTP response has_
      _already started streaming with a 200 status by the time it fires — the page shows_
      _the correct not-found content, but the status code stays 200 instead of 404 on that_
      _specific route. Fixing that would mean restructuring the PDP's Suspense placement,_
      _out of scope for just adding these files. `error.tsx`/`global-error.tsx` verified via_
      _typecheck/lint only (standard, low-risk Next.js file conventions; not easily_
      _triggerable without introducing a real fault)._
- [x] **Rebuild the `/cart` page's fake logic**: replace the `setTimeout`-based loading
      state with a real one, replace the hardcoded `"SAVE10"` client-side coupon check with
      a real backend-validated flow (or remove the coupon box if no coupon system is
      planned), and replace the flat `$195` delivery-fee constant with a real call to
      `/api/orders/get-total` (same endpoint checkout already uses) so the two pages agree.
      _Done 2026-07-15 — removed the fake 1.1s setTimeout entirely (cart items are already_
      _available synchronously post-mount; no real async work was ever happening there)._
      _Removed the coupon/promo box outright rather than fake-validate it — confirmed via_
      _the e-commerce feature audit that zero coupon backend exists anywhere to validate_
      _against. Delivery fee/tax now come from a real, debounced call to_
      _`/api/orders/get-total` (same endpoint + CartLineItem payload shape as checkout);_
      _since the cart page collects no ZIP, shipping/tax legitimately come back 0 and the_
      _UI says "Calculated at checkout"/"At checkout" rather than implying they're free._
      _"Refresh totals" now re-runs this real call instead of replaying a fake timer._
      _Also fixed 2 bugs found while in this file: the empty-cart CTA linked to_
      _`/buy-shipping-containers`, which doesn't exist (real PLP route is_
      _`/sale-shipping-containers`); and the delivery-estimate banner said "2–4 business_
      _days," inconsistent with the "1–5 days" claim used everywhere else on the site._
      _Verified live: real item renders in ~750ms (no artificial delay), promo box gone,_
      _both fixed links/copy confirmed, get-total resolves to the correct deferred state,_
      _manual refresh re-fetches for real, total amount matches exactly. Typecheck + lint_
      _clean (one legitimate `set-state-in-effect` suppression for the hydration-safe mount_
      _flag — same accepted pattern already used elsewhere in this codebase)._
- [x] **Fix the duplicate `<main>` landmark bug** — nearly every My Account page plus the
      PDP (`ProductDetail.tsx`/`AccessoryDetail.tsx`) render their own `<main>` nested
      inside the shared layout's `<main>`. Remove the nested ones.
      _Done 2026-07-15 — swapped the nested `<main>` for `<div>` in all 11 affected files_
      _(9 my-account pages + ProductDetail.tsx + AccessoryDetail.tsx); verified exactly one_
      _`<main>` renders per page via Playwright, typecheck + lint clean._
- [x] **Orphaned duplicate homepage drafts were live, crawlable, and hurt SEO.**
      `app/(market)/(home)/version2/page.tsx` and `.../version3/page.tsx` rendered at real,
      reachable URLs `/version2` and `/version3` — near-identical content/metadata to the
      real homepage, hand-rolled JSON-LD, wrong `canonical: "/"`, and not excluded from
      `robots.ts`/`sitemap.ts`. **Correction**: these weren't abandoned scaffolding — the
      user confirmed they're needed for real homepage A/B/C testing, just built the wrong
      way (separate crawlable routes instead of one URL with server-side variant
      selection).
      _Done 2026-07-17 — replaced with the standard single-URL pattern: new `middleware.ts`_
      _assigns a sticky variant (`1`/`2`/`3`, 30-day cookie) per visitor on `/` and forwards_
      _it via an `x-ab-home-variant` request header (not read from the cookie directly, so_
      _the very first request — before the cookie exists — still gets a consistent variant)._
      _`(home)/page.tsx` reads that header in a new `VariantHero` component, wrapped in_
      _`<Suspense fallback={<HeroSkeleton />}>` since `headers()` is a dynamic API — this_
      _keeps the rest of the homepage statically `'use cache'`-able, only the Hero slice_
      _becomes per-request. Deleted the `version2`/`version3` route folders entirely — now_
      _one canonical URL, one JSON-LD block, one sitemap entry, no duplicate-content risk._
      _Verified live: sticky cookie persists the same variant across repeat requests;_
      _6 fresh (no-cookie) requests correctly randomized across all 3 variants; the_
      _assigned variant's real Hero content renders; `/version2`/`/version3` now fall_
      _through to the existing WordPress-proxy catch-all like any other unknown path_
      _(confirmed this fallback behavior is pre-existing/unrelated, not a regression)._
      _Typecheck + lint clean on all changed files._
      _**Not yet built**: real analytics/conversion tracking per variant — no experimentation_
      _or analytics library exists anywhere in this repo today, so this only covers correct_
      _variant delivery, not measurement. Wire in whatever analytics tool is chosen once one_
      _exists, rather than fabricating tracking calls with nothing to receive them._
- [x] **Checkout page metadata was stale and factually wrong.**
      `app/(market)/checkout/page.tsx`'s `metadata` (title-tag description + OG copy)
      still read "Complete your shipping container **reservation**... **No commitment
      required**" / "**Reserve** your shipping container today. **No deposit, no
      commitment**." This described the old fake "reserve, not a purchase" flow —
      `CheckoutClient.tsx` itself was already updated to real "Place Order" / "your card
      is charged" copy (per `API_INTEGRATION_STATUS.md`), but the page-level metadata
      (what shows in search results and shared links) was never updated to match.
      _Done 2026-07-18 — rewrote both the meta description and OG copy to describe the_
      _real payment flow. Verified live._
- [x] **`cart/page.tsx` had zero `metadata` export**, violating this project's own "every
      page.tsx must export metadata" rule. Low severity since `/cart` is already
      `robots.txt`-disallowed, but the explicit per-page `robots: { index: false }` (same
      defense-in-depth pattern checkout uses) was still missing.
      _Done 2026-07-18 — split the page the same way `/wishlist` was just built: a new_
      _server-shell `page.tsx` exporting real metadata (title, description, canonical,_
      _`robots: { index: false, follow: true }`), rendering the actual cart UI (moved_
      _as-is) from a new `_components/CartPageClient.tsx`. No behavior change. Verified_
      _live: `/cart` returns 200 with a real `<title>` tag now._

### Medium priority

- [x] **Decide the fate of the 3 inert My Account subpages** (`downloads`,
      `edit-address`, `payment-methods`) — build real functionality (address CRUD backed
      by the real profile API, etc.) or remove/hide the nav entries if not planned.
      _Done 2026-07-15 — `edit-address` rebuilt for real: a billing + shipping address_
      _form (+ phone), backed by the same fixed `PUT api/auth/profile` flow above, merging_
      _the user's current name/email so as not to wipe them. `downloads` and_
      _`payment-methods` have no real backend behind them (no digital products, no stored-_
      _payment-method API) — kept as unlinked stub route files but removed from_
      _`AccountSidebar.tsx`'s nav so users can't reach dead pages. Verified live: both_
      _pages render correctly, sidebar shows exactly Dashboard/Orders/Addresses/Account_
      _Details/Logout. Typecheck + lint clean._
- [x] **Add JSON-LD `BreadcrumbList` to the PLP** — a visual breadcrumb exists but no
      structured data, despite this project's own SEO rule requiring it on listing pages.
      _Done 2026-07-17 — added alongside building the shared `<JsonLd>` component below,_
      _since a 4th one-off inline script would've just meant migrating it again later._
      _Mirrors the visible breadcrumb exactly for both `ptype` variants (Home > Product_
      _Pricing / Home > Container Accessories). Verified live: both variants render the_
      _correct `BreadcrumbList` with matching names/URLs._
- [x] **Enrich the PDP's Product JSON-LD to match the real WordPress schema** —
      `sku`/`mpn`/`gtin` (gtin reuses sku, see §2), full `image` array, `itemCondition`
      (mapped from the real `condition` field), `additionalProperty` (Container Size,
      Grade, Height Type, Material, Payment Type, Delivery Location — container products
      only), real tare `weight` (from `lib/data/pdpShippingContainers.ts`, averaged when
      the source is a manufacturer-variance range), a rolling (not hardcoded)
      `priceValidUntil`, and real `shippingDetails` matching the site's stated 1-5 day
      delivery. `description` is now shared between `generateMetadata` and the JSON-LD so
      they can't drift apart. Price is confirmed `sale_price` (computed by
      `calculateProductPrice()`, same value shown everywhere else on the site).
      **Still missing** (real, not fabricated): `aggregateRating` (no `reviewCount` in the
      ES index) and `hasMerchantReturnPolicy` (see §2). Verified live against a generic
      product, a real-location product, and an accessory — container-only fields correctly
      appear/disappear. _Done 2026-07-15._
- [x] **Build a shared `<JsonLd>` component** (`components/shared/JsonLd.tsx`) and migrate
      the 3 existing hand-rolled inline JSON-LD blocks (home, PDP, checkout) to use it.
      _Done 2026-07-17 — thin wrapper around the `<script type="application/ld+json">`_
      _pattern all 4 spots (home, checkout, PDP, and the new PLP breadcrumb above) already_
      _used identically; migrated all 4 to it, no behavior change. Verified live: all 4_
      _pages still emit byte-identical JSON-LD output through the shared component._
      _Typecheck + lint clean (pre-existing unused-import warnings on the homepage are_
      _unrelated — commented-out sections awaiting the "decide the homepage's direction"_
      _item below)._
- [x] **Create `config/routes.ts`** with typed path constants; replace the ~30 hardcoded
      internal path string literals found across the app.
      _Done 2026-07-17 — scoped deliberately to routes this app itself owns (Home, PLP,_
      _PDP, Cart, Checkout, My Account + subpages); left WordPress-owned content pages_
      _(Locations, Privacy, Terms, the quote landing page, Navbar's mega-menu) as plain_
      _hardcoded strings, since this app doesn't own those slugs and encoding them here_
      _would misrepresent who's responsible for keeping them correct. Replaced ~35 call_
      _sites across layout components, all my-account pages/canonicals, cart/checkout,_
      _and dynamic `/product/{handle}` link sites._
      _Found and fixed 2 real broken links along the way: the checkout empty-cart CTA_
      _linked to `/products` (doesn't exist) and the PDP's "View All Containers" linked_
      _to `/product` (doesn't exist) — both now correctly point at `/sale-shipping-_
      _containers`. Also fixed a latent `excludePaths` bug in `app/layout.tsx`/_
      _`ZipAutoDetect.tsx` (`'/account'` instead of `'/my-account'` — never matched,_
      _so the geolocation prompt was never actually excluded on My Account pages) and a_
      _typo (`ptype=accesories`, missing an "s") in `ProductVariantShell.tsx`'s listing_
      _crumb — though live-tracing that one found it's in unreachable code: accessory_
      _products render via the separate `AccessoryDetail.tsx`, which has no breadcrumb_
      _at all (a real, separate gap — noted below, not fixed in this pass, since adding_
      _one is new feature work, not a routing-constants change)._
      _Verified live: all touched pages return 200, both fixed broken links confirmed_
      _pointing at the real PLP. Typecheck + lint clean (pre-existing, unrelated errors_
      _confirmed via diff: `AccountPageShell.tsx`/`Navbar.tsx` set-state-in-effect,_
      _Footer.tsx's untouched Locations `<a>` tag)._
- [x] Accessory PDPs (`AccessoryDetail.tsx`) have no breadcrumb back to the PLP at all,
      unlike container PDPs (`ProductVariantShell.tsx`). Found 2026-07-17 while tracing
      the routes.ts refactor above — not fixed there since it's a new UI addition, not a
      path-constant swap.
      _Done 2026-07-17 — added a Home / Container Accessories / {title} breadcrumb,_
      _matching `ProductVariantShell.tsx`'s exact visual style, linking to_
      _`ROUTES.PLP_ACCESSORIES`. Also fixed a real bug found in the same file: the_
      _"Call Us" button dialed a hardcoded `+18886780313` — a different number than the_
      _site's actual `CONTACT_NUMBER` (888-977-9085) used everywhere else — now uses the_
      _shared constant. Typecheck + lint clean; verified live (breadcrumb text + correct_
      _phone number both present in the real rendered page)._
- [x] **Wire real Suspense fallbacks on the PLP.** Both boundaries in
      `sale-shipping-containers/page.tsx` currently have no `fallback` at all — and a
      fully-built, dimension-matched `PageSkeleton.tsx` component already exists right next
      to them, just not imported/used.
      _Done 2026-07-17 — the page-level boundary (wraps the whole async page, fires before_
      _anything including the real breadcrumb/header has rendered) now uses the full_
      _`PageSkeleton`. Split a new `ResultsSkeleton` (sidebar + product grid only, no_
      _breadcrumb/header) out of it for the inner boundary around_
      _`InstantSearchSection`, so that one doesn't duplicate the real breadcrumb/header_
      _already on screen by the time it could suspend. Typecheck + lint clean; page_
      _verified live (200)._
- [x] **Improve the PDP's Suspense fallback** — currently a generic pulsing box, not shaped
      like the final content.
      _Done 2026-07-17 — new `PdpSkeleton.tsx` mirrors the real two-column layout_
      _(breadcrumb, gallery + quick-specs stat bar on one side, title/price/CTA stack on_
      _the other). Close enough in shape for both real PDP layouts it can precede_
      _(`ProductVariantShell` for containers, `AccessoryDetail` for accessories) —_
      _exact per-layout fidelity isn't achievable from one shared fallback, but this is a_
      _meaningful improvement over the prior single pulsing div either way. Typecheck +_
      _lint clean; verified live against one of each product type (200)._
- [ ] **Decide the homepage's direction**: it's almost entirely static marketing content,
      including a `QuoteForm` whose submit button doesn't call any backend at all. Either
      wire it to a real lead-capture endpoint or explicitly accept it as decorative.
      **Blocked, pending 2026-07-18** — worse than originally described: the submit button
      (`onClick={() => setSubmitted(true)}`, `QuoteForm.tsx`) fakes a successful
      submission ("✓ Quote Request Sent — We'll be in touch!") while the collected
      name/email/phone/ZIP/container details go nowhere — actively misleading, not just
      inert. Real fix is planned to be **Zoho Forms** integration, but the client hasn't
      provided the Zoho account/form details yet. Not actionable until those arrive —
      revisit once provided.
- [x] **Decide between the two homepage reviews carousels** — `ReviewsSection.tsx`
      (static) and `ReviewsSectionLive.tsx` (real backend data) are intentionally rendered
      side by side right now for comparison; pick one before shipping.
      _Decided 2026-07-18 — retain both, for now. No code change; moved to §2 as a_
      _confirmed decision so future audits stop flagging this as pending._
- [x] **The PDP's "You May Also Need" section was fully fake, not just static.**
      `ProductDetail.tsx` rendered a hardcoded 4-item `staticRelatedProducts` array with
      placeholder prices (`"From $2,000"`, `"Call for Price"`) and CTA buttons with zero
      `onClick` handlers — while the page *does* fetch real `related_products` from ES
      (`page.tsx`), which was only consumed internally by `ProductInfoPanel` for variant-
      swapping, never rendered as an actual related-items display.
      _Done 2026-07-18 — now renders the real `relatedProducts` prop (same-location_
      _containers from ES), filtering out whichever variant is currently on screen and_
      _capping at 4. Each card is a real `<Link>` to the real PDP (`ROUTES.PRODUCT`),_
      _with the real product image, title, and `sale_price` — no more fabricated data or_
      _dead buttons. The whole section now hides itself when there's nothing real to show_
      _(0 related products) rather than rendering empty or falling back to fake data._
      _Verified live: 4 genuinely different real products with real prices/images/links,_
      _confirmed via Playwright (not just curl, since this needs real rendering)._
      _Typecheck + lint clean._
- [x] **`revalidateTag`/`updateTag` aren't wired to any real mutation.**
      `actions/cache.ts`'s `revalidateAll()`/`updateAll()` exist but are never called
      anywhere in the app; the only real callers of `revalidateTag` are the two webhook
      routes. `CACHE_TAGS.ORDERS`/`USERS` are declared in `config/cache.ts` but never
      attached via `cacheTag()` to anything.
      _Investigated 2026-07-18, deliberately not "fixed" — traced every `cacheTag()` call_
      _in the codebase (`grep -rn "cacheTag(" services/ app/`) and found there is currently_
      _no real gap to wire, not just an oversight. Every live `'use cache'` read in this app_
      _is product/search/WP-proxy data (`search.service.ts`, `wp-proxy.service.ts`,_
      _`geoapify.service.ts`) — data that only ever changes externally (WordPress/ES),_
      _which is exactly what the 2 existing webhook routes already correctly invalidate._
      _The one other `cacheTag(CACHE_TAGS.REVIEWS)` (`review.service.ts`'s_
      _`getReviewsByVariant`) powers `CustomerReviews.tsx`, which is commented out — the_
      _*live* PDP reviews path (`ReviewsCarousel.tsx` → `listProductReviews`/_
      _`createProductReview`) talks to a completely different backend (OSS Django, not_
      _WordPress) via plain `fetch()`, with no `'use cache'` involved at all. Everything a_
      _user actually mutates in this app today — cart, profile/address, orders, the live_
      _review flow — is fetched client-side, never through `'use cache'`, so there is_
      _structurally nothing for a Server Action to invalidate. Wiring `updateTag` onto,_
      _say, `createProductReview()` would touch a cache tag (`REVIEWS`) that no live_
      _component even reads — cosmetically "done" but functionally meaningless, the same_
      _class of fake-completeness this audit has been catching elsewhere. `CACHE_TAGS.ORDERS`/_
      _`USERS` remain correctly forward-looking (matches AGENTS.md's own documented tag_
      _table) for if/when an orders or profile view is ever rebuilt as a cached Server_
      _Component read — nothing to attach them to yet. Revisit this item for real once such_
      _a read exists, not before._
- [x] **Dead `href="#"` consent-checkbox links in checkout.**
      `CheckoutClient.tsx`'s "Delivery Requirement," "terms and conditions," and "privacy
      policy" consent-checkbox links all went nowhere (`href="#"`). The real WordPress
      pages exist and already resolve (`/terms`, `/privacy`) — just needed pointing at them.
      _Done 2026-07-18 — "Delivery Requirement" now links to `/shipping-policy` (closest_
      _real match — its title is literally "Shipping Policy | Shipping Container_
      _Delivery"), "terms and conditions" to `/terms`, both "privacy policy" instances to_
      _`/privacy`. All 4 use `<Link target="_blank" rel="noopener noreferrer">` rather_
      _than a same-tab navigation, so clicking one mid-checkout doesn't lose in-progress_
      _form state. Verified live with a real cart item — all 4 links present with the_
      _correct hrefs and target="_blank"._
- [x] **Raw `<img>` in `CheckoutClient.tsx`** (order-summary line-item thumbnail), carrying
      an `eslint-disable-next-line @next/next/no-img-element` that acknowledged but didn't
      fix the violation.
      _Done 2026-07-18 — swapped to `next/image` (fixed 56×56 thumbnail, matching its_
      _existing `h-14 w-14` container). Verified live: renders correctly with a real image_
      _URL. Typecheck + lint clean._

### Lower priority / needs a product decision first

- [x] Product comparison — build the feature or remove the dead "Compare" button on the PDP.
      _Decided 2026-07-18 — no client requirement yet. Dead button removed (see_
      _`ProductInfoPanel.tsx`, commit `1356d1c`) rather than left non-functional._
- [x] Wishlist / save for later — build the feature (button + persistence) or remove the
      dead "Save to Wishlist" button.
      _Done 2026-07-18 — built client-side only, no backend exists for this. New_
      _`context/WishlistContext.tsx` (localStorage, reducer-based to stay hydration-safe —_
      _same pattern `CartContext` already uses) + `hooks/useWishlist.ts`. PDP's "Save to_
      _Wishlist" button now toggles real state (filled heart + "Saved to Wishlist" label_
      _when active). New `/wishlist` page (`ROUTES.WISHLIST`, robots-disallowed/noindexed_
      _like cart/checkout) lists saved items with "View Product" + "Remove" — deliberately_
      _no "Add to Cart" from this page, since a `WishlistItem` doesn't carry the full ES_
      _hit `CartItem.rawHit` needs for real backend cart sync; faking it would silently_
      _fail the same way the PDP's fake related-products section did. New_
      _`components/layout/WishlistButton.tsx` (heart + count badge) sits next to_
      `CartButton` _in the Navbar for discovery regardless of login state — persistence_
      _is intentionally device-local only (no cross-device sync possible without a_
      _backend), called out directly in the page's own copy. Verified live end-to-end:_
      _toggle, localStorage persistence, nav badge count, wishlist page listing, remove-_
      _to-empty-state. Typecheck + lint clean (pre-existing unrelated errors confirmed via_
      _diff)._
- [x] Social sharing — build or remove the dead "Share" button on the PDP.
      _Done 2026-07-18 — no backend needed at all, purely client-side. New_
      _`components/product/ShareButton.tsx`: uses the native Web Share API_
      _(`navigator.share`) on mobile/supporting browsers; falls back to a small dropdown_
      _(Facebook, X, WhatsApp, Email share intents + Copy Link) on desktop. `lucide-react`_
      _doesn't ship Facebook/X brand icons, so those two rows use a generic external-link_
      _icon rather than a wrong/placeholder brand mark. Caught and fixed a real robustness_
      _gap while testing: `copyLink()` had no error handling — a headless-browser test_
      _confirmed `navigator.clipboard.writeText()` throwing (permission denied) would_
      _silently do nothing; wrapped in try/catch so it fails quietly instead of an_
      _unhandled rejection, with no fake "Copied!" confirmation shown on failure._
      _Verified live: menu opens, all 4 share links carry the correct encoded product_
      _title/URL, copy-link shows real "Copied!" confirmation when clipboard access is_
      _granted, closes on outside click and Escape. Typecheck + lint clean._
- [x] Site-wide search UI — the ES backend already supports free-text query; just needs a
      search box added to the header/nav.
      _Decided 2026-07-18 — client doesn't need header/nav-level site-wide search:_
      _containers are browsed by ZIP/location, not searched, and the catalog is only_
      _containers + accessories + related items. Redirected to what's actually useful:_
      _a search box scoped to the PLP's accessories view (`ptype=accessories`), which has_
      _no location dimension and was the one real gap. New `AccessorySearchBox` in_
      _`InstantSearchSection.tsx`, using `useSearchBox()` — `makeSearchClient()` already_
      _forwarded `params.query` untouched, and `search.service.ts`'s ES query already did_
      _a real `multi_match` fuzzy search (title/tags/sku/custom_fields/category) when_
      _non-empty, so this was 100% a UI gap, not a backend one. 300ms-debounced, local_
      _input state adjusted during render (not an effect) to stay in sync if_
      _InstantSearch ever resets the query externally. Shown only on the accessories view,_
      _confirmed absent on the container views. Verified live: searching "lock" correctly_
      _returned real lock-related products (Block Lock, Lock Box, etc.) via fuzzy match._
      _Typecheck + lint clean (2 pre-existing findings elsewhere in the file, confirmed_
      _unrelated via diff)._
- [x] Recently viewed products — net-new feature if wanted.
      _Decided 2026-07-18 — not required by the client. No action._
- [ ] **Live chat — build or remove the marketing claim.** `TrustStrip.tsx` on the homepage
      explicitly advertises "Phone, Email & Chat" support, but no chat implementation
      exists anywhere. This is a false claim to customers today, worth fixing either way.
      _2026-07-18 — client hasn't decided on live chat itself yet; leaving both the_
      _feature and the marketing copy as-is until they do. Still an open false-claim risk_
      _in the meantime — revisit the copy specifically if the chat decision stalls long._
- [x] Multiple payment methods — the Braintree Drop-in is currently configured card-only;
      enabling PayPal/Venmo/Apple Pay may be cheap since the infra already exists.
      _Decided 2026-07-18 — Braintree card-only for now. No action._
- [x] Newsletter signup UI — **done 2026-07-24 (scope settled with the client).**
      Built the registered-user half: `/my-account/newsletter`
      (`NewsletterPanel.tsx`), linked in the account sidebar, with subscribed/not-subscribed
      states and a Subscribe/Unsubscribe button wired to the existing `lib/newsletter.ts`.
      Route registers and renders (200, noindex); auth-gated via `AccountPageShell` like the
      other account pages.
      State is authoritative, not guessed: the panel reads `user.isSubscribed`, mapped from
      the backend profile's `is_subscribed` field (`normalizeUser` in `user.service.ts`), and
      writes the new value back through the auth context after a toggle so it persists.
      _**Correction to the first 2026-07-24 note:** the "no way to read status" gap was mine —_
      _`is_subscribed` was on the profile all along, our normalizer just dropped it. The_
      _client confirmed it's a real backend field (traced end-to-end in the reference app),_
      _and it's the property every newsletter surface there keys on. The localStorage_
      _best-effort was replaced with this. **Confirmed working by the client 2026-07-24** —_
      _the page reads `is_subscribed` correctly and the subscribe/unsubscribe toggle behaves_
      _against the real backend._
      _**Public homepage widget — descoped 2026-07-24 (client):** not wanted for now. The_
      _backend handles subscription status, and the registered-user page above is all the_
      _client requires at this point, so there's no open frontend work left here._
      _**Residual (not needed, noted for the future):** `is_subscribed` only exists for_
      _logged-in users; a guest's status by email still isn't readable (subscriber routes are_
      _write-only). Only relevant if a public/guest widget is ever wanted._
- [x] Wire the PDP's stock/availability badge to the real `variants[].qty` field instead
      of always showing a hardcoded "In Stock — Ready to Ship".
      _Done 2026-07-18 — new shared `isInStockHit()` (`lib/pricing.ts`, alongside the_
      _other `ProductHit` helpers): reads `variants[0].qty`, only an explicit `0` counts_
      _as out of stock — missing/undefined defaults to in-stock, since a field simply not_
      _populated on a hit is far more likely than a genuinely sold-out product in this_
      _catalog, and a false "Out of Stock" costs a real sale. Wired into all 3 places that_
      _previously hardcoded "In Stock": `ProductImageGallery`'s badge (shared by both_
      _container and accessory PDPs), `ProductInfoPanel`'s availability banner (containers),_
      _and `AccessoryDetail`'s own separate stock chip (accessories). Deliberately scoped_
      _to the badge only, per the tracker item — did not also disable "Add to Cart" on_
      _out-of-stock, a separate behavioral change not asked for here._
      _Verified: real in-stock product (qty 25) renders unchanged. No genuinely out-of-_
      _stock (`qty: 0`) product exists in the current catalog to test the other branch_
      _live end-to-end (checked a 50-item sample), and the data is fetched server-side_
      _directly from Elasticsearch, so it can't be intercepted/mocked via a browser-level_
      _tool. Verified the boundary logic directly instead (undefined/null/0/positive all_
      _produce the correct boolean) plus code review of the 3 straightforward ternary_
      _branches. Typecheck + lint clean (pre-existing, unrelated findings confirmed via_
      _diff in `ProductInfoPanel.tsx`/`ProductImageGallery.tsx`)._
- [x] Evaluate whether any data needs the `cacheLife('seconds')` tier — currently unused.
      _Done 2026-07-18 — mapped every `cacheLife()` call in the app_
      _(`grep -rn "cacheLife(" services/ app/`): PLP search/listings (`cachedEsSearch`,_
      _`cachedCustomFieldsSearch`) use `'minutes'`, individual product/order/WP-proxy/_
      _reviews lookups use `'hours'`, geo/depot data uses `'days'`. This is a coherent_
      _tiering that already matches each source's real update cadence — no data source in_
      _this app has a genuine sub-minute freshness requirement, including the stock/qty_
      _display just wired up (`isInStockHit`, same tracker file above), which reuses these_
      _same cached functions and — by its own design — defaults safely rather than needing_
      _real-time accuracy. Concluding "seconds" is correctly unused, not a gap; nothing to_
      _implement._
- [x] Fix 2 default-import style violations (`braintree` in `payment.service.ts`, `cheerio`
      in `wp-proxy.service.ts`) — cosmetic/convention only, both server-only, no bundle impact.
      _Done 2026-07-18 — `payment.service.ts` now imports `{ BraintreeGateway, Environment,_
      _type Transaction }`; `wp-proxy.service.ts` imports `{ load }`. `@types/braintree`_
      _uses an `export =` namespace, so this needed care — verified it actually typechecks_
      _(it does, `esModuleInterop` is on) AND still works at runtime, not just compiles:_
      _`/api/braintree_token` returns the same "not configured" error as before (no import_
      _crash), and `/terms` (which exercises `cheerio.load` through the WP proxy) still_
      _renders real content._
- [x] PLP ratings/review-count sync — ~~see memory `backend-reminder-plp-ratings.md`~~
      (that memory file no longer exists; the reference was dangling).
      _Resolved 2026-07-21 by the backend, then wired here. The ES index now carries_
      _`ratings: { rating, review_count }` instead of a bare number, so the PLP card's_
      _hardcoded `reviews: 0` reads a real count and the PDP shows "4.0 · 3 Reviews"._
      _Verified live end-to-end: ES → `/api/search` → PLP/PDP all carry the object._
      _The shape change also **broke** the app until fixed — see the next item._
- [x] **New 2026-07-17 — Account deletion / data export has zero implementation** anywhere
      (no route, form, or backend call). A standard GDPR/CCPA-style expectation for a real
      storefront; needs a product decision on whether/how to build it, not just a code fix.
      _Decided 2026-07-18 — no requirement from the client. No action._
- [x] **New 2026-07-17 — Back-in-stock alerts and price-drop alerts are pure, total gaps** —
      no UI, hook, or backend call for either. Net-new features if wanted; not previously
      itemized explicitly (distinct from the general "notifications" area, which was
      previously only represented by the stock-badge/newsletter items above).
      _Decided 2026-07-18 — not required by the client; if built at all, it's expected to_
      _be a backend-driven subscriber notification (for users already subscribed), not a_
      _frontend feature. No action here._
- [x] **New 2026-07-17 — clarify who owns order confirmation emails.** No email-sending
      code (SendGrid/nodemailer/SMTP/etc.) exists anywhere in this Next.js app.
      _Answered 2026-07-24 (client): **YES, Django handles order confirmation emails.** So_
      _no email code is expected on the Next.js side — the front end's job ends at creating_
      _the order; Django owns the notification. Closed._
- [x] **Dead "View All FAQs →" link on the PDP** (`ProductDetail.tsx`, `href="#"`).
      _Done 2026-07-18 — links to the real WordPress FAQ page (`/shipping-container-faqs`,_
      _confirmed live, real content) in a new tab. Verified live._
- [ ] **PLP product cards never pass `priority`** to their `next/image` calls, including
      the first/likely-LCP card. Lower severity since the grid renders client-side via
      `react-instantsearch` rather than via SSR preload hints, but still worth setting on
      the first result.
      _Investigated 2026-07-18, deliberately not fixed — two real blockers, not just_
      _effort. (1) `ProductCard.tsx` (one of the two files originally named here) is_
      _confirmed dead code, never imported anywhere — the real live container cards_
      _render via `ProductHit` inside `InstantSearchSection.tsx`. (2) Both that component_
      _and the real, live `AccessoryCard.tsx` render through react-instantsearch's_
      _`<Hits hitComponent={({ hit }) => ...}>`, whose render prop doesn't expose an item_
      _index — there's no clean way to know "this is the first card" without replacing_
      _`<Hits>` with a manual `useHits()` + `.map()` re-implementation, which risks_
      _regressing pagination/insights/empty-state behavior `<Hits>` currently provides for_
      _free, in exchange for a CWV nit the audit itself already scored as low-severity_
      _(client-rendered post-hydration, not part of the SSR preload path anyway). Left_
      _open rather than force a risky change to the PLP's core search UI._
- [x] **Cosmetic: stray `ref.md` scaffold files inside `app/`**
      (`app/(market)/cart/ref.md`, `app/(market)/my-account/ref.md`) — old component-spec
      notes from an earlier build pass, not real code, but violate the "`app/` holds only
      route files" convention in spirit.
      _Done 2026-07-18 — read both first: genuine historical build-spec/reference docs_
      _(one's a standalone design-mockup component, the other is written build_
      _instructions + starter code), not dead code — moved rather than deleted, matching_
      _this repo's own convention for this kind of doc (`MY_ACCOUNT_PROFILE.md`,_
      _`ABANDONED_CART_EXPLAINER.md`, etc.). Now `CART_PAGE_REF.md` and_
      _`MY_ACCOUNT_PAGE_REF.md` — relocated to `docs/reference/` on 2026-07-20._
- [x] **Cosmetic: `TrustedBySection.tsx`'s partner-logo alt text is generic**
      (`"Trusted partner logo 1"`–`"9"`), so authenticity of the social-proof claim can't
      be verified from the code alone — worth real, named alt text if these are genuine
      client logos.
      _Done 2026-07-18 — checked: the CDN filenames (e.g. `download-1-150x150-1.webp`)_
      _carry no real company names to attribute, so specific named alt text would have to_
      _be fabricated (worse than the placeholder). Used the actually-correct fix instead:_
      _`alt=""` on every logo — WCAG's recommended pattern for repeated decorative images_
      _inside a group that already has its own `aria-label` ("Trusted organizations_
      _carousel"), which already conveys the meaning. Documented why in a code comment so_
      _this doesn't read as an oversight later._
- [x] **The `ref.md` scaffold-file sweep on 2026-07-17 was incomplete.**
      Found by 2 independent research passes in this audit: 4 more stray reference files
      still lived inside `app/`, same "`app/` holds only route files" violation as the 2
      already moved out.
      _Done 2026-07-18 — moved all 4 out of `app/`: `CHECKOUT_PAGE_REF.md`,_
      _`PLP_PAGE_REF.md`, `HOME_PAGE_REF.html`, `HOME_PAGE_REF_MOBILE.html`_
      _(relocated again to `docs/reference/` on 2026-07-20). Verified live:_
      _`/checkout`, `/sale-shipping-containers`, and `/` all still return 200._
- [x] **Orphaned empty route scaffold**: `app/(market)/account/orders/`
      contained only a `.gitkeep`, present since the initial commit — matched the
      *aspirational* folder structure documented in `AGENTS.md` rather than the app's
      real, actually-used convention (`my-account/orders/`).
      _Done 2026-07-18 — deleted the empty folder._
- [x] **New 2026-07-18 — Address book is not a true multi-address book.**
      `app/(market)/my-account/edit-address/_components/AddressForm.tsx` supports exactly
      one billing + one shipping address baked into the user profile.
      _Decided 2026-07-24 (client): **edit-address stays singular** — one billing + one_
      _shipping, as built. Multi-address support is not wanted, so this is not a gap; it's_
      _the intended design. Closed._
- [ ] **New 2026-07-18 — no shipment/carrier tracking number in Order History.**
      `my-account/orders` shows real order status (pending/paid/shipped/delivered/etc.)
      but no `tracking_number`/carrier field or link exists anywhere (confirmed via grep —
      zero matches). Distinct from the existing "order status updates" item, which is
      already real. Needs a product decision — likely also needs the backend to start
      returning a tracking number/carrier field, which it may not do today.
- [x] **`Recaptcha.tsx` was using the wrong `next/script` strategy.**
      It was rendered with `strategy="lazyOnload"`, but its only 2 real usages
      (`CheckoutClient.tsx`, `RegisterForm.tsx`) need the widget interactive *before* the
      user submits the form — not the deferred analytics/chat-widget case AGENTS.md's own
      rule 13 describes `lazyOnload` for.
      _Done 2026-07-18 — switched to `strategy="afterInteractive"`. Not independently_
      _live-testable in this environment (`NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is blank, so_
      _the widget doesn't render at all today) — typecheck + lint clean on a single_
      _well-documented Next.js prop value, no custom logic involved._
