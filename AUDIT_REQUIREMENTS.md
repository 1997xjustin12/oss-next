# OSS-Next Completion Audit — Requirements & Task Tracker

Single source of truth for re-running the completion audit and tracking the resulting task
list. Update this file after every audit pass — don't let it go stale (same convention as
`API_INTEGRATION_STATUS.md`/`API_TRIGGER_CHECKLIST.md` at the repo root).

---

## 1. Scope

**In scope** (this Next.js app owns these, everything else stays on WordPress):
Home, Product Detail Page (PDP), Product Listing Page (PLP), My Account + subpages,
Login/Register, Cart, Checkout.

**Out of scope**: everything else — served from the existing WordPress/WooCommerce site
(onsitestorage.com) via the headless proxy at `app/(market)/[...slug]/page.tsx`.

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

## 5. Latest Audit Results — 2026-07-15

| Dimension | Score |
|---|---|
| **Overall (blended)** | **~65%** |
| Functional Completeness (8 areas) | ~62% |
| E-Commerce Feature Coverage (41 items) | ~65% |
| Core Web Vitals / PageSpeed / SEO | ~68% |

Full detail (per-area breakdown, all 41 feature rows, all CWV/SEO rows) lives in the audit
artifact generated this session — not duplicated here to avoid this file going stale; §6
below is the actionable distillation of it.

---

## 6. Current Task List

Living punch list, regenerated after each audit. Check items off as they're completed;
don't delete completed items until the next full regeneration (so progress is visible).

### High priority

- [ ] **Fix the Django backend checkout crash.** `/api/orders/checkout` throws
      `ValueError: Currency formatting is not possible using the 'C' locale` in
      `app/orders/views.py` line 89 (`locale.currency(...)` with no server locale
      configured) — on EVERY call, and the order saves before the crash. Blocks real
      checkout entirely once Braintree credentials exist. **Backend fix, not fixable here.**
- [ ] **Add `sitemap.ts` and `robots.ts`** covering all static routes plus dynamic
      ES-backed PDP/PLP URLs. Currently zero SEO route declarations exist.
- [ ] **Add `error.tsx`, `not-found.tsx`, and `global-error.tsx`** for the in-scope areas —
      none exist anywhere in the app today.
- [ ] **Rebuild the `/cart` page's fake logic**: replace the `setTimeout`-based loading
      state with a real one, replace the hardcoded `"SAVE10"` client-side coupon check with
      a real backend-validated flow (or remove the coupon box if no coupon system is
      planned), and replace the flat `$195` delivery-fee constant with a real call to
      `/api/orders/get-total` (same endpoint checkout already uses) so the two pages agree.
- [x] **Fix the duplicate `<main>` landmark bug** — nearly every My Account page plus the
      PDP (`ProductDetail.tsx`/`AccessoryDetail.tsx`) render their own `<main>` nested
      inside the shared layout's `<main>`. Remove the nested ones.
      _Done 2026-07-15 — swapped the nested `<main>` for `<div>` in all 11 affected files_
      _(9 my-account pages + ProductDetail.tsx + AccessoryDetail.tsx); verified exactly one_
      _`<main>` renders per page via Playwright, typecheck + lint clean._

### Medium priority

- [ ] **Decide the fate of the 3 inert My Account subpages** (`downloads`,
      `edit-address`, `payment-methods`) — build real functionality (address CRUD backed
      by the real profile API, etc.) or remove/hide the nav entries if not planned.
- [ ] **Add JSON-LD `BreadcrumbList` to the PLP** — a visual breadcrumb exists but no
      structured data, despite this project's own SEO rule requiring it on listing pages.
- [ ] **Build a shared `<JsonLd>` component** (`components/shared/JsonLd.tsx`) and migrate
      the 3 existing hand-rolled inline JSON-LD blocks (home, PDP, checkout) to use it.
- [ ] **Create `config/routes.ts`** with typed path constants; replace the ~30 hardcoded
      internal path string literals found across the app.
- [ ] **Wire real Suspense fallbacks on the PLP.** Both boundaries in
      `sale-shipping-containers/page.tsx` currently have no `fallback` at all — and a
      fully-built, dimension-matched `PageSkeleton.tsx` component already exists right next
      to them, just not imported/used.
- [ ] **Improve the PDP's Suspense fallback** — currently a generic pulsing box, not shaped
      like the final content.
- [ ] **Decide the homepage's direction**: it's almost entirely static marketing content,
      including a `QuoteForm` whose submit button doesn't call any backend at all. Either
      wire it to a real lead-capture endpoint or explicitly accept it as decorative.
- [ ] **Decide between the two homepage reviews carousels** — `ReviewsSection.tsx`
      (static) and `ReviewsSectionLive.tsx` (real backend data) are intentionally rendered
      side by side right now for comparison; pick one before shipping.

### Lower priority / needs a product decision first

- [ ] Product comparison — build the feature or remove the dead "Compare" button on the PDP.
- [ ] Wishlist / save for later — build the feature (button + persistence) or remove the
      dead "Save to Wishlist" button.
- [ ] Social sharing — build or remove the dead "Share" button on the PDP.
- [ ] Site-wide search UI — the ES backend already supports free-text query; just needs a
      search box added to the header/nav.
- [ ] Recently viewed products — net-new feature if wanted.
- [ ] **Live chat — build or remove the marketing claim.** `TrustStrip.tsx` on the homepage
      explicitly advertises "Phone, Email & Chat" support, but no chat implementation
      exists anywhere. This is a false claim to customers today, worth fixing either way.
- [ ] Multiple payment methods — the Braintree Drop-in is currently configured card-only;
      enabling PayPal/Venmo/Apple Pay may be cheap since the infra already exists.
- [ ] Newsletter signup UI — backend utility functions already exist (`lib/newsletter.ts`);
      revisit building a signup form now that checkout has more real estate.
- [ ] Wire the PDP's stock/availability badge to the real `variants[].qty` field instead
      of always showing a hardcoded "In Stock — Ready to Ship".
- [ ] Evaluate whether any data needs the `cacheLife('seconds')` tier — currently unused.
- [ ] Fix 2 default-import style violations (`braintree` in `payment.service.ts`, `cheerio`
      in `wp-proxy.service.ts`) — cosmetic/convention only, both server-only, no bundle impact.
- [ ] PLP ratings/review-count sync — already logged separately, see memory
      `backend-reminder-plp-ratings.md` (backend-side fix, not frontend).
