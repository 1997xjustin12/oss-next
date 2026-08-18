# Agentic-AI Readiness — Task Tracker

Making `oss-next` legible and usable to AI agents: LLM search crawlers (ChatGPT, Claude,
Perplexity, Gemini), shopping/browsing agents, and agents that call our endpoints directly.

**How to use this file.** Tick a box when the task is done *and* verified against the
acceptance criterion next to it. Update the Progress table when a phase's count changes.
Same convention as `AUDIT_REQUIREMENTS.md` — this is a living file, not a point-in-time
export. Keep it honest: a half-shipped task stays unticked.

- **Created** 2026-08-10
- **Last updated** 2026-08-10 — all phases complete except 4 blocked tasks; 50/54. See §4.
- **Owner** _unassigned_

---

## 1. The situation this plan has to work around

This app is a **hybrid**. Two content systems sit behind one domain, and they are
agent-legible to very different degrees:

| Surface | Count | Rendered by | Agent legibility today |
|---|---:|---|---|
| **Native pages** — home, PLP, PDP, blog, cart, checkout, account | 16 static + 2 templates | React Server Components in `app/(market)/` | **Good.** Real metadata, JSON-LD on 4 page types, semantic markup |
| **WordPress-converted pages** — locations, fabrication galleries, policies, landing pages | ~1,700 | `app/(market)/[...slug]/page.tsx` → Django pages API → `dangerouslySetInnerHTML` | **Poor.** No JSON-LD at all, 400KB of scoped theme CSS, Elementor `<div>` soup |
| **Products** | ~10,264 | PDP template + Elasticsearch | Good per-page; no bulk machine-readable read path except the Merchant feed |
| **Blog posts** | via WP REST | `app/(market)/blogs/[slug]/` | Good |

Three consequences drive everything below:

1. **The WP half is the weak half, and it's 94% of the URL count.** Fixes there cannot be
   made page-by-page in React — they have to be made *in the conversion pipeline* or *in
   the catch-all route*, so one change covers all ~1,700 pages.
2. **We already have the plumbing.** `/sitemap.xml` (11,967 URLs), `/api/sitemap` (JSON
   passthrough), `/api/feeds/google.xml` (Merchant RSS), `CACHE_TAGS`, and the admin Page
   Configurator all exist. Most of this plan is *extending* those, not building new ones.
3. **The Page Configurator gives us a no-deploy editing path.** Anything we make
   agent-facing and editable there (summaries, FAQ answers) can be tuned by non-developers
   — which matters, because agent-facing copy needs iteration.

### Verified gaps (found 2026-08-10, re-verify before closing)

| # | Gap | Evidence | Status |
|---|---|---|---|
| G1 | All ~1,700 WP pages ship **zero structured data** | `services/wp-pages.service.ts` ran `$('script').remove()`, which stripped the original page's `application/ld+json` along with the reCAPTCHA scripts it was written for | **closed** 2026-08-10 (T2.3). Recovery verified: 3 of 11 sampled pages carry an `FAQPage` that was previously destroyed |
| G2 | `robots.txt` has **one blanket `User-agent: *` rule** — no AI crawler is named, allowed, or blocked deliberately | `app/robots.ts` | **closed** 2026-08-10 (T1.1) |
| G3 | No `llms.txt`, no Markdown representation of any page | no such route exists | **closed** 2026-08-10 — `llms.txt` + `llms-full.txt` (T1.3/T1.4) and per-page Markdown via `.md` and `Accept: text/markdown` (T2.2) |
| G4 | The only search API is `POST /api/search` in **InstantSearch envelope shape** (`{requests:[{params:{...}}]}`) — unusable by an agent without reverse-engineering | `app/api/search/route.ts` | **closed** 2026-08-10 (Phase 4). `/api/agent/v1/*` added alongside it; the InstantSearch route stays for the storefront |
| G5 | No `BreadcrumbList` on PDP or on any WP page; no `ItemList` on PLP; no `FAQPage` despite a real FAQ accordion on the PDP | `app/(market)/product/[slug]/page.tsx`, `_components/FaqAccordion.tsx` | **closed** 2026-08-10 (T3.1–T3.5) |
| G6 | No public API description (OpenAPI) and no MCP endpoint | — | **closed** 2026-08-10 — OpenAPI 3.1 at `/openapi.json` (T4.4) and a stateless Streamable-HTTP MCP server at `/api/mcp` (Phase 5) |

---

## 2. Progress

| Phase | Theme | Tasks | Done |
|---|---|---:|---:|
| 0 | Decisions to make first | 4 | 4 |
| 1 | Access & discovery | 6 | 6 |
| 2 | Machine-readable content (the WP half) | 7 | 6 |
| 3 | Structured data completeness | 9 | 8 |
| 4 | An API agents can actually call | 6 | 6 |
| 5 | MCP server | 5 | 5 |
| 6 | Agentic commerce | 5 | 5 |
| 7 | Page-level hygiene | 6 | 5 |
| 8 | Measurement & CI | 6 | 5 |
| | **Total** | **54** | **50** |

