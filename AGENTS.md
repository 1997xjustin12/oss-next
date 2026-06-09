<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# E-Commerce Project Guidelines

## Folder Structure

```
oss-next/
├── app/                          # Next.js App Router — routes only
│   ├── (market)/                 # Public storefront route group
│   │   ├── (home)/               # Homepage
│   │   ├── products/
│   │   │   └── [slug]/           # Product detail page
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── account/
│   │       └── orders/
│   ├── (admin)/                  # Admin dashboard route group (auth-gated)
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   └── customers/
│   └── api/                      # Route Handlers
│       ├── products/
│       ├── cart/
│       ├── orders/
│       └── webhooks/             # Payment provider webhooks (e.g. Stripe)
│
├── components/                   # Shared React components (NOT route-specific)
│   ├── ui/                       # Primitive/base components: Button, Input, Badge, Modal
│   ├── layout/                   # Header, Footer, Nav, Sidebar, Breadcrumb
│   ├── product/                  # ProductCard, ProductGrid, ProductDetail, ProductImages
│   ├── cart/                     # CartDrawer, CartItem, CartSummary
│   └── checkout/                 # CheckoutForm, OrderSummary, PaymentStep
│
├── context/                      # React Context providers
│   ├── CartContext.tsx
│   ├── AuthContext.tsx
│   └── WishlistContext.tsx
│
├── hooks/                        # Custom React hooks
│   ├── useCart.ts
│   ├── useAuth.ts
│   ├── useProduct.ts
│   └── useWishlist.ts
│
├── lib/                          # Utilities and third-party wrappers
│   ├── utils.ts                  # General helpers (cn(), slugify(), etc.)
│   ├── formatters.ts             # Currency, date, number formatters
│   ├── validators.ts             # Zod schemas / form validation
│   └── constants.ts              # App-wide magic values
│
├── actions/                      # Next.js Server Actions (mutations)
│   ├── cart.ts
│   ├── order.ts
│   ├── auth.ts
│   └── product.ts
│
├── services/                     # Data-fetching / external API layer (reads)
│   ├── product.service.ts
│   ├── order.service.ts
│   └── user.service.ts
│
├── types/                        # TypeScript type & interface definitions
│   ├── product.ts
│   ├── cart.ts
│   ├── order.ts
│   ├── user.ts
│   └── index.ts                  # Re-exports everything
│
├── config/                       # Static app configuration
│   ├── site.ts                   # Site name, URL, SEO defaults
│   └── routes.ts                 # Typed route path constants
│
└── public/
    ├── images/
    └── icons/
```

### Rules
- `app/` holds **only** route files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, route handlers). No shared logic.
- Route-specific components that are **not** reused elsewhere live co-located inside their route folder (e.g. `app/(market)/checkout/_components/`).
- `components/` is for components shared across two or more routes.
- Never import from `app/` into `components/`, `lib/`, `hooks/`, etc. — dependency flows inward only.

---

## Naming Conventions

### Files & Folders
| Kind | Convention | Example |
|---|---|---|
| Route folders | `kebab-case` | `products/`, `order-history/` |
| Component files | `PascalCase.tsx` | `ProductCard.tsx` |
| Hook files | `camelCase.ts` prefixed `use` | `useCart.ts` |
| Utility / lib files | `camelCase.ts` | `formatters.ts` |
| Server action files | `camelCase.ts` | `cart.ts` |
| Service files | `camelCase.service.ts` | `product.service.ts` |
| Type files | `camelCase.ts` | `product.ts` |
| Context files | `PascalCase.tsx` | `CartContext.tsx` |

