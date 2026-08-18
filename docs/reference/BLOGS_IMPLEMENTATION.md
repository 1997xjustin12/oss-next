# Blogs — Implementation Guide (port to a sibling storefront)

**Source of truth:** this repo (Solana / BBQ / OKO Next.js storefront).
**Audience:** an engineer or agent implementing the identical blog feature in
another Next.js app talking to *its own* deployment of the same Django backend,
with *its own* credentials.

The backend contract, the route shapes, the caching policy and the brand-scoping
rule are identical across apps. Copy the design; swap the credentials.

> **History worth knowing.** This previously read from WordPress directly:
> resolve a category id, fetch `/wp/v2/posts`, then issue a further request per
> post to turn `featured_media` into a URL — a 12-post page cost 13 round trips.
> The backend endpoint returns the image URL inline, and handles brand scoping
> itself. Do not reintroduce the WordPress path in the new app.

---

## 1. Files to create

| File | Role |
|---|---|
| `src/app/lib/blogs.js` | The only place that talks to the backend. All reads, all validation, all caching. |
| `src/app/api/blogs/[[...slug]]/route.js` | Public JSON API — list and detail |
| `src/app/(market)/blogs/page.jsx` | Blog index route (server component) |
| `src/app/(market)/blogs/[slug]/page.jsx` | Single post route (server component) |
| `src/app/components/{design}/page/Blogs.jsx` | Index presentation |
| `src/app/components/{design}/page/BlogPost.jsx` | Post presentation |
| `src/app/components/{design}/sections/blog/Paginator.jsx` | Pagination control |

Reused infrastructure: `@/app/lib/store` → `STORE_ID`, and
`@/app/lib/rate-limit` → `withRouteRateLimit`.

If the target app has a single design rather than three, collapse the
`{design}` variants into one component pair and drop the `ISBBQ` / `ISOKO`
branching in the route files.

---

## 2. Environment variables

```dotenv
# Backend base URL — no trailing slash. e.g. https://api.example.com
NEXT_SOLANA_BACKEND_URL=

# The blogs endpoints authenticate with the COLLECTIONS key, not the general
# backend key — the latter returns 401 here. Verified against the live API.
NEXT_SOLANA_COLLECTIONS_KEY=

# Which brand's posts this deployment serves. Sent as ?store=
STORE_ID=
```

The same collections key the AI chat assistant uses. `STORE_ID` is the store
identity bootstrap — it cannot come from Redis, because you must already know
which brand you are in order to read that brand's settings.

---

## 3. Backend contract

Both endpoints take `Authorization: Api-Key {NEXT_SOLANA_COLLECTIONS_KEY}` and
`Accept: application/json`.

### `GET {BACKEND}/api/blogs/`

Query parameters:

| Param | Type | Notes |
|---|---|---|
| `store` | string | **Filled in server-side from `STORE_ID`.** Never taken from the caller — see section 6. |
| `page` | int | 1-based. A page past the end **404s** rather than returning an empty list. |
| `page_size` | int | Backend default 12, hard maximum 50. |
| `ordering` | string | `published_at`, `updated_at`, `created_at`, `title`; prefix `-` to reverse. Default `-published_at`. |
| `category` | string | Optional filter |
| `search` | string | Optional full-text filter |

Response — a standard DRF envelope:

```json
{ "count": 84, "next": "…", "previous": null, "results": [ /* post summaries */ ] }
```

> **Ordering gotcha:** an unrecognised `ordering` value is *silently ignored*
> server-side — it returns 200 in the default order rather than complaining. A
> typo therefore looks like it worked while quietly sorting by something else.
> Validate the field against a known list client-side so it becomes an obvious
> no-op you control.

### `GET {BACKEND}/api/blogs/{slug}/?store={STORE_ID}`

Returns one post, including `content`, `html` and `seo`, which the list endpoint
does not carry. 404 when the slug does not exist **or belongs to another brand**.

`store` must be sent here too, not just on the list. Without it, a Solana article
URL would render on the BBQ storefront.

> This has to be the backend's own filter rather than comparing `store_domain` on
> the result: the post carries `https://solanafireplaces.com` while that brand's
> env is `https://www.solanafireplaces.com`, so a string comparison rejects a
> legitimate post.

### Post shape