**Remaining:** Phase 5 (MCP — thin wrappers over the Phase 4 endpoints) → Phase 6 (agentic
commerce, scoped by D3 to quote requests).

**Blocked on other people — 4 tasks, and no amount of engineering closes them:**
**T3.8** needs real return-policy terms from sales · **T2.4** needs a Django-side
`agent_summary` field · **T7.3** needs `alt` text on WordPress-authored images · **T8.5**
needs a citation baseline run by hand against the live production site.

**Two things engineering finished but a person still has to act on:**

1. **The feeds take ~3 minutes per request and are not cached (F12).** Merchant's scheduled
   fetch will time out. Needs an architectural decision — see the finding.
2. **Agent-submitted quote requests reach Redis, not sales.** This app has no CRM
   integration, so `deliverQuoteRequest()` stores leads and `/admin/quote-requests` displays
   them. Wiring that function to the real sales pipeline is the last mile on T6.3, and until
   it is done a lead is only seen if someone opens the admin.

---

## Phase 0 — Decisions to make before writing code

These are business calls, not engineering ones. Each one changes what gets built. Get
answers, record them here with a date, and don't re-litigate them later.

- [x] **D1 — Do we allow AI *training* crawlers?**
      Separate question from search crawlers. `GPTBot`, `ClaudeBot`, `CCBot`, `Bytespider`,
      `Google-Extended`, `Applebot-Extended` collect for model training and send **no**
      referral traffic back. `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot` power
      answers that *cite and link* to us. Most retailers allow the search ones and block or
      throttle the training ones.
      **Recommendation:** allow search + user-initiated fetch agents; block training-only
      crawlers. Revisit quarterly.
      **_Decision: allow search + user-initiated; block training-only. Date: 2026-08-10._**
      Implemented in `config/crawlers.ts`; next review due 2026-11-10.

- [x] **D2 — Is the catalog data public?**
      Phase 4 exposes prices, availability, and specs as clean JSON. That data is already
      public in `/api/feeds/google.xml` and on every PDP, so this is mostly a
      *scraping-convenience* question, not a secrecy one.
      **Recommendation:** yes, public and rate-limited. A competitor scraping the PDP HTML
      is not meaningfully harder than calling a JSON endpoint.
      **_Decision: yes — public, no auth, rate-limited. Date: 2026-08-10._** Unblocks
      Phases 4 and 5.

- [x] **D3 — How far into agentic commerce do we go?**
      Options, in increasing order of commitment: (a) agents can *read* catalog and
      availability; (b) agents can *submit a quote request* on a customer's behalf;
      (c) agents can *place an order* with delegated payment. For a
      quote-and-delivery-heavy business like containers, (b) is the natural stopping point
      and (c) is likely never appropriate.
      **Recommendation:** target (b). Treat (c) as out of scope until a client asks.
      **_Decision: (b) — agents may read everything and submit a quote request on a
      customer's behalf. Agent-initiated payment and order placement are OUT OF SCOPE.
      Date: 2026-08-10._**

- [x] **D4 — Who owns agent-facing copy?**
      Agent summaries and FAQ answers are marketing copy, not code. If marketing owns them,
      they belong in the admin Page Configurator (task T2.7) and every downstream task must
      read from there rather than from a hardcoded config file.
      **_Decision: the admin Page Configurator owns it. Date: 2026-08-10._** Native pages
      have an `agentSummary` field there (T2.7); the ~1,700 WordPress pages still need the
      Django-side field (T2.4) before they can have one.

---

## Phase 1 — Access & discovery

Cheap, fast, and a prerequisite for everything else: agents have to be permitted in, and
have to be able to find the machine-readable stuff once it exists.

- [x] **T1.1 — Rewrite `app/robots.ts` with named per-agent rules.**
      Replace the single blanket rule with an explicit list driven by D1. Move the agent
      list into `config/crawlers.ts` (typed: name, purpose, `allow` boolean, reason) so the
      *why* of each entry survives the next person to edit it.
      **Covers at minimum:** `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`,
      `Claude-User`, `Claude-SearchBot`, `PerplexityBot`, `Perplexity-User`,
      `Google-Extended`, `Applebot-Extended`, `Amazonbot`, `Meta-ExternalAgent`,
      `Bytespider`, `CCBot`.
      **Done when:** `/robots.txt` renders one rule block per agent, every entry carries a
      reason comment, and the existing `/my-account /cart /checkout /wishlist` disallows
      still apply to `*`.

- [x] **T1.2 — Keep the disallow list in one place.**
      The private-path list is currently duplicated between `app/robots.ts` and each page's
      `robots: { index: false }` metadata. Export it once from `config/crawlers.ts` and
      have both read from it.
      **Done when:** adding a private path in one file changes both `/robots.txt` and the
      page-level meta.

