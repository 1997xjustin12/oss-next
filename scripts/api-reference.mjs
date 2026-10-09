/**
 * Renders the API reference into a PDF.
 *
 *   node scripts/api-reference.mjs
 *
 * Writes `docs/api-reference.pdf`. The content lives in this file rather than
 * a JSON sidecar because `/docs` is gitignored — a generator whose data is not
 * tracked cannot be re-run from a fresh clone, which is the flaw the existing
 * `security-report.mjs` has. Everything needed is here.
 *
 * Only endpoints that are reachable today are listed. Every route under
 * `app/api/` was checked for a caller; the three with none are in the document
 * and labelled, because each is deliberately called from outside the app.
 *
 * The PDF writer is scripts/lib/pdf.mjs, shared with the changelog and
 * security reports.
 */

import { mkdirSync } from 'node:fs'
import { Doc, RGB, writePdf } from './lib/pdf.mjs'

const OUT = 'docs/api-reference.pdf'

/* ── content ───────────────────────────────────────────────────────────── */

const INTRO = [
  'Every endpoint this storefront uses, grouped by the part of the site that calls it. Generated from the route handlers and service layer in the repository, not maintained by hand.',
  'Three layers appear here and it is worth keeping them apart. The browser only ever calls a Next.js route handler under /api/. That handler then calls an upstream: the Django backend, Elasticsearch, or a third party. The same name often appears on both sides — /api/orders/get-total is a route handler that calls the backend path api/orders/get-total — and they are not the same thing. The route handler is where the session cookie is read, the upstream key is attached and the response is reshaped.',
]