| Field | Where | Notes |
|---|---|---|
| `id` | list + detail | React key |
| `slug` | list + detail | URL segment |
| `title` | list + detail | |
| `excerpt` | list + detail | Card copy, and metadata description fallback |
| `featured_image` | list + detail | **Comes back as an empty string, not null, when unset** — see section 5 |
| `published_at` | list + detail | ISO date |
| `updated_at` | list + detail | ISO date |
| `html` | **detail only** | The body markup — this is what you render |
| `content` | **detail only** | A **structured object, not markup**. Rendering it is a bug. |
| `seo` | **detail only** | `{ title, description, canonical_url, og_title, og_description, og_image }` |

---

## 4. `src/app/lib/blogs.js`

One function covers every case the API supports — list, filter by category,
search, paginate, sort — because they are all the same request with different
query parameters. A separate helper per case would be four near-identical
fetches that drift apart the first time the contract changes.

```js
getBlogs()                               // latest for this brand
getBlogs({ category: "guides" })         // filtered
getBlogs({ search: "container" })        // searched
getBlogs({ page: 2, pageSize: 24 })      // paginated
getBlogs({ ordering: "title" })          // sorted
getBlog("some-slug")                     // one post, with content
```

Exported constants:

```js
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;
export const BLOG_ORDERING = ["published_at", "updated_at", "created_at", "title"];
export const DEFAULT_ORDERING = "-published_at";
export const BLOGS_TAG = "blogs";   // cache tag, so the admin cache screen
                                    // and /api/revalidate-all can bust these
export const DEFAULT_BLOG_IMAGE = "https://…/uploads/blog-default.png";
```

### Input normalisation

- `clampPageSize` — parse int; non-finite → `DEFAULT_PAGE_SIZE`; otherwise clamped
  to `[1, MAX_PAGE_SIZE]`.
- `clampPage` — parse int; must be finite and `> 0`, else `1`.
- `normalizeOrdering` — accepts `"title"` or `"-title"`; strips a leading `-`
  before checking against `BLOG_ORDERING`; anything unrecognised falls back to
  `DEFAULT_ORDERING`.

### `backendFetch(path)`

- Missing URL or key → log and return `{ ok: false, status: 503, data: null }`.
- Headers: `Accept: application/json`, `Authorization: Api-Key {key}`.
- **`next: { revalidate: 3600, tags: [BLOGS_TAG] }` — not `cache: "no-store"`.**
  Freshness comes from `unstable_cache` at the call site. A `no-store` fetch
  inside a route that sets `revalidate` is what silently bailed several routes
  out of static rendering before (see `docs/agentic-ai-readiness.md`).
- Non-OK → `{ ok: false, status, data: null }`; a throw → `{ ok: false, status: 502 }`
  with the error logged.
- **Never throws.** A blog listing that 500s the page because the backend hiccuped
  is worse than one that renders empty — the rest of the storefront is fine.

### `getBlogs(opts)`

Returns the backend envelope **plus** the resolved paging values, which is what a
paginator actually needs and what every caller would otherwise recompute:

```js
{ count, next, previous, results, page, pageSize, totalPages }
```

A 404 (page past the end) is a normal thing for a visitor to hit by editing the
URL, so it returns an **empty page**, not an error, and is not logged. Any other
failure status is logged and also returns the empty envelope.

### `getBlog(slug)`

`encodeURIComponent` the trimmed slug, send `?store=`. Returns `null` when the
slug does not exist or belongs to another brand, so a caller can hand that
straight to `notFound()`. Non-404 failures are logged.

### Cached variants

```js
export const getCachedBlogs = unstable_cache(async (opts) => getBlogs(opts),
  ["blogs-list", STORE_ID], { revalidate: 3600, tags: [BLOGS_TAG] });

export const getCachedBlog = unstable_cache(async (slug) => getBlog(slug),
  ["blogs-detail", STORE_ID], { revalidate: 3600, tags: [BLOGS_TAG] });
```

Separate exports rather than a flag on `getBlogs`: `unstable_cache` keys on the
arguments, so wrapping a function that also takes a search string would cache one
entry per search term and quietly fill the cache with single-use records. **Search
stays uncached for that reason.**

Note `STORE_ID` is part of the cache key — one deployment is one brand, but this
makes cross-brand bleed impossible even in a shared cache.

---

## 5. The default image

`featured_image` comes back as an **empty string rather than null** when unset,
which passes a truthiness check and then renders as a broken `<img>`. Every
render path goes through the helper instead:

```js
export const blogImage = (post) =>
  (typeof post?.featured_image === "string" && post.featured_image.trim()) ||
  DEFAULT_BLOG_IMAGE;
```