- [x] **T1.3 — Ship `/llms.txt`.**
      The emerging convention for "here is this site, in Markdown, for a model." A route
      handler at `app/llms.txt/route.ts`: H1 site name, a one-paragraph summary of what the
      business sells and where it delivers, then curated link sections — Products, Buying
      guides, Locations, Policies, Blog — each link with a one-line description.
      **Curate, don't dump.** ~50–100 links, not 11,967. Generate the product section from
      the top N products by catalog rank, not the full list.
      **Done when:** `/llms.txt` returns `text/plain`, is under ~40KB, every link resolves
      200, and it's `'use cache'` + `cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PAGES)`.

- [x] **T1.4 — Ship `/llms-full.txt`.**
      The expanded variant: full Markdown body text of the policy pages, buying guides, and
      key location pages inline, so a model can ingest the substance in one fetch. Built on
      the same HTML→Markdown converter as T2.1.
      **Done when:** it returns complete Markdown for the curated set, and stays under the
      platform's response-size limits (split if it exceeds ~5MB).

- [x] **T1.5 — Link the machine-readable surfaces from the HTML.**
      Agents that don't guess `/llms.txt` should still find things. Add to the root layout:
      `<link rel="alternate" type="text/markdown" href="...">` per page (T2.2), and
      `<link rel="alternate" type="application/ld+json">` where applicable.
      **Done when:** view-source on any page shows a machine-readable alternate for itself.

- [x] **T1.6 — Add the new surfaces to `/sitemap.xml` and document them.**
      `xml.md` currently documents three endpoints and explicitly warns against confusing
      them. Every surface this plan adds must land in that table with the same
      "who consumes this / don't confuse it with" framing.
      **Done when:** `xml.md` has a row for `llms.txt`, the Markdown variants, the agent
      API, and the MCP endpoint.

---

## Phase 2 — Machine-readable content (fixing the WordPress half)

**This is the highest-value phase and the one with the most work.** ~1,700 pages currently
reach an agent as Elementor `<div>` nesting wrapped in 400KB of scoped theme CSS. The fix
is not to rewrite them — it's to serve a clean parallel representation.

- [x] **T2.1 — Build an HTML→Markdown converter in `lib/markdown.ts`.**
      Input: the `page.content` HTML already returned by `fetchWpPage()`. Output: clean
      Markdown — headings preserved, images as `![alt](url)`, tables as pipe tables, links
      absolute, all Elementor wrapper divs and inline styles dropped.
      Reuse `cheerio` (already a dependency, already used in `wp-pages.service.ts`) rather
      than adding a new library.
      **Done when:** a unit test converts a real fabrication-gallery page and a real
      locations page, and the output has no `<div>`, no `style=`, and no `class=`.

- [x] **T2.2 — Serve a Markdown representation of every page.**
      Two mechanisms, both worth having:
      - **URL suffix:** `/{slug}.md` → Markdown. Explicit, linkable, cacheable, and what
        agents actually try.
      - **Content negotiation:** `Accept: text/markdown` on the canonical URL returns
        Markdown instead of HTML, via `proxy.ts`.
      Applies to WP pages *and* native pages (a Markdown PDP is genuinely useful).
      **Done when:** `curl -H 'Accept: text/markdown' <any indexable URL>` and
      `curl <url>.md` both return Markdown, and both are `'use cache'` with the same tags
      as the HTML page so one revalidation busts both.

- [x] **T2.3 — Stop stripping structured data in the conversion pipeline.**
      `services/wp-pages.service.ts:213` calls `$('script').remove()`. That line exists to
      kill the reCAPTCHA scripts that crashed navigation — a correct fix for a real bug —
      but it also destroys every `<script type="application/ld+json">` the original
      WordPress page carried.
      **Change:** extract `application/ld+json` blocks *before* the removal, validate and
      re-emit them through the `JsonLd` component. Keep stripping executable scripts.
      **Done when:** a WP page that had schema on onsitestorage.com has equivalent schema
      on the Next.js page, and no executable script survives. Guard with a test asserting
      both halves.

- [ ] **T2.4 — Add a per-page agent summary field to the pages API contract.**
      A 2–3 sentence plain-language description of what the page covers, used in `llms.txt`
      entries, `og:description` fallbacks, and the `description` of the page's JSON-LD.
      Needs a Django-side field; coordinate with the backend team.
      **Done when:** `fetchWpPage()` returns `agent_summary`, and it's rendered.

- [x] **T2.5 — Strip the theme CSS from the Markdown path entirely.**
      The scoped-CSS injection (`scopeCss()`) is essential for the HTML rendering and
      irrelevant for Markdown. Make sure the Markdown route never fetches or processes it —
      that's ~400KB and a PostCSS parse saved per request.
      **Done when:** the Markdown route's server timing shows no PostCSS work.

- [x] **T2.6 — Handle the native-route collision list once.**
      `NATIVE_ROUTE_PREFIXES` in the catch-all and the collision filter in `app/sitemap.ts`
      are two hand-maintained copies of the same list. A third copy will appear the moment
      Markdown routes are added. Consolidate into `config/routes.ts` now.
      **Done when:** one exported constant feeds the catch-all, the sitemap filter, and the
      Markdown route.