### Code Identifiers
| Kind | Convention | Example |
|---|---|---|
| React components | `PascalCase` named export | `export function ProductCard() {}` |
| Custom hooks | `camelCase`, `use` prefix | `export function useCart() {}` |
| Context object | `PascalCase`, `Context` suffix | `export const CartContext` |
| Context provider | `PascalCase`, `Provider` suffix | `export function CartProvider() {}` |
| Server actions | `camelCase`, verb-first | `addToCart`, `placeOrder`, `deleteProduct` |
| Service functions | `camelCase`, verb-first | `fetchProducts`, `getOrderById` |
| TypeScript types | `PascalCase` | `type Product`, `type CartItem` |
| TypeScript interfaces | `PascalCase`, no `I` prefix | `interface CheckoutFormData` |
| Constants (fixed values) | `SCREAMING_SNAKE_CASE` | `MAX_CART_ITEMS`, `FREE_SHIPPING_THRESHOLD` |
| Config objects / enums | `PascalCase` | `OrderStatus`, `SiteConfig` |
| CSS class helpers | `cn()` from `lib/utils.ts` via `clsx` + `tailwind-merge` |

### Component Rules
- One component per file. File name = component name.
- Use **named exports** only — no default exports for components (makes refactoring and auto-import reliable).
- Props types are defined inline above the component as `type Props = { ... }` or `interface Props`.
- Server Components are the default; add `'use client'` only when the component needs browser APIs, event handlers, or React state/effects.

### Import Order (enforced by ESLint)
1. React / Next.js core
2. Third-party packages
3. Internal aliases (`@/components`, `@/lib`, etc.)
4. Relative imports (`./`, `../`)
5. Types (`import type ...`)

### Path Aliases (configure in `tsconfig.json`)
```jsonc
{
  "paths": {
    "@/components/*": ["components/*"],
    "@/lib/*":        ["lib/*"],
    "@/hooks/*":      ["hooks/*"],
    "@/context/*":    ["context/*"],
    "@/actions/*":    ["actions/*"],
    "@/services/*":   ["services/*"],
    "@/types/*":      ["types/*"],
    "@/config/*":     ["config/*"]
  }
}
```

---

## State Management
- **Server state** (products, orders, user data): fetch in Server Components or via `services/`; cache with `'use cache'` + `cacheTag`.
- **UI/client state** (cart, wishlist, modals): React Context in `context/` for global; `useState`/`useReducer` locally.
- Add a dedicated state library (Zustand, Jotai) only if Context performance becomes a measurable problem.

## Data Flow
```
Server Component  →  services/  →  external API / DB  →  'use cache' + cacheTag
Client Component  →  actions/   →  server mutation    →  updateTag / revalidateTag
Client Component  →  context/   →  local UI state
```

---

## Performance, SEO & Quality Non-Negotiables

These rules apply to **every query and every file** — do not wait to be asked.

### 1. Core Web Vitals — always a priority
- LCP: `<Image priority>` on every above-the-fold image. Never use `<img>`.
- CLS: explicit `width`/`height` on all media; use `next/font` — never `<link>` for fonts.
- INP: keep Client Components small and interaction handlers lightweight.

### 2. PageSpeed / Performance
- **`cacheComponents: true` is enabled** — use `'use cache'` on every async data function and async page/component.
- Choose `cacheLife` profile based on how often data changes: `'seconds'` for inventory, `'minutes'` for prices, `'hours'` for product details, `'days'` for static content.
- Wrap uncached async sections in `<Suspense>` with skeleton fallbacks — never block the whole page on one slow fetch.
- Tree-shake all imports (`import { x } from 'pkg'`, never `import pkg from 'pkg'`).
- Third-party scripts only via `next/script` with `strategy="lazyOnload"` unless critical.
- Avoid `force-dynamic` except for pages that truly require per-request data (cart, checkout, account).

### 3. SEO — every page
- Every `page.tsx` **must** export `metadata` or `generateMetadata`. Minimum fields: `title`, `description`, `canonical` (via `alternates.canonical`), `openGraph.images`.
- Product, category, and homepage pages must include a `<script type="application/ld+json">` with appropriate JSON-LD schema (Product, BreadcrumbList, Organization).
- Always use `<Link>` from `next/link` for internal navigation — never raw `<a>`.
- Use semantic HTML: `<main>`, `<nav>`, `<header>`, `<footer>`, `<article>`, `<section>` — never `<div>` for structural landmarks.

### 4. Server Components by default
- Every component is a Server Component unless it needs browser APIs, event handlers, or React state/effects.
- Add `'use client'` only when necessary. Prefer splitting: keep the data-fetching shell as a Server Component and push `'use client'` to the smallest possible leaf.

