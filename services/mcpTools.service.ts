import { cachedEsSearch, getProductByHandle, getShippingContainersByLocation, DEFAULT_LOCATION } from '@/services/search.service'
import { getPageMarkdown } from '@/services/pageMarkdown.service'
import { toAgentProduct, toAgentProductDetail } from '@/lib/agentProduct'
import { findEquivalentContainer, isContainerHit } from '@/lib/pricing'
import { findNearestLocation } from '@/lib/locations'
import { lookupZipGeo } from '@/lib/zippopotam'
import { SITE, absoluteUrl } from '@/config/site'
import { argInt, argString, toolError, toolResult, type McpTool } from '@/lib/mcp'
import type { ProductHit } from '@/types/product'

/**
 * The tools this MCP server exposes.
 *
 * Each is a thin wrapper over the same service call its `/api/agent/v1/*`
 * counterpart makes — deliberately the *service*, not an HTTP request to our
 * own endpoint. A self-request would add a network hop, a second rate-limit
 * charge, and a failure mode where the function can't reach itself; sharing the
 * normaliser in `lib/agentProduct.ts` gives identical response shapes without
 * any of that.
 *
 * ## Descriptions are prompts
 *
 * A tool description is read by a model deciding whether to call it. These say
 * what the tool answers, when to prefer another one, and — the recurring
 * hazard in this catalog — that a price may be monthly. Every tool that returns
 * a product repeats the price warning, because a model may only read one.
 */

const PRICE_WARNING =
  'IMPORTANT: about 8,000 of the ~10,000 products are rental or rent-to-own and are priced PER MONTH. Every price is an object with a `basis` field and a plain-English `description` — quote `price.description`, never the bare `price.amount`.'

/** Read-only, side-effect free, and safe to retry. */
const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
} as const

const KM_PER_MILE = 1.609344
const LONG_HAUL_KM = 400