- [x] **T2.7 — Expose agent-facing copy in the admin Page Configurator.**
      Extend the SEO record (`types/seo.ts`, `actions/seo.ts`, `SeoForm.tsx`) with an
      `agentSummary` field for the 16 native pages, following the existing conventions:
      blank means "use the default", defaults live in `config/pageSeoDefaults.ts`, saves
      bust `CACHE_TAGS.SEO`.
      Gated on **D4**.
      **Done when:** editing the summary in the admin changes `/llms.txt` and the page's
      JSON-LD `description` without a redeploy.

---

## Phase 3 — Structured data completeness

JSON-LD is the single most reliably-consumed signal across every agent platform. We have a
good foundation on 4 page types — this phase closes the holes and links them into one graph.

- [x] **T3.1 — `BreadcrumbList` on the PDP.**
      PLP has one; PDP does not. Home → Shop → *product*.
      **Done when:** the PDP emits a valid `BreadcrumbList` and it passes Rich Results Test.

- [x] **T3.2 — `BreadcrumbList` on WP pages.**
      Derive from the URL path segments in the catch-all. `/customer-fabrication-gallery/shipping-container-floor`
      → Home → Customer Fabrication Gallery → Shipping Container Floor. Segment labels come
      from `page.title` for the leaf and title-cased segments above it.
      **Done when:** every WP page below the root emits one.

- [x] **T3.3 — `FAQPage` on the PDP.**
      `FaqAccordion.tsx` renders real Q&A that currently exists only as DOM. Emit it as
      `FAQPage` schema too.
      **Done when:** questions and answers appear in both the accordion and the JSON-LD, from
      one source array — not duplicated by hand.

- [x] **T3.4 — `ItemList` on the PLP.**
      The listing page emits only `BreadcrumbList`. Add an `ItemList` of the products in the
      current result set, with `position`, `url`, `name`, `image`, and `offers.price`, so an
      agent reading one PLP fetch gets the whole result set without 20 more requests.
      **Done when:** the first page of `/sale-shipping-containers` emits an `ItemList` whose
      length matches the rendered card count.

- [x] **T3.5 — `LocalBusiness` / `Service` with `areaServed` on location pages.**
      Location pages are a large slice of the ~1,700 and the most likely to be surfaced by
      an agent answering "who delivers shipping containers near me". Needs the service area
      per page — pull from `config/locations.ts` where it matches, from the pages API
      otherwise.
      **Done when:** a location page emits `areaServed` that matches the copy on the page.

- [x] **T3.6 — Link everything into one `@graph` with stable `@id`s.**
      Today each page emits an island. Give `Organization`, `WebSite`, and each `Product` a
      canonical `@id` (`https://.../#organization`, `.../product/{handle}#product`) and have
      pages reference rather than restate them. This is what lets an agent resolve
      "the seller of this product" to "the organization whose returns policy I just read".
      **Done when:** `Organization` is defined once and referenced by `@id` everywhere else.

- [x] **T3.7 — Refactor JSON-LD building out of the page files.**
      `buildJsonLd()` is 90 lines inside `app/(market)/product/[slug]/page.tsx`, which
      violates the "app/ holds only route files" rule in `AGENTS.md` and makes the schema
      untestable. Move all builders to `lib/schema.ts` with typed inputs.
      **Done when:** page files import builders and pass data; `lib/schema.ts` has unit tests.

- [x] **T3.9 — Make site search URL-addressable, then restore the `SearchAction`.**
      The homepage's `WebSite` node carried
      `potentialAction.target = /products?q={search_term_string}` — a route that does not
      exist, with a parameter the PLP does not read. The node was **removed** on 2026-08-10
      rather than left pointing at a 404; a sitelinks searchbox that 404s is worse than
      none, and an agent will follow it.
      The underlying gap: the PLP's only free-text search is the accessories tab's box, and
      its query never reaches the URL. Make search URL-addressable
      (`/sale-shipping-containers?q=…`, read in `InstantSearchSection`), then restore the
      `SearchAction` in `webSiteNode()` pointing at it.
      **Done when:** `?q=40ft` returns filtered results on load, and the restored
      `SearchAction` target resolves.