---

## 6. Brand scoping — `store` is never a parameter

`store` is deliberately **not** an argument to `getBlogs` / `getBlog`, and **not**
a query parameter on `/api/blogs`. Each deployment is exactly one brand and
already knows which via `STORE_ID`, so the library fills it in.

Taking it from the caller would mean `?store=solana` on the BBQ storefront returns
Solana's posts — the same cross-brand leak documented in `docs/brand-isolation.md`,
but reachable by anyone who can edit a query string.

If the target app is single-brand, still route the value through one server-side
constant rather than accepting it from a request.

---

## 7. `GET /api/blogs` — the public JSON API

`src/app/api/blogs/[[...slug]]/route.js`, `export const dynamic = "force-dynamic"`.

```
GET /api/blogs          — list, with ?category ?search ?page ?page_size ?ordering
GET /api/blogs/{slug}   — one post, with content
```

One **optional catch-all** segment rather than two route files, because the two
cases differ only by whether a slug is present. Both delegate to `lib/blogs.js`,
so this route and any server component render from the same code — the thing that
stops a listing page and its API disagreeing about what "latest" means.

- `segments.length > 1` → `404 { error: true, message: "Not found." }`. `/api/blogs/a/b`
  is not a thing.
- `segments.length === 1` → `getBlog(slug)`; null → `404 { error: true, message: "Post not found." }`;
  otherwise `{ store: STORE_ID, post }`.
- No segments → `getBlogs(...)` and return:

```json
{
  "store": "solana",
  "count": 84, "next": "…", "previous": null, "results": [],
  "page": 1, "pageSize": 12, "totalPages": 7,
  "meta": {
    "defaultPageSize": 12,
    "maxPageSize": 50,
    "ordering": ["published_at", "updated_at", "created_at", "title"],
    "defaultOrdering": "-published_at"
  }
}
```

The `meta` block is deliberate: it tells an agent or third-party client what it is
allowed to ask for, without needing this document.

Accept **both spellings** of the page-size parameter — `page_size` matches the
backend, `pageSize` is what a JS caller reaches for first.

Wrap with `withRouteRateLimit(handler, "light")` — 300 req/min per client, with
`RateLimit-*` headers on every response and `Retry-After` on a 429.

---

## 8. Route: the blog index

`src/app/(market)/blogs/page.jsx` — an async server component.

### `generateMetadata()`

Derived from the newest post via `getBlogs({ pageSize: 1 })` — one request, already
cached for the render below:

```js
title:       post?.title ? `Latest Blog Posts | ${STORE_NAME}` : "Latest Blog Posts"
description: post?.excerpt?.trim() || `Read the latest blogs about ${STORE_NAME}.`
image:       post?.featured_image?.trim() || DEFAULT_BLOG_IMAGE
```
plus matching `openGraph` and `twitter` blocks.

### The page

Read `searchParams` (await it — Next 15 makes it a promise) and pass straight
through to `getBlogs`:

| URL param | Maps to |
|---|---|
| `page` | `page` |
| `page_size`, or legacy `per_page` | `pageSize` |
| `search` | `search` |
| `category` | `category` |
| `ordering` | `ordering` |

`per_page` is kept as an accepted alias so links and bookmarks built against the
WordPress-era URLs keep working. Drop it in a brand-new app that never had them.

Then hand `{ posts: results, totalPages, page }` to the design component.

---

## 9. Route: a single post

`src/app/(market)/blogs/[slug]/page.jsx`.

### `generateMetadata({ params })`

The post carries its own `seo` object, so metadata no longer has to be dug out of
WordPress's `yoast_head_json`:

```js
title:       seo.title || post.title || "Blog Post"
description: seo.description || post.excerpt || ""
image:       seo.og_image?.trim() || blogImage(post)
alternates:  seo.canonical_url ? { canonical: seo.canonical_url } : undefined
openGraph:   { title: seo.og_title || title, description: seo.og_description || description,
               images: [image], type: "article",
               publishedTime: post.published_at, modifiedTime: post.updated_at }
twitter:     { title: seo.og_title || title, description: seo.og_description || description,
               images: [image] }
```

No post → `{ title: "Blog Not Found" }`.

### The page

```js
const post = await getBlog(slug);
if (!post) notFound();
```

A missing slug — or one belonging to another brand — is a genuine 404 rather than
a page that renders "no content available" with a 200.