export const MCP_TOOLS: McpTool[] = [
  // ── 1. Search ─────────────────────────────────────────────────────────────
  {
    name: 'search_containers',
    title: 'Search shipping containers and accessories',
    description: [
      `Search ${SITE.name}'s catalog of shipping containers and accessories by keyword and attributes.`,
      '',
      'Use this to find products by size, condition, grade or purchase type. Defaults to one-time purchase listings so results are not a mix of monthly and one-time prices.',
      '',
      'Do NOT use this to answer "can you deliver to <place>" — this endpoint has no notion of the customer location. Call `check_delivery` instead, which resolves a ZIP to the depot that would actually serve it.',
      '',
      PRICE_WARNING,
    ].join('\n'),
    annotations: { ...READ_ONLY, title: 'Search catalog' },
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free text, e.g. "40ft high cube" or "container ramp".' },
        type: { type: 'string', enum: ['containers', 'accessories'], description: 'Product family. Defaults to containers.' },
        purchase: {
          type: 'string',
          enum: ['buy', 'rental', 'rent_to_own'],
          description: 'Purchase type. Defaults to `buy` (one-time price). `rental` and `rent_to_own` return MONTHLY prices.',
        },
        condition: { type: 'string', description: 'e.g. "New" or "Used".' },
        grade: { type: 'string', description: 'e.g. "IICL", "Cargo Worthy (CW)", "Wind and Water tight (WWT)".' },
        size: { type: 'string', description: "e.g. \"20'\" or \"40'\"." },
        location: { type: 'string', description: 'Depot name, e.g. "Phoenix, AZ". If you have a ZIP, use check_delivery instead.' },
        limit: { type: 'integer', minimum: 1, maximum: 25, description: 'Results to return. Default 10.' },
      },
      required: [],
      additionalProperties: false,
    },
    async handler(args) {
      const purchase = argString(args, 'purchase')
      const paymentType =
        argString(args, 'type') === 'accessories'
          ? 'accessories'
          : purchase === 'rental'
            ? 'rental'
            : purchase === 'rent_to_own'
              ? 'rto'
              : 'buy'

      const limit = argInt(args, 'limit', 10, 1, 25)
      const multi = (name: string) => {
        const value = argString(args, name)
        return value ? [value] : []
      }

      try {
        const { hits, total } = await cachedEsSearch({
          query: argString(args, 'query') ?? '',
          hitsPerPage: limit,
          page: 0,
          facets: [],
          facetFilters: [],
          productType: paymentType,
          locationFilter: argString(args, 'location') ?? DEFAULT_LOCATION,
          sortParam: 'default',
          accessoryCategory: undefined,
          sizeFilter: multi('size'),
          conditionFilter: multi('condition'),
          gradeFilter: multi('grade'),
          heightFilter: [],
          containerTypeFilter: [],
          termFilter: [],
        })

        return toolResult({
          total,
          returned: hits.length,
          priceNote: PRICE_WARNING,
          products: (hits as ProductHit[]).map((p) => toAgentProduct(p)),
        })
      } catch (err) {
        console.error('[mcp] search_containers failed:', err)
        return toolError('Product search is temporarily unavailable.', 'Retry in a few seconds.')
      }
    },
  },

  // ── 2. Product detail ─────────────────────────────────────────────────────
  {
    name: 'get_product',
    title: 'Get full product detail',
    description: [
      'Full detail for one product: price with its basis, specifications, FAQ, delivery expectations, and the same physical container as listed at other depots or on other payment terms.',
      '',
      'Requires a `handle`, which comes from `search_containers` or `check_delivery`. Handles are not guessable from a product name — do not construct one.',
      '',
      PRICE_WARNING,
    ].join('\n'),
    annotations: { ...READ_ONLY, title: 'Get product' },
    inputSchema: {
      type: 'object',
      properties: {
        handle: { type: 'string', description: 'Product handle from a previous search or availability result.' },
      },
      required: ['handle'],
      additionalProperties: false,
    },
    async handler(args) {
      const handle = argString(args, 'handle')
      if (!handle) return toolError('A `handle` is required.', 'Get one from search_containers.')

      try {
        const result = await getProductByHandle(handle)
        if (!result) {
          return toolError(
            `No product with handle "${handle}".`,
            'Handles come from search_containers — they cannot be derived from a product name.',
          )
        }
        return toolResult({
          priceNote: PRICE_WARNING,
          product: toAgentProductDetail(result.product as ProductHit),
          relatedProducts: (result.related_products as ProductHit[]).slice(0, 8).map((p) => toAgentProduct(p)),
          relatedProductsNote:
            'The same physical container listed at other depots or on other payment terms. Use check_delivery to find which is deliverable to a given ZIP.',
        })
      } catch (err) {
        console.error('[mcp] get_product failed:', err)
        return toolError('Product lookup is temporarily unavailable.', 'Retry in a few seconds.')
      }
    },
  },

  // ── 3. Delivery availability ──────────────────────────────────────────────
  {
    name: 'check_delivery',
    title: 'Check delivery availability for a ZIP code',
    description: [
      'THE tool for any question involving a customer location: "can you deliver to X", "what do you have near Y", "how far is the nearest depot".',
      '',
      `${SITE.name} delivers containers by truck from a depot network, so what is available depends on where the customer is — not just on the catalog. A container in the catalog may be stocked hundreds of miles away.`,
      '',
      'Without `handle`: returns the nearest depot for the ZIP, its distance, and a sample of what it stocks.',
      '',
      'With `handle`: reports whether that exact container is stocked there (`exact`), whether the same specification is stocked there under a different listing (`equivalent_at_depot` — quote the `availableListing`, NOT the requested product, because its price and handle differ), or neither (`none`).',
      '',
      PRICE_WARNING,
    ].join('\n'),
    annotations: { ...READ_ONLY, title: 'Check delivery' },
    inputSchema: {
      type: 'object',
      properties: {
        zip: { type: 'string', description: 'US ZIP code (e.g. "85001") or Canadian postal code (e.g. "T2P 1J9").' },
        handle: { type: 'string', description: 'Optional. Check whether one specific product can be served from the nearest depot.' },
      },
      required: ['zip'],
      additionalProperties: false,
    },
    async handler(args) {
      const zip = argString(args, 'zip')
      if (!zip) return toolError('A `zip` is required.', 'Pass a US ZIP or Canadian postal code.')

      const geo = await lookupZipGeo(zip)
      if (!geo) {
        return toolError(
          `Could not resolve "${zip}" to a location.`,
          'Only the USA and Canada are served. Use a 5-digit US ZIP or a Canadian postal code.',
        )
      }

      const nearest = findNearestLocation(geo.latitude, geo.longitude)
      if (!nearest) return toolError('No depot data is available right now.')

      const distanceMiles = Math.round(nearest.distanceKm / KM_PER_MILE)
      const longHaul = nearest.distanceKm > LONG_HAUL_KM
      const destination = { zip, city: geo.city, state: geo.state, country: geo.countryCode }
      const depot = { name: nearest.title, distanceMiles, longHaul }

      const deliveryNote = longHaul
        ? `The nearest depot is about ${distanceMiles} miles away — further than a routine delivery. Tell the customer to call ${SITE.telephoneDisplay} for a delivered price rather than quoting one.`
        : 'Delivery is typically 3-5 days after a 1-2 day handling window. The site needs roughly 12ft of width for truck access and clear space to manoeuvre.'

      let stock: ProductHit[]
      try {
        stock = (await getShippingContainersByLocation(nearest.title)) as ProductHit[]
      } catch (err) {
        console.error('[mcp] check_delivery stock lookup failed:', err)
        return toolError('Availability lookup is temporarily unavailable.', 'Retry in a few seconds.')
      }

      const handle = argString(args, 'handle')
      if (!handle) {
        return toolResult({
          destination,
          depot,
          deliverable: true,
          deliveryNote,
          stockCount: stock.length,
          sampleProducts: stock.slice(0, 10).map((p) => toAgentProduct(p)),
          priceNote: PRICE_WARNING,
        })
      }

      let result
      try {
        result = await getProductByHandle(handle)
      } catch (err) {
        console.error('[mcp] check_delivery product lookup failed:', err)
        return toolError('Product lookup is temporarily unavailable.', 'Retry in a few seconds.')
      }
      if (!result) {
        return toolError(`No product with handle "${handle}".`, 'Handles come from search_containers.')
      }

      const product = result.product as ProductHit

      if (!isContainerHit(product)) {
        return toolResult({
          destination,
          depot,
          requested: toAgentProduct(product),
          deliverable: true,
          matchType: 'shipped_item',
          deliveryNote: 'Accessories ship by parcel carrier nationwide and are not tied to a depot.',
        })
      }

      const exact = stock.find((hit) => hit.handle === product.handle)
      const equivalent = exact ? undefined : findEquivalentContainer(stock, product)
      const match = exact ?? equivalent

      return toolResult({
        destination,
        depot,
        requested: toAgentProduct(product),
        deliverable: Boolean(match),
        matchType: exact ? 'exact' : equivalent ? 'equivalent_at_depot' : 'none',
        ...(match ? { availableListing: toAgentProduct(match) } : {}),
        deliveryNote: match
          ? deliveryNote
          : `This container is not stocked at ${nearest.title}. Tell the customer to call ${SITE.telephoneDisplay} — it can usually be moved between depots, but the delivered price will differ.`,
        matchNote:
          'The catalog lists the same physical container once per depot. An "equivalent_at_depot" match is the same specification stocked locally and is the listing to quote — its price and handle differ from the one requested.',
        priceNote: PRICE_WARNING,
      })
    },
  },

  // ── 4. Page content ───────────────────────────────────────────────────────
  {
    name: 'get_page_content',
    title: 'Read a page as Markdown',
    description: [
      `Fetch any page on ${SITE.url} as clean Markdown — policies, buying guides, delivery information, per-city depot pages, and blog articles.`,
      '',
      'Use this when the answer is editorial rather than catalog data: shipping and returns policy, financing terms, site-access requirements, container grade explanations, "where to buy in <city>".',
      '',
      `Paths come from ${absoluteUrl('/llms.txt')}, which is a curated index of this site. Pass the path only, e.g. "/privacy-policy" or "/where-to-buy-shipping-containers/atlanta-ga".`,
      '',
      'For product prices and stock, use search_containers or check_delivery instead — those return structured data, this returns prose.',
    ].join('\n'),
    annotations: { ...READ_ONLY, title: 'Read page' },
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Site-relative path, e.g. "/shipping-policy". A full URL on this site is also accepted.',
        },
      },
      required: ['path'],
      additionalProperties: false,
    },
    async handler(args) {
      const raw = argString(args, 'path')
      if (!raw) return toolError('A `path` is required.', `Find paths in ${absoluteUrl('/llms.txt')}.`)

      // Accept a full URL and reduce it to a path, so a model that pasted a
      // link from llms.txt isn't punished for it.
      const path = raw.replace(/^https?:\/\/[^/]+/i, '') || '/'
      const segments = path.split('?')[0].split('#')[0].split('/').filter(Boolean)

      try {
        const page = await getPageMarkdown(segments)
        if (!page) {
          return toolError(
            `No readable page at "${path}".`,
            `Private pages (cart, checkout, account) have no readable form. Valid paths are listed in ${absoluteUrl('/llms.txt')}.`,
          )
        }
        return {
          content: [{ type: 'text' as const, text: page.markdown }],
          structuredContent: { title: page.title, canonical: page.canonical, path },
        }
      } catch (err) {
        console.error('[mcp] get_page_content failed:', err)
        return toolError('Page lookup is temporarily unavailable.', 'Retry in a few seconds.')
      }
    },
  },
]

export const MCP_TOOLS_BY_NAME = new Map(MCP_TOOLS.map((tool) => [tool.name, tool]))