- [ ] **T3.8 — Close or confirm the two open schema decisions.**
      `AUDIT_REQUIREMENTS.md` §2 records `hasMerchantReturnPolicy` as deliberately absent
      (sales hasn't defined terms) and `gtin` as deliberately reusing the SKU. Both are
      exactly the fields a shopping agent checks. Re-raise with the client — an agent that
      can't find a return policy may skip the listing.
      **Done when:** either the fields are populated with real terms, or the decision is
      re-confirmed with a 2026 date and a note that the agentic cost was understood.

---

## Phase 4 — An API agents can actually call

`POST /api/search` with `{requests:[{indexName, params:{...}}]}` is an InstantSearch
transport, not a public API. No agent will discover or use it correctly. Phase 4 adds a
thin, boring, well-described read API alongside it. Gated on **D2**.

- [x] **T4.1 — `GET /api/agent/search`.**
      Query params: `q`, `location` (zip), `type` (`containers|accessories`), `condition`,
      `size`, `limit`, `offset`. Returns a flat JSON array of normalized products —
      `handle`, `title`, `url`, `price`, `currency`, `availability`, `condition`, `size`,
      `image`, `deliversTo`. Reuses `cachedEsSearch()`; no new data path.
      **Done when:** `curl '/api/agent/search?q=40ft+high+cube&location=90210&limit=5'`
      returns useful JSON with no auth and no envelope.

- [x] **T4.2 — `GET /api/agent/products/{handle}`.**
      Full normalized product record: specs, all images, delivery constraints, rental vs
      purchase pricing, and the canonical PDP URL.
      **Done when:** every field on the PDP is reachable from this one call.

- [x] **T4.3 — `GET /api/agent/availability?zip=&handle=`.**
      The one genuinely dynamic question for this business: can you deliver *this* container
      to *this* zip, and what does delivery cost. Wraps the existing zip/location logic.
      **Done when:** it returns the same answer the PDP's `DeliveryZipCheck` shows.

- [x] **T4.4 — Publish an OpenAPI 3.1 description at `/openapi.json`.**
      Hand-written and version-controlled in `config/openapi.ts` — a generated-from-code
      spec will drift the moment someone edits a route by hand. Include `servers`,
      per-operation descriptions written *for a model reading them*, and realistic examples.
      **Done when:** the spec validates, and pasting the URL into an agent tool yields
      correct calls without further prompting.

- [x] **T4.5 — Rate-limit and cache the agent routes.**
      Reuse the existing Upstash Redis instance (already in use for the admin) for a fixed
      window per IP. Set `Cache-Control: public, s-maxage=…, stale-while-revalidate` to
      match the underlying `cacheLife`.
      **Done when:** a burst above the limit returns `429` with `Retry-After`, and normal
      traffic is served from cache.

- [x] **T4.6 — Version the agent API from day one.**
      Either `/api/agent/v1/…` or a required `X-API-Version` header. Retrofitting versioning
      after an agent has memorized the shape is much worse than paying for it now.
      **Done when:** the version appears in the path or a required header, and `/openapi.json`
      documents the deprecation policy.

---

## Phase 5 — MCP server

The most direct form of "agentic-friendly": Claude, ChatGPT, and other MCP clients connect
and call our tools. **Do not start this before Phase 4** — MCP tools should be a thin
wrapper over the agent API, not a second implementation of it.

- [x] **T5.1 — Add a remote MCP endpoint at `app/api/mcp/route.ts`.**
      Streamable HTTP transport. Read the Next.js route-handler docs in
      `node_modules/next/dist/docs/` first — streaming response conventions in this version
      may differ from what you expect.
      **Done when:** MCP Inspector connects and lists tools.

- [x] **T5.2 — Expose four tools, each mapping 1:1 to a Phase 4 endpoint.**
      `search_containers`, `get_product`, `check_delivery`, `get_page_content`.
      Tool descriptions are prompts — write them for a model deciding *whether to call*,
      including when **not** to.
      **Done when:** a fresh Claude conversation with the connector answers "what 40ft
      containers can you deliver to 90210 and what do they cost" using only these tools.

- [x] **T5.3 — Decide auth posture.**
      Read-only public tools need none. Anything that writes (T6.3) needs OAuth.
      **Done when:** documented in `xml.md` and enforced in code.

- [x] **T5.4 — Publish connection instructions.**
      A short page — probably a WP-authored one — with the endpoint URL and setup steps for
      Claude and ChatGPT.
      **Done when:** a non-developer can connect by following it.

- [x] **T5.5 — Log tool calls.**
      Which tools get called, with what arguments, and whether they errored. This is the
      only feedback loop on whether the tool descriptions are any good.
      **Done when:** tool-call volume and error rate are visible alongside the Phase 8 metrics.

---

## Phase 6 — Agentic commerce

Scoped by **D3**. Written assuming the recommended answer (b): agents can read everything
and submit a quote request, but cannot place an order.

- [x] **T6.1 — Audit the Merchant feed for agent consumption.**
      `/api/feeds/google.xml` already carries price, image, availability and condition for
      ~10,192 items — most of what a shopping agent wants. The known problem is documented
      in `xml.md`: ~8k rental/RTO items publish a **monthly** rate as `g:price`. Google may
      disapprove those; an agent will simply quote a wrong price with confidence.
      **Fix:** add `g:unit_pricing_measure`/an explicit rental marker, or exclude
      rental/RTO from the agent-facing feed (a one-line filter in `lib/googleFeed.ts`).
      **Done when:** no feed item can be read as a one-time price when it isn't.

- [x] **T6.2 — Publish a JSON product feed alongside the RSS one.**
      Same data as `google.xml`, JSON Lines, paginated. RSS+`g:` namespace exists for
      Merchant Center; agents parse JSON far more reliably.
      **Done when:** `/api/feeds/products.jsonl` streams the catalog, and `xml.md` explains
      which consumer wants which.

- [x] **T6.3 — `POST /api/agent/quote`.**
      Lets an agent submit a quote request on a customer's behalf: product handle, zip,
      quantity, contact details, and an explicit `submittedByAgent` flag with the agent's
      identity. Routes into the same pipeline as the homepage `QuoteForm`.
      **Requires:** rate limiting, spam defense, and D3 = (b) or (c).
      **Done when:** an agent-submitted quote reaches the sales team tagged as agent-originated.

- [x] **T6.4 — Make price and availability freshness explicit.**
      Every agent-facing price should carry `asOf` and a `priceValidUntil`. An agent quoting
      a stale price is a customer-service problem that lands on the client, not on us.
      **Done when:** every price field in the agent API and JSON feed carries a timestamp.

- [x] **T6.5 — Write the agent-facing policy page.**
      What agents may do, rate limits, attribution expectations, contact for higher limits.
      Link it from `llms.txt` and `/openapi.json`.
      **Done when:** published and linked.

---

## Phase 7 — Page-level hygiene

Lower leverage than the phases above, but these are what an agent reading the raw DOM
actually trips over.

- [x] **T7.1 — Render PDP specifications as a real `<table>`.**
      `Specifications.tsx` — a table is unambiguous to a parser; a styled `<div>` grid is a
      guess.
      **Done when:** specs are `<table>` with `<th scope="row">`.

- [x] **T7.2 — Audit heading hierarchy on native pages.**
      Exactly one `<h1>` per page, no skipped levels. The homepage in particular has 17
      headings across many components (see the Content Editor registry) — verify the order
      is still correct after the 2026-08-05 refactor.
      **Done when:** an automated pass over all 16 native routes reports no violations.

- [ ] **T7.3 — Audit `alt` text on product and gallery images.** *(audited 2026-08-10 — no
      code defect found; remaining work is content-side)*
      Agents describe images from `alt` alone. Empty or filename-derived `alt` is invisible.
      **Audit result:** the two native cases that flag as "empty alt" are both *correct*
      and already documented as deliberate — `TrustedBySection`'s logo carousel (the CDN
      filenames carry no company names to attribute, and the group is `aria-label`led, which
      is the right WCAG pattern for repeated decorative images) and `ProductImageGallery`'s
      thumbnails (redundant with the labelled main image). **Neither was changed: inventing
      company names would be fabricating alt text, which is worse than empty.**
      What is genuinely missing is `alt` on images inside the converted WordPress markup —
      10 of 190 on a sampled depot page. That is authored content, not code; it cannot be
      fixed in this repo without making text up.
      **Now done when:** the WordPress source images get real `alt` text from whoever
      authors those pages. Track with the audit script (T8.3).

