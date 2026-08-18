# XML / Feed / Machine-Readable Endpoints

Related-but-distinct endpoints. They look similar ("sitemap"/"products")
but serve different consumers — don't mix them up:

| # | Endpoint | Format | For | Auth |
|---|---|---|---|---|
| 1 | `/sitemap.xml` | XML (sitemap) | Search engines (crawl/index) | none — public |
| 2 | `/api/sitemap?type=…` | JSON | Inspecting / sharing the raw URL data | none — public (key added server-side) |
| 3 | `/api/feeds/google.xml` | XML (RSS 2.0 + `g:`) | Google Merchant / Shopping | none — public |
| 4 | `/llms.txt` | Markdown | AI assistants — curated index of the site | none — public |
| 5 | `/llms-full.txt` | Markdown | AI assistants — index plus full page text | none — public |
| 6 | `/robots.txt` | text | Crawler policy, per named agent | none — public |
| 7 | `<any page>.md` | Markdown | Any consumer that would rather parse Markdown than HTML | none — public |
| 8 | `/api/mcp` | JSON-RPC | MCP clients (Claude, ChatGPT) calling tools directly | none — public |
| 9 | `/api/agent/v1/*` + `/openapi.json` | JSON | Agents calling a documented REST API | none — rate-limited |

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
- ⚠️ **NOT CACHED — every request takes ~3 minutes.** This corrects an earlier
  note here that claimed "~30s cold, cached hourly afterward". There is no
  "afterward": `getAllProductsForFeed()` is marked `'use cache'`, but the
  ~10,000-product array exceeds the cache's per-entry size limit, so the write
  is silently dropped (`Single item size exceeds maxSize` in the server log) and
  every request re-runs the full ~10-page Elasticsearch scan. Measured against a
  **production build**: cold 3m08s, warm 3m38s — no cache benefit at all.
  **Merchant's scheduled fetch and most serverless function timeouts are well
  under this.** Fixing it needs a decision, not a tweak: a custom `cacheHandler`
  (Next's documented route for oversized entries), pre-generating the feeds to
  object storage on a schedule, or caching a projection small enough to store.
  Tracked as F12 in `docs/audits/AGENTIC_READINESS.md`.

Files: `app/api/feeds/google.xml/route.ts` (handler) · `lib/googleFeed.ts`
(RSS building) · `getAllProductsForFeed()` in `services/search.service.ts` (data).

---

## 4 & 5. `/llms.txt` and `/llms-full.txt` — the site, in Markdown, for models

The emerging convention for "here is this site, described for a language model."
Both are plain Markdown; both are advertised from every page's `<head>` as
`<link rel="alternate" type="text/plain">`.

```
http://localhost:3000/llms.txt        # ~15KB — curated index, ~117 links
http://localhost:3000/llms-full.txt   # ~250KB — the above, plus 20 pages inlined
```

**`/llms.txt` is a curated index, NOT a sitemap.** That distinction is the whole
point of the file. `/sitemap.xml` already answers "what URLs exist" for ~12,000
of them; dumping the same list here makes the question "where should I look"
*harder* to answer. Sections, in order:

| Section | Source | Contents |
|---|---|---|
| Shop | `config/pages.ts` + `config/pageSeoDefaults.ts` | Native routes and the four PLP product types |
| Key pages | `KEY_PAGES` in `services/llms.service.ts` | Hand-ranked: quote, delivery, FAQ, financing, policies |
| Galleries and collections | `SECTION_PAGES` | The depth-2 content sections |
| Buying guides | backend `?type=page` | 40 sampled from ~1,600, by **stride** not alphabetically |
| Depot locations | `config/locations.ts` + `lib/locations.ts` | One entry per real depot, with its service area |
| Machine-readable endpoints | hardcoded | Points back at #1, #2, #3 and `/llms-full.txt` |

**Things that are load-bearing, not incidental:**

- **The guide sample uses a stride.** These slugs are size-led (`10-foot-…`,
  `20-foot-…`), so an alphabetical head is 40 near-identical pages about 10ft
  containers. A stride spreads the sample across the whole set.
- **Depot links are filtered against the live page list.** The location records'
  own `local_specials` field points at `/locations/<city-state>`, which **does
  not exist** — it serves the Not Found page. Only
  `/where-to-buy-shipping-containers/<city-state>` is real. See
  `depotPagePath()` in `lib/locations.ts`.
- **Depots are deduplicated.** 140 active location records collapse to ~55 real
  depots; 96 are *virtual* depots whose page is their parent's. The virtual
  entries' city names become the parent's service area, which is the useful
  part of them.
- **Every truncation is stated in the file**, with the endpoint that has the
  full set. A silent cap reads as completeness.

**Caching:** both are `'use cache'` + `cacheLife('hours')`, tagged `PAGES` and
`BLOG`, and prerendered at build. Bust the same way as the sitemap:
```
POST /api/revalidate   Header: x-revalidate-token: <REVALIDATE_SECRET>
Body: { "tag": "pages" }
```

**Do NOT submit these to Search Console or Merchant Center.** They are for
assistants; use #1 and #3 respectively.

Files: `app/llms.txt/route.ts` · `app/llms-full.txt/route.ts` (handlers) ·
`services/llms.service.ts` (content + curation) · `lib/markdown.ts` (the
HTML→Markdown converter `/llms-full.txt` runs each inlined page through).

---

## 6. `/robots.txt` — per-agent crawler policy

Generated from the typed registry in `config/crawlers.ts`, not written by hand.
Each entry carries the reason it is set the way it is; adding or flipping a
crawler is a one-line change there and `app/robots.ts` needs no edit.

Current policy (set 2026-08-10, revisit quarterly):

| Allowed | Disallowed |
|---|---|
| Googlebot, Bingbot, Applebot | GPTBot, ClaudeBot, CCBot, Bytespider |
| OAI-SearchBot, Claude-SearchBot, PerplexityBot | Google-Extended, Applebot-Extended |
| ChatGPT-User, Claude-User, Perplexity-User | Meta-ExternalAgent, Amazonbot |

The split is **cites-and-links vs training-only**. `Google-Extended` and
`Applebot-Extended` are training opt-outs *only* — disallowing them does not
affect Googlebot, Search ranking, Applebot or Siri.

`DISALLOWED_PATHS` in the same file is the single source for the private-path
list: `robots.txt` reads it, and `lib/seo.ts` forces `noindex` on any page under
one of those prefixes — so an admin cannot publish the checkout page by ticking
a box in the Page Configurator.

---

## Structured data (JSON-LD)

Not an endpoint, but the other thing agents read. All builders live in
`lib/schema.ts`; identity constants in `config/site.ts`.

Every page emits **one `@graph`** containing the canonical `Organization` and
`WebSite` nodes (same `@id` everywhere, so consumers merge rather than
duplicate them), plus page-specific nodes that reference those by `@id`:

| Page | Nodes |
|---|---|
| Home | Organization, WebSite, WebPage |
| PDP | + Product, BreadcrumbList, FAQPage |
| PLP | + BreadcrumbList, ItemList (the 12 rendered results) |
| Blog post | + BlogPosting, BreadcrumbList |
| WP content page | + WebPage, BreadcrumbList, and any JSON-LD recovered from the original page |
| Depot page | + LocalBusiness with `areaServed` |

Two notes worth keeping:

- **WP pages' own JSON-LD is recovered**, not regenerated. `extractJsonLd()` in
  `services/wp-pages.service.ts` pulls it out *before* `$('script').remove()`
  strips executable scripts. Where the recovered data already covers a node type
  we would derive (BreadcrumbList, WebPage, LocalBusiness), ours is skipped —
  two BreadcrumbLists on one page is a validation error.
- **The PLP's ItemList is fetched server-side on purpose.** Results still render
  via InstantSearch on the client; without the server fetch the PLP's HTML
  advertises a shop with no products in it to anything that doesn't run JS.

---

## 7. `<any page>.md` — the Markdown view of a page

Every indexable page has a Markdown representation, reachable two ways:

```
curl http://localhost:3000/privacy-policy.md
curl -H 'Accept: text/markdown' http://localhost:3000/privacy-policy
```

Both are rewrites in `proxy.ts` onto `app/api/md/[[...slug]]/route.ts`, so the
canonical URL never changes and the Markdown view can't compete for indexation.
Each response carries a `Link: <canonical>; rel="canonical"` header and YAML
front matter with the title, description and canonical URL.

| Page type | What you get |
|---|---|
| WordPress content | Full body as Markdown — headings, tables, links, images; no theme CSS, no Elementor `<div>`s |
| Product | Price **with its basis**, specs table, FAQ, ordering info |
| Blog post | Article body as Markdown |
| Listing | The current result set as a table |
| Home / blog index | A summary plus links — not a transcription of the React tree |
| Cart, checkout, account | **404.** These have no meaningful Markdown view, and offering one would contradict the robots.txt disallow they already carry |

**Never print `sale_price` bare on any machine-facing surface.** ~8,000 of the
~10,000 products are rental or rent-to-own and carry a **monthly** figure.
`getPriceBasis()` in `lib/pricing.ts` is the single source for which it is;
the Markdown view, the JSON-LD `offers`, and the PDP meta description all go
through it. A bare number here reads as the price of a container.

---

## 8. `/api/mcp` — MCP server

A Model Context Protocol endpoint, so Claude, ChatGPT and other MCP clients can
query the catalog and delivery availability directly instead of scraping pages.

**Connecting.** Add this as a custom connector, using the URL:

```
https://onsitestorage.com/api/mcp
```

- **Claude** — Settings → Connectors → Add custom connector → paste the URL.
- **ChatGPT** — Settings → Connectors → Add → paste the URL.
- **Anything else** — any client speaking MCP **Streamable HTTP**. No API key,
  no OAuth, no session setup.

**Four tools**, each a thin wrapper over the same service its `/api/agent/v1/*`
counterpart calls — the *service*, not a self-request, so there is no extra
network hop and no second rate-limit charge:

| Tool | Answers |
|---|---|
| `search_containers` | "What 40ft high cube containers do you sell?" |
| `get_product` | Specs, FAQ, delivery windows, and the same container at other depots |
| `check_delivery` | **"Can you deliver to 85001, and from where?"** — the one a catalog can't answer |
| `get_page_content` | Any page as Markdown: policies, guides, per-city depot pages |

**Transport.** Stateless Streamable HTTP: `POST` returns a single
`application/json` JSON-RPC response, `GET` returns **405** (no SSE stream is
offered, which the spec permits), and there are no sessions, so no
`Mcp-Session-Id` and no `DELETE`.

**Implementation note.** `lib/mcp.ts` implements the JSON-RPC layer directly
rather than using `@modelcontextprotocol/sdk`. The SDK's
`StreamableHTTPServerTransport` is written against Node's
`IncomingMessage`/`ServerResponse`, while a Next.js route handler receives a Web
`Request` and returns a Web `Response` — using it would mean shimming one onto
the other for a protocol surface that, once stateless and read-only, is about
150 lines. The spec details that are easy to get wrong are called out in
comments and asserted by the audit script:

- a POST carrying only a notification MUST return **202 with an empty body**
  (returning `{}` with a 200 breaks strict clients);
- an unknown tool is a **JSON-RPC error**, while a tool that ran and failed
  returns `isError: true` — conflating them hides real failures from the model;
- an unsupported `MCP-Protocol-Version` header is a **400**, and an absent one
  means "assume 2025-03-26".

**Auth posture.** None. Every tool is read-only and returns data already public
on the storefront, in `llms.txt`, and in the Merchant feed — the same call as
decision D2. Requests share the agent API's rate limiter.

> ⚠️ **A write tool changes this.** If the Phase 6 quote submission is ever
> exposed here, this endpoint needs OAuth first. An unauthenticated endpoint
> that creates records is a spam vector, and "the read tools need no auth" is
> not an argument that a write tool wouldn't.

---

## Monitoring

**Agent traffic** — `proxy.ts` records a per-day counter for every request whose
`User-Agent` matches `config/crawlers.ts`, via `lib/agentLog.ts`. Human traffic
costs nothing (a substring scan, then an early return). Read it at
**`/admin/agent-traffic`** — requests per agent over 14 days, top paths, and
status codes. A disallowed crawler with a non-zero count is flagged: that means
robots.txt is being ignored.

**The audit script** — `npm run audit:agentic` against a running server:

```
npm run audit:agentic                        # localhost:3000
npm run audit:agentic -- --base https://…    # a deployed environment
npm run audit:agentic -- --skip-links        # skip the llms.txt sweep
```

27 checks: JSON-LD parses and carries the expected node types per page type, no
block contains a raw `</script>`, one `<h1>` and one `<main>` per page, the
`SearchAction` target actually resolves, both Markdown mechanisms work,
`/cart.md` 404s, unknown paths return a real 404, the machine-readable routes
are reachable, robots.txt names the expected agents, and every link in
`llms.txt` resolves. Exits non-zero on failure, so it can gate CI.

Two things it does deliberately that a naive version wouldn't:

- **Soft 404s count as broken.** This codebase served "Not Found" with HTTP 200,
  so a status-code-only check reports a perfect score on a broken site.
- **An empty link set fails.** The first version printed "all 0 links resolve"
  while `/llms.txt` was 404ing. A check that can pass vacuously eventually will.

---

## Quick reference — which one do I use?

- **Submitting to Google Search Console?** → `/sitemap.xml` (#1)
- **Feeding Google Merchant / Shopping ads?** → `/api/feeds/google.xml` (#3)
- **Just want to see/share the raw URL list?** → `/api/sitemap?type=products` (#2)
- **Pointing an AI assistant at the site?** → `/llms.txt` (#4), or `/llms-full.txt` (#5) if it should read the content too
- **Want one page's content, cleanly?** → append `.md` (#7)
- **Changing which crawlers are allowed?** → `config/crawlers.ts`, never `app/robots.ts` directly
- **Did a change break any of this?** → `npm run audit:agentic`
- **Are agents actually visiting?** → `/admin/agent-traffic`
- **Connecting Claude or ChatGPT to the catalog?** → `/api/mcp` (#8)
- **Writing your own integration?** → `/openapi.json` (#9)