### 5. Images
- Always `next/image`. Required props: `src`, `alt`, `width`, `height`. Add `priority` to the LCP image on each page.

### 6. Fonts
- Always `next/font/google` or `next/font/local`. Never `<link rel="stylesheet">` for fonts.

### 7. Metadata
- Every `page.tsx` exports `metadata` (static) or `generateMetadata` (dynamic).
- `generateMetadata` must not block the page — fetch metadata in parallel with page data using `Promise.all`.

### 8. Structured Data (JSON-LD)
- Homepage: `Organization` + `WebSite` with `SearchAction`.
- Product page: `Product` with `offers`, `aggregateRating`.
- Category/listing page: `BreadcrumbList`.
- Implement via a `<JsonLd>` Server Component in `components/shared/JsonLd.tsx`.

### 9. Rendering strategy
- Default: static or ISR via `'use cache'` + `cacheLife`.
- Dynamic (`force-dynamic` or no cache): only cart, checkout, account pages.
- Prefer tag-based revalidation over path-based (`revalidateTag` / `updateTag` > `revalidatePath`).

### 10. Navigation
- `<Link>` from `next/link` for all internal routes.
- Route path strings live in `config/routes.ts` as typed constants — never hard-code paths inline.

### 11. Suspense
- Every async component that streams at request time must be wrapped in `<Suspense fallback={<Skeleton />}>`.
- Skeleton dimensions must match the final content to prevent CLS.

### 12. Semantic HTML
- Use structural elements (`<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`, `<article>`) instead of generic `<div>` for layout landmarks.
- All interactive elements must be focusable and have `aria-label` when the visible label is insufficient.

### 13. Scripts
- `next/script` with `strategy="lazyOnload"` for analytics, chat widgets, and other non-critical third-party scripts.

---

## Caching Conventions

> **This project uses Next.js 16 Cache Components (`cacheComponents: true`).  
> Do NOT use `unstable_cache` — it is superseded by the `'use cache'` directive.**

### Pattern for every async data function
```ts
import { cacheLife, cacheTag } from 'next/cache';
import { CACHE_TAGS } from '@/config/cache';

export async function getProducts() {
  'use cache';
  cacheLife('hours');
  // Always include CACHE_TAGS.ALL so revalidateAll() reaches this function
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRODUCTS);
  return db.query('SELECT * FROM products');
}
```

### Cache tags — defined in `config/cache.ts`
| Tag constant | Value | Scope |
|---|---|---|
| `CACHE_TAGS.ALL` | `'store'` | **Global** — revalidating this busts everything |
| `CACHE_TAGS.PRODUCTS` | `'products'` | All product data |
| `CACHE_TAGS.CATEGORIES` | `'categories'` | Category/navigation data |
| `CACHE_TAGS.HOMEPAGE` | `'homepage'` | Homepage-specific content |
| `CACHE_TAGS.ORDERS` | `'orders'` | Order data |
| `CACHE_TAGS.USERS` | `'users'` | User/session data |

### Revalidating caches

**From a Server Action (mutation):**
```ts
import { updateTag } from 'next/cache';   // immediate — user sees their change
import { revalidateTag } from 'next/cache'; // stale-while-revalidate — background refresh

// Bust a specific domain
updateTag(CACHE_TAGS.PRODUCTS);

// Bust everything at once
import { revalidateAll } from '@/actions/cache';
await revalidateAll();
```

**From a webhook / external trigger:**
```
POST /api/revalidate
Headers: x-revalidate-token: <REVALIDATE_SECRET>
Body: {}                        → busts all (CACHE_TAGS.ALL)
Body: { "tag": "products" }    → busts products only
```

### When to use `updateTag` vs `revalidateTag`
| | `updateTag` | `revalidateTag` |
|---|---|---|
| Where | Server Actions only | Server Actions + Route Handlers |
| Behavior | Immediate expiry | Stale-while-revalidate |
| Use when | User must see their own change immediately | Background refresh is acceptable |