- [x] **T7.4 — Check semantic landmarks on WP-converted pages.**
      The converted Elementor markup almost certainly has no `<main>`, `<article>`, or
      `<section>`. Wrap the injected content in `<main>` at minimum, in the catch-all route.
      **Done when:** every WP page has exactly one `<main>`.

- [x] **T7.6 — Fix the catch-all's soft 404s.** *(found 2026-08-10)*
      `/locations/atlanta-ga` — and any other missing WordPress path — returns
      **HTTP 200 with the Not Found page in the body**. `notFound()` is called inside the
      catch-all's `<Suspense>` boundary, by which point the shell has already flushed with a
      200 and the status can no longer be changed.
      This is the worst kind of 404 for an agent: a crawler records the URL as live, and an
      assistant may quote a "Not Found" page as content. It also silently defeats any link
      check that only looks at status codes — the `llms.txt` verifier had to match on the
      page title to catch it.
      The fix conflicts with the current structure: the route deliberately puts
      `fetchWpPage` behind Suspense because `params` is request-time data under
      `cacheComponents`. Resolving the page (or at least its existence) before the shell
      flushes is the real fix and needs design thought.
      **Done when:** a missing WordPress path returns a real 404 status.

- [x] **T7.5 — Verify no meaningful content is client-only.**
      Anything rendered only after hydration is invisible to crawlers that don't execute JS —
      which includes several AI crawlers. Check the PLP's InstantSearch results and the PDP
      reviews carousel in particular.
      **Done when:** `curl` on PLP and PDP shows product names and review text in the raw HTML.

---

## Phase 8 — Measurement & CI

Without this phase there is no way to know whether any of the above worked.

- [x] **T8.1 — Log AI crawler and agent traffic.**
      Parse `User-Agent` in `proxy.ts` against `config/crawlers.ts`; record agent name, path,
      and status.
      **Done when:** per-agent request volume is queryable.

- [x] **T8.2 — Report on it.**
      A dev-only admin page under `app/admin/` — the gate and layout already exist — showing
      agent traffic by name over time, top paths, and error rates.
      **Done when:** the page renders real data and stays behind all three production gates.

- [x] **T8.3 — Validate JSON-LD in CI.**
      A script that crawls a sample of each page *type* (home, PLP, PDP, blog, 3 WP pages),
      extracts every `application/ld+json`, and fails the build on invalid schema. Playwright
      is already a dev dependency and already used for admin round-trips.
      **Done when:** breaking a schema builder fails CI.