const SECTIONS = [
  {
    title: 'Elasticsearch — the product index',
    note: 'The only source of product data. The Django backend holds orders, carts and customers; it does not serve the catalogue.',
    rows: [
      ['Endpoint', 'ELASTIC_URL (env) — defaults to http://localhost:9200'],
      ['Auth', 'ELASTIC_API_KEY (env), sent as an API key header by the @elastic/elasticsearch client'],
      ['Index', 'NEXT_PUBLIC_SEARCH_INDEX (env) — defaults to onsite_products_index'],
      ['Client', 'services/search.service.ts — one shared Client instance'],
      ['Volume', '10,264 published documents as of 2026-09-30'],
    ],
    listNote: 'Seven functions issue a query, and nothing else in the app touches the index:',
    list: [
      ['cachedEsSearch', 'The widest one. Backs the listing, instant search, the agent API, the MCP tools and the Markdown renderer.'],
      ['cachedCustomFieldsSearch', 'Faceted lookup by location and category. Also builds the PDP size/condition/grade selector via related_products.'],
      ['getProductByHandle', 'One product by its URL handle. Returns null for anything unpublished, which the PDP turns into a 404 page.'],
      ['getProductsByIds', 'Order-history enrichment.'],
      ['getProductsBySkus', 'Restoring a saved cart.'],
      ['getAllProductHandles', 'Sitemap generation.'],
      ['getAllProductsForFeed', 'The Google Merchant and JSON Lines feeds.'],
    ],
    after: [
      'getShippingContainersByLocation is not an eighth: it calls cachedCustomFieldsSearch and returns its hits, so it inherits that query rather than issuing one.',
      'All seven filter on status: publish, added 2026-09-30 — before that, 264 draft and private documents were reachable, and an unpublished container could be selected and added to the cart.',
      'status is a text field, so term matches its single analysed token. Aggregating on it needs status.keyword.',
    ],
  },

  {
    title: 'Search box — instant search on the listing',
    note: 'There is one search box in the app: the instant-search field on /sale-shipping-containers. It is a react-instantsearch client pointed at our own route rather than at Algolia.',
    endpoints: [
      ['POST', '/api/search', 'The InstantSearch protocol, served from Elasticsearch. Takes { indexName, params } and returns one result object per request, in order. Params cover query, pagination, facets and every filter the panel offers: product type, location, sort, size, condition, grade, height, container type and accessory category.'],
    ],
    after: [
      'Replies are paired to queries by position, so the route always returns exactly one entry per request — returning a bare { results: [] } on failure used to crash the whole listing into its error boundary.',
      'Called from InstantSearchSection.tsx, AddedToCartModal.tsx and lib/agentApi.ts.',
    ],
  },

  {
    title: 'Product listing (PLP) — /sale-shipping-containers',
    endpoints: [
      ['POST', '/api/search', 'As above. The listing\'s primary data source for both containers and accessories.'],
      ['GET', '/api/shipping-containers', 'General filtered catalogue query, paginated. Reserved params are page, pageSize, product_category and all; any other param is treated as a custom_fields name and matched against its value. Repeat a key or comma-separate to match several values. all=true returns everything up to ALL_RESULTS_CAP and sets pagination.truncated past it.'],
      ['GET', '/api/shipping-containers/by-location', 'Containers stocked at one depot. Returns a uniform 72 published containers per depot.'],
      ['GET', '/api/shipping-containers/starting-prices', 'The "from" price per featured container, for the homepage and category tiles.'],
      ['GET', '/api/geoapify', 'ZIP and address autocomplete for the location filter. Proxied so the Geoapify key stays server-side, and rate-limited per visitor against a daily budget.'],
    ],
  },

  {
    title: 'Product detail (PDP) — /product/[slug]',
    note: 'The page itself is server-rendered from getProductByHandle. These are the routes its client components call afterwards.',
    endpoints: [
      ['GET', '/api/delivery-rates', 'A delivery quote for one product and ZIP. Resolves the product, then asks the backend for an order total — so the PDP quote and the checkout total come from the same calculation.'],
      ['GET', '/api/reviews', 'Reviews for a container size — ?variant=20S|40S|40H&limit=15. Keyed by size, not by product, so every product of a size shows the same set. Rejects anything else with a 400.'],
      ['GET', '/api/reviews/list', 'Reviews for one product — ?product_id=…&page=1. The per-product list, where the route above is the per-size one.'],
      ['POST', '/api/reviews/create', 'Submit a review.'],
      ['PUT', '/api/reviews/update', 'Edit a review the customer already left.'],
      ['GET', '/api/products/by-ids', 'Resolve product ids — used by order history and Buy Again.'],
      ['GET', '/api/products/by-skus', 'Resolve SKUs when restoring a saved cart. A line whose product is no longer published is dropped rather than carried to checkout.'],
    ],
  },

  {
    title: 'Cart',
    note: 'The cart lives on the backend once a customer is signed in; guests keep it in local storage until checkout.',
    endpoints: [
      ['GET', '/api/cart/active', 'The signed-in customer\'s open cart.'],
      ['POST', '/api/cart/create', 'Open a server cart.'],
      ['PUT', '/api/cart/update', 'Add, remove or change quantities.'],
      ['POST', '/api/cart/close', 'Close the cart — on order placement, or when it is abandoned.'],
      ['POST', '/api/abandoned-carts/create', 'Record a cart the visitor left behind.'],
    ],
  },

  {
    title: 'Checkout and payment',
    endpoints: [
      ['POST', '/api/orders/get-total', 'Line totals, delivery and sales tax for a cart. Also the engine behind the PDP and quote-page figures. Tax is returned once the shipping address is supplied.'],
      ['GET', '/api/braintree_token', 'A Braintree client token for the card fields. Sandbox or production depending on BRAINTREE_ENVIRONMENT.'],
      ['POST', '/api/checkout/place-order', 'Price, charge and record in one server step — and void the charge if recording fails, so a customer is never charged for an order that was not written.'],
    ],
  },

  {
    title: 'Accounts and authentication',
    note: 'Session is a cookie set by the login route. The admin gate is separate — see lib/adminSession.ts.',
    endpoints: [
      ['POST', '/api/auth/login', 'Authenticate and set the session cookie.'],
      ['POST', '/api/auth/register', 'Create an account.'],
      ['POST', '/api/logout', 'Clear the session.'],
      ['POST', '/api/refresh', 'Refresh the backend access token.'],
      ['GET', '/api/auth/profile', 'The signed-in customer.'],
      ['PATCH', '/api/auth/account-details', 'Update name, email and contact details.'],
      ['PUT', '/api/auth/change-password', 'Change password while signed in.'],
      ['POST', '/api/auth/lost-password', 'Start a password reset.'],
      ['POST', '/api/reset-password', 'Complete a password reset from the emailed link.'],
      ['GET', '/api/auth/orders', 'Order history.'],
      ['GET', '/api/auth/orders/tracking', 'Tracking for one or more order numbers.'],
    ],
  },

  {
    title: 'Assistant (chat)',
    endpoints: [
      ['GET', '/api/chat/availability', 'Whether this visitor may be shown the assistant. Region-locked via CHAT_REGION_LOCK.'],
      ['POST', '/api/chat', 'Proxy to the backend assistant.'],
      ['GET', '/api/chat/history', 'Stored conversations.'],
      ['GET', '/api/chat/products', 'Resolve handles named in a reply into product cards.'],
    ],
  },

  {
    title: 'Content',
    endpoints: [
      ['GET', '/api/blogs/[[...slug]]', 'Blog index and post detail, from the backend.'],
      ['GET', '/api/sitemap', 'Proxy for the backend sitemap, by type.'],
      ['POST', '/api/subscribers/subscribe', 'Newsletter sign-up.'],
      ['POST', '/api/subscribers/unsubscribe', 'Newsletter opt-out.'],
    ],
  },

  {
    title: 'Machine-readable surfaces',
    note: 'Built for crawlers, AI assistants and merchant feeds rather than the browser.',
    endpoints: [
      ['GET', '/api/agent/v1/search', 'Product search for agents.'],
      ['GET', '/api/agent/v1/products/{handle}', 'One product, including specifications and FAQ.'],
      ['GET', '/api/agent/v1/availability', 'Stock and delivery availability for a ZIP.'],
      ['POST/GET', '/api/agent/v1/quote', 'An agent submits a quote request on a customer\'s behalf.'],
      ['POST/GET/DELETE', '/api/mcp', 'Remote MCP endpoint, Streamable HTTP, stateless.'],
      ['GET', '/api/md/[[...slug]]', 'Markdown view of any page. Never linked — proxy.ts rewrites .md requests to it. No in-app caller by design.'],
      ['GET', '/api/feeds/google.xml', 'Google Merchant Center feed, RSS 2.0 with the g: namespace. Cached.'],
      ['GET', '/api/feeds/products.jsonl', 'The whole catalogue as JSON Lines.'],
    ],
  },

  {
    title: 'Operations and webhooks',
    note: 'Called by machines, not the browser. The first three share one secret.',
    endpoints: [
      ['POST', '/api/revalidate', 'Bust the cache by tag, or everything. Header: x-revalidate-token.'],
      ['POST', '/api/revalidate-plp', 'Bust the listing cache only. Same header. No in-app caller — it is a webhook.'],
      ['GET/POST', '/api/maintenance', 'Read or flip the maintenance wall. Same header. No redeploy — it sets a Redis flag the proxy reads.'],
      ['GET', '/api/search-health', 'Connectivity check: counts documents in the index and reports which keys are set, as booleans. No values. No in-app caller — it is for operators.'],
    ],
    after: [
      'REVALIDATE_SECRET gates the first three. Nothing in the app stores a copy of it: the only sender is the maintenance-control page, which takes it from a field a human types into. Rotating it therefore breaks only external callers.',
    ],
  },
]

