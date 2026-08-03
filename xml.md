# XML / Feed Endpoints

Three related-but-distinct endpoints. They look similar ("sitemap"/"products")
but serve different consumers — don't mix them up:

| # | Endpoint | Format | For | Auth |
|---|---|---|---|---|
| 1 | `/sitemap.xml` | XML (sitemap) | Search engines (crawl/index) | none — public |
| 2 | `/api/sitemap?type=…` | JSON | Inspecting / sharing the raw URL data | none — public (key added server-side) |
| 3 | `/api/feeds/google.xml` | XML (RSS 2.0 + `g:`) | Google Merchant / Shopping | none — public |

In every example below, replace the host:
- **Local dev:** `http://localhost:3000`
- **Production:** your deployed domain (URLs inside the files use `BASE_URL`, which resolves to the deployed domain in production and to localhost only in dev).

---

## 1. `/sitemap.xml` — the search-engine sitemap

The crawler-ready XML sitemap. This is what you submit to Google Search Console.

```
http://localhost:3000/sitemap.xml
```

**Contains (~11,967 URLs):**
- Static routes: home, `/sale-shipping-containers`, `?ptype=accessories`, `/blogs`
- **Products** (~10,264) — from the backend `?type=products` data, with real `lastmod`
- **WordPress content pages** (~1,700) — from the backend `?type=page` data
- **Blog posts** — from the WP blog API (`onsite-storage` category)

**How it's built:** `app/sitemap.ts` merges four sources in parallel:
- `fetchProductSitemap()` → backend `/api/sitemap/?type=products`
- `fetchPageSitemap()` → backend `/api/sitemap/?type=page`
- `getAllBlogSlugs()` → the WP blog REST API
- static routes (hardcoded)

Content-page paths that collide with a native route (`/`, `/product/*`, `/cart`,
`/blogs`, …) are filtered out, since the catch-all would 404 them.

**Caching:** each source is `'use cache'` + `cacheLife('hours')`, tagged
`PRODUCTS` / `PAGES` / `BLOG`. Bust after a content change:
```
POST /api/revalidate   Header: x-revalidate-token: <REVALIDATE_SECRET>
Body: { "tag": "products" }   # or "pages", or {} for everything
```

**Scale note:** one file, well under Google's 50,000-URL limit. If the catalog
ever passes ~50k, split into a sitemap **index** (`products.xml`, `pages.xml`)
via Next's `generateSitemaps()` — which maps 1:1 onto the backend's `?type=`
design. Not needed today.

---

## 2. `/api/sitemap?type=…` — raw JSON passthrough

A thin proxy of the backend sitemap endpoint. Returns the **raw JSON** (URLs +
`lastmod`), not a crawler sitemap. Use it to inspect the data or hand the URL
list to another tool.

```
http://localhost:3000/api/sitemap?type=products    # ~10,264 products
http://localhost:3000/api/sitemap?type=page         # ~1,703 content pages
http://localhost:3000/api/sitemap                    # defaults to products
```

- `type` is whitelisted (`products` | `page`); anything else → `400`.
- The backend `Api-Key` is attached **server-side**, so you call this with no
  key and it's safe to share publicly. The key never reaches the browser.
- Cached ~1h (`public, max-age=3600, s-maxage=3600, stale-while-revalidate`).
- `502` if the backend is unreachable.

**Do NOT submit this to Google** — it's JSON with only URLs; Search Console wants
`/sitemap.xml` (#1), and Merchant wants `/api/feeds/google.xml` (#3).

Shape:
```json
{ "counts": { "products": 10264 },
  "products": [ { "handle": "…", "path": null, "lastmod": "2026-06-22T…" }, … ] }
```

Backend source (key-protected, server-side only):
`${NEXT_OSS_BACKEND_URL}/api/sitemap/?type=products` with
`Authorization: Api-Key <NEXT_OSS_BACKEND_KEY>` + `X-Store-Domain`.

---

## 3. `/api/feeds/google.xml` — Google Merchant product feed

An RSS 2.0 feed with the `g:` namespace, generated from **Elasticsearch** product
data (real price/image/availability). This is the one Google Merchant Center can
ingest — the sitemap can't, because it has no price/image.

```
http://localhost:3000/api/feeds/google.xml
```

**Contains ~10,192 items**, each with the required Merchant attributes:
`g:id`, `g:title`, `g:description`, `g:link`, `g:image_link`, `g:availability`,
`g:price` (`X.XX USD`), `g:condition` (new/used), `g:brand`,
`g:identifier_exists = no` (containers have no GTIN), `g:product_type`.

Skipped: generic/display-only template pages, and anything missing an image or a
positive price.

**Set-up in Merchant Center:** add a *scheduled fetch* feed pointing at this URL.

**Caveats:**
- **Rental / Rent-to-Own** items (~8k) carry their **monthly** rate as `g:price`,
  labelled `— Rental/Rent-to-Own (monthly)` in the title and description. Google
  Shopping expects a one-time price, so these may draw disapprovals. If Merchant
  pushes back, exclude rental/RTO — it's a one-line filter in `lib/googleFeed.ts`.
- **Cold build** fetches ~10k ES docs and takes ~30s the first time each hour
  (cached hourly afterward). Merchant fetches on a schedule, so this is rare —
  but set the serverless function timeout above ~35s, or pre-warm the route.

Files: `app/api/feeds/google.xml/route.ts` (handler) · `lib/googleFeed.ts`
(RSS building) · `getAllProductsForFeed()` in `services/search.service.ts` (data).

---

## Quick reference — which one do I use?

- **Submitting to Google Search Console?** → `/sitemap.xml` (#1)
- **Feeding Google Merchant / Shopping ads?** → `/api/feeds/google.xml` (#3)
- **Just want to see/share the raw URL list?** → `/api/sitemap?type=products` (#2)