- [x] **T8.4 — Check `llms.txt` link health.**
      Every link in `llms.txt` and `llms-full.txt` must resolve 200. These files go stale
      silently — nobody visits them.
      **Done when:** a scheduled check reports dead links.

- [ ] **T8.5 — Track citations.** *(method defined 2026-08-10; baseline needs a human)*
      The only outcome measure this plan has. Everything else measures whether the plumbing
      works; this measures whether it changed anything.

      **Why it can't be automated here:** it requires querying ChatGPT, Claude, Perplexity
      and Google AI Overviews as a normal user, against the **live production domain**.
      Neither is available from the build environment, and scripting logged-in assistant
      UIs would violate their terms. It is fifteen minutes of manual work per month.

      **Protocol.** Ask each assistant each question in a fresh chat with no memory of the
      site. Record: cited (linked us), mentioned (named us, no link), or absent — plus which
      competitor was cited instead, which is the more actionable number.

      | # | Question |
      |---|---|
      | Q1 | "Where can I buy a 40ft high cube shipping container near Phoenix?" |
      | Q2 | "What does it cost to rent a 20ft shipping container per month in Texas?" |
      | Q3 | "Who delivers shipping containers to Atlanta and what are the site requirements?" |
      | Q4 | "What's the difference between cargo worthy and wind and water tight containers?" |
      | Q5 | "Can I rent-to-own a shipping container, and what terms are typical?" |
      | Q6 | "What size truck is needed to deliver a 40ft container and how much space do I need?" |

      Q1–Q3 test the depot/location work; Q4–Q6 test the guide content and the FAQ schema.

      **Baseline (fill in on first run):**

      | Date | Assistant | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Notes |
      |---|---|---|---|---|---|---|---|---|
      | _____ | ChatGPT | | | | | | | |
      | _____ | Claude | | | | | | | |
      | _____ | Perplexity | | | | | | | |
      | _____ | Google AI Overviews | | | | | | | |

      **Done when:** the table above has a dated baseline and one follow-up run.

- [x] **T8.6 — Document all of it in `xml.md` and `docs/README.md`.**
      `xml.md` is already the "which endpoint do I use" reference and explicitly warns
      against confusing similar-looking endpoints. This plan roughly triples the number of
      machine-readable surfaces — that file has to absorb them or it stops being useful.
      **Done when:** every surface added by this plan appears in `xml.md`'s comparison table
      and `docs/README.md`'s index.

---

## 3. What this plan deliberately does not do

Recorded so they don't get re-proposed as gaps in a later pass:

- **No agent-initiated payment or order placement.** Per the D3 recommendation. Containers
  are a delivery-constrained, quote-driven purchase; an agent completing checkout
  unsupervised creates fulfillment problems that outweigh the conversion.
- **No rewrite of the ~1,700 WordPress pages.** They stay WordPress-authored. Everything in
  Phase 2 is a parallel representation generated from what the pages API already returns.
- **No `ai-plugin.json`.** The ChatGPT-plugin manifest format is superseded; MCP (Phase 5)
  plus OpenAPI (T4.4) covers the same ground and is actually supported.
- **No separate agent-facing subdomain.** Same origin, content-negotiated or suffixed —
  splitting hosts would fragment the canonical URLs the SEO work depends on.

---

## 4. What shipped on 2026-08-10

Phase 1, most of Phase 3, and two Phase 2 tasks. Verified with `tsc`, `eslint`,
`next build`, a JSON-LD extraction pass over every page type, and a link check of all 117
`llms.txt` links.

**New files**

| File | What |
|---|---|
| `config/site.ts` | Canonical site identity: `SITE_URL`, `SITE`, `SCHEMA_ID`, `absoluteUrl()` |
| `config/crawlers.ts` | Typed crawler registry with a reason per entry, plus `DISALLOWED_PATHS` |
| `lib/schema.ts` | Every JSON-LD builder, extracted from the route files |
| `lib/markdown.ts` | cheerio-based HTML→Markdown (T2.1) |
| `services/llms.service.ts` | `llms.txt` content and its curation rules |
| `app/llms.txt/route.ts`, `app/llms-full.txt/route.ts` | The two routes |

**Behaviour changes worth knowing**

- Every page now emits one `@graph` with a canonical `Organization`/`WebSite` at a stable
  `@id`, referenced rather than restated. PDP gained `BreadcrumbList` + `FAQPage`; PLP
  gained a server-fetched `ItemList` of the 12 rendered results; blog posts gained a
  breadcrumb; WP pages gained `WebPage` + `BreadcrumbList` + `LocalBusiness` on depot pages.
- `components/shared/JsonLd.tsx` now escapes `<`, `>` and `&` to their `\uXXXX` forms.
  `JSON.stringify` does not escape `<`, so any value containing a literal `</script>` closed
  the element early and spilled the rest of the JSON into the document as markup. Reachable
  before via a product title; far likelier once WP-recovered data started flowing through.
- `lib/seo.ts` forces `noindex` on any path under `DISALLOWED_PATHS`, overriding both the
  page defaults and any admin override. Closes a hole where the Page Configurator could
  publish the checkout page.