const UPSTREAMS = {
  title: 'Upstreams',
  note: 'What the route handlers call. None of these is reachable from the browser.',
  groups: [
    {
      name: 'Django backend — NEXT_OSS_BACKEND_URL, keyed by NEXT_OSS_BACKEND_KEY',
      paths: [
        'api/auth/login · api/auth/register/ · api/auth/profile · api/auth/change-password',
        'api/auth/lost-password/ · api/auth/reset-password · api/auth/token/refresh · api/auth/orders',
        'orders/tracking/track/{orderNumber}/',
        'api/cart/active · api/cart/create · api/cart/update · api/cart/close',
        'api/abandoned-carts/create/',
        'api/orders/get-total · api/orders/checkout',
        'api/reviews/list · api/reviews/create · api/reviews/{id}/update',
        'api/subscribers/subscribe/ · api/subscribers/unsubscribe/',
        'api/blogs/?store={STORE_KEY} · api/pages/detail/{slug} · api/sitemap/?type={type}',
        'api/chat/ · api/chat/history',
      ],
    },
    {
      name: 'Elasticsearch',
      paths: ['ELASTIC_URL, index onsite_products_index — see the first section'],
    },
    {
      name: 'Geoapify',
      paths: [
        'https://api.geoapify.com/v1/geocode/autocomplete',
        'Server-side only, behind /api/geoapify. Guarded by a per-visitor rate limit and GEOAPIFY_DAILY_BUDGET.',
      ],
    },
    {
      name: 'Braintree',
      paths: [
        'Via the braintree SDK rather than a URL. Sandbox unless BRAINTREE_ENVIRONMENT is exactly "production".',
        'Used for the client token and for charging, voiding and refunding.',
      ],
    },
    {
      name: 'Upstash Redis',
      paths: [
        'NEXT_UPSTASH_REDIS_REST_URL, token NEXT_UPSTASH_REDIS_REST_TOKEN.',
        'Holds the maintenance flag, per-page SEO overrides, editable content and the Geoapify budget counters.',
      ],
    },
    {
      name: 'Google reCAPTCHA',
      paths: ['Verified server-side with RECAPTCHA_SECRET_KEY on the forms that use it.'],
    },
  ],
}