Related posts: fetch `RELATED_COUNT + 1` (6), filter out the current slug, take 5.
The +1 is because the current post may itself be in the newest set.

Render the body from **`post.html`**. `post.content` is a structured object, not
markup — rendering it is the mistake to avoid.

---

## 10. Presentation

### Index (`page/Blogs.jsx`)

Props: `{ posts = [], totalPages = 1, page = 1 }`. A responsive card grid
(1 / 2 / 3 columns), each card an `<article key={post.id}>` with:

- image from `blogImage(post)`, `h-48 object-cover`, hover scale
- `<h3>` title linking to `/blogs/{slug}`, `line-clamp-2`
- excerpt, `line-clamp-3`, `flex-1` so cards stay equal height
- a "Read more" link with a chevron

Empty state: `"No blog posts available."` spanning the grid. Then `<Paginator />`.

### Post (`page/BlogPost.jsx`)

Props: `{ post, featuredImage, otherPosts = [] }`. Two columns — article at 2/3,
sidebar at 1/3, stacking on mobile:

- "Back to Blogs" link
- featured image, formatted `published_at` (`en-US`, long month), `<h1>`
- body: `dangerouslySetInnerHTML={{ __html: post.html }}` inside a `prose` wrapper.
  This is trusted CMS content, unlike the AI chat replies, which are model output
  and are rendered as React elements for exactly that reason.
- sidebar: sticky "More Articles" list of `otherPosts`, each with image, title,
  a 100-character excerpt and a "Read more" link. Empty state:
  `"No other posts available."`

### Paginator (`sections/blog/Paginator.jsx`)

Props: `{ current_page, total_pages }`. **Returns `null` when `total_pages < 2`**
or unparseable — otherwise a category with no posts renders bare disabled arrows.

First / previous / numbered / next / last, all `<Link prefetch={false}>` to
`/blogs?page=N`, with disabled ends rendered as `<span>` rather than links.
Markup reuses the InstantSearch `ais-Pagination-*` classes so blog paging looks
identical to catalogue paging.

> One caveat to fix if the target app has many posts: the numbered list is built
> with `Array.from({ length: total })`, so it renders **every** page number. Fine
> at a handful of pages; window it if the blog is large.

---

## 11. Sitemap

Add `/blogs` to the static route list — priority `0.7`, `changeFrequency: "weekly"`.

Individual posts are **not** currently enumerated in the sitemap. If the target app
wants them, page through `getBlogs({ pageSize: MAX_PAGE_SIZE })` in `sitemap.js`
and emit one entry per slug using `updated_at` as `lastModified`.

---

## 12. Cache invalidation

Everything is tagged `BLOGS_TAG` (`"blogs"`) at both the `fetch` and the
`unstable_cache` layer, with a 1-hour `revalidate`. A publish on the backend takes
up to an hour to appear, or immediately via `revalidateTag("blogs")` — wire that
into whatever revalidation endpoint the target app already has
(`/api/revalidate-all` here) and into its admin cache screen if it has one.

---

## 13. Porting checklist

- [ ] `NEXT_SOLANA_COLLECTIONS_KEY` (**collections**, not the general backend key) and `STORE_ID` set
- [ ] `store` filled in server-side; **not** accepted from any query string
- [ ] `store` sent on the **detail** request too, not only the list
- [ ] `backendFetch` uses `next: { revalidate, tags }`, **never** `cache: "no-store"`
- [ ] `getBlogs` never throws; a 404 returns an empty page rather than an error
- [ ] `ordering` validated against `BLOG_ORDERING` — the backend silently ignores bad values
- [ ] `pageSize` clamped to `[1, 50]`
- [ ] Search is **not** wrapped in `unstable_cache`
- [ ] `blogImage()` used everywhere — `featured_image` is `""`, not `null`, when unset
- [ ] Post body rendered from `post.html`, **not** `post.content`
- [ ] Missing/foreign slug calls `notFound()`
- [ ] `/api/blogs` accepts both `page_size` and `pageSize`, and returns the `meta` block
- [ ] Paginator returns `null` below 2 pages
- [ ] `/blogs` in the sitemap

---

## 14. Related documents in this repo

- `docs/brand-isolation.md` — why `store` is never taken from the client
- `docs/agentic-ai-readiness.md` — the `no-store` / static-rendering trap
- `docs/ai-chat-implementation-guide.md` — the sibling feature; shares the collections key