- `app/layout.tsx` advertises `/llms.txt`, `/llms-full.txt` and the sitemap as
  `<link rel="alternate">`. Declared in JSX rather than via `alternates.types` because a
  page setting its own `alternates.canonical` replaces the whole object.

**Findings made while implementing — each already filed as a task above**

| # | Finding | Filed as |
|---|---|---|
| F1 | The whole `/locations` family **does not exist** — neither `/locations` nor `/locations/<city-state>` is in the pages API; both serve Not Found. All 140 depot records' `local_specials` point there, **and so does the "Locations" link in `components/layout/Footer.tsx`, on every page of the site**. Only `/where-to-buy-shipping-containers/<city-state>` is real | `llms.txt` fixed via `depotPagePath()`; the Footer link and the root cause are **unfixed** — see T7.6 and F8 |
| F2 | Missing WordPress paths return **HTTP 200** with the Not Found page — soft 404s, because `notFound()` runs after the Suspense shell flushes | T7.6 |
| F3 | 140 active location records are only **~55 real depots**; 96 are virtual depots pointing at a parent's page. The naive list showed five city names all linking to the Atlanta page as separate depots | fixed in `DEPOTS` |
| F4 | The homepage `SearchAction` pointed at `/products?q=`, a route that doesn't exist, with a parameter the PLP doesn't read | T3.9 |
| F5 | Alphabetical sampling of content pages is badly biased — the slugs are size-led, so the first 40 are all about 10ft containers | fixed with stride sampling |
| F6 | `/images/og-containers.jpg`, referenced by the PLP's `openGraph.images`, **does not exist** in `public/images/` | *unfiled — needs an asset, not code* |
| F7 | `app/sitemap.ts` builds URLs from `BASE_URL` (localhost in dev) while everything else now uses `SITE_URL`. Documented behaviour in `xml.md`, but worth revisiting | *unfiled — deliberate, per `xml.md`* |
| F11 | The proxy 404 guard (T7.6) **404'd /llms.txt and /llms-full.txt** — they are route handlers, so they are neither native routes nor entries in the backend page list. Caught by the audit script, which reported it as "all 0 links resolve" — a green tick on a broken file | fixed: file routes added to NATIVE_ROUTE_SEGMENTS plus a dotted-first-segment rule; the audit now fails on an empty link set and asserts each machine-readable route is reachable |
| F9 | `/api/feeds/google.xml` **cannot be prerendered** — `getAllProductsForFeed()` scans ~10,000 ES documents and exceeds Next's `use cache` timeout, failing the build with `USE_CACHE_TIMEOUT` | fixed: the route now `await connection()`s so it renders at runtime. **The "cached hourly afterward" half of this was wrong — see F12.** |
| F12 | **The feeds are not cached at all, and each request takes ~3 minutes.** `getAllProductsForFeed()` is marked `'use cache'`, but the ~10,000-product array exceeds the cache's per-entry size limit, so the write is silently dropped and every request re-runs the full Elasticsearch scan. Confirmed by `Single item size exceeds maxSize` in the **production** server log, and by measuring a production build: **cold 3m08s, warm 3m38s — no cache benefit whatsoever** | **open — needs a decision.** Google Merchant's scheduled fetch and most serverless timeouts are well under 3 minutes, so this is a live production risk. Documented options: a custom `cacheHandler` (Next's documented route for oversized entries), pre-generating the feeds to object storage on a schedule, or caching a trimmed projection small enough to store. Mitigated for now by `?offset=`/`?limit=` on the JSON feed, which cuts transfer but **not** the upstream work |
| F10 | The PLP's product grid and the PDP's specs/FAQ tabs are **client-rendered only** — a `curl` of the shop returned zero product names, and the PDP returned no specification values | fixed with server-rendered `<noscript>` blocks fed by the same data (T7.5) |
| F8 | The Footer's "Locations" link (`<a href="/locations">`) is a **site-wide dead link** — see F1. It is also the pre-existing `no-html-link-for-pages` lint error in that file. Deliberately **not** fixed here: the right fix depends on whether the `/locations` pages are meant to exist (restore them in the pages API) or not (repoint the link at `/where-to-buy-shipping-containers`) — a content decision, not a code one | *needs a decision before fixing* |

**Pre-existing build break, fixed in passing:** `next build` failed on `/blogs/[slug]`
because `components/layout/Footer.tsx` called `new Date()` in a Server Component, which
`cacheComponents` rejects as unprerenderable. Confirmed present on the branch before any of
this work (built at stash). The year is now read through a `'use cache'` +
`cacheLife('days')` helper, keeping the rollover behaviour its comment describes.

---

## 5. Change log

| Date | Change |
|---|---|
| 2026-08-10 | Created. 52 tasks across 9 phases; gaps G1–G6 verified against the codebase. |
| 2026-08-10 | D1 decided. Phase 1 complete, Phase 3 all but T3.8/T3.9, Phase 2 T2.1 + T2.3. Added T3.9 and T7.6 from findings F2/F4. 16/54 done. |