/* ── render ────────────────────────────────────────────────────────────── */

const d = new Doc()

d.text('API reference', { size: 21, bold: true })
d.space(2)
d.text('On-Site Storage Solutions storefront  ·  oss_pages', { size: 11, colour: RGB.mid })
d.rule()

d.pair('Generated', new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC')
d.pair('Branch', 'integrate-wp-render')
d.pair('Route handlers', '51, all reachable')
d.pair('Deprecated endpoints', 'none — nothing in app/api is unused or marked deprecated')

d.rule()
for (const p of INTRO) {
  d.text(p, { colour: RGB.mid })
  d.space(6)
}

for (const section of SECTIONS) {
  d.rule({ gap: 13 })
  d.text(section.title, { size: 14, bold: true })
  if (section.note) {
    d.space(4)
    d.text(section.note, { size: 9, colour: RGB.muted })
  }
  d.space(7)

  for (const [label, value] of section.rows ?? []) {
    d.text(label, { size: 9, bold: true })
    d.text(value, { size: 9, colour: RGB.mid, indent: 10 })
    d.space(3)
  }

  for (const [method, path, desc] of section.endpoints ?? []) {
    d.space(3)
    d.chip(method, path, { colour: method.startsWith('GET') ? RGB.navy : RGB.red })
    d.text(desc, { size: 9, colour: RGB.ink, indent: 8 })
    d.space(2)
  }

  if (section.listNote) {
    d.space(4)
    d.text(section.listNote, { size: 9, colour: RGB.mid })
    d.space(5)
  }

  for (const [name, desc] of section.list ?? []) {
    d.text(name, { size: 9, bold: true, indent: 8 })
    d.text(desc, { size: 9, colour: RGB.mid, indent: 18 })
    d.space(3)
  }

  for (const p of section.after ?? []) {
    d.space(4)
    d.text(p, { size: 9, colour: RGB.mid })
  }
}

d.rule({ gap: 14 })
d.text(UPSTREAMS.title, { size: 15, bold: true })
d.space(4)
d.text(UPSTREAMS.note, { size: 9, colour: RGB.muted })

for (const group of UPSTREAMS.groups) {
  d.space(9)
  d.text(group.name, { size: 10, bold: true })
  d.space(3)
  for (const p of group.paths) {
    d.text(p, { size: 8.5, colour: RGB.mid, indent: 10 })
    d.space(1)
  }
}

mkdirSync('docs', { recursive: true })
const bytes = writePdf(d, OUT, 'oss_pages API reference')
console.log(`${OUT} — ${d.pages.length} pages, ${(bytes / 1024).toFixed(1)} KB`)
