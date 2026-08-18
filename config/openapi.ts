import { SITE, SITE_URL } from '@/config/site'
import { AGENT_API_BASE, AGENT_API_SUNSET_POLICY } from '@/lib/agentApi'

/**
 * OpenAPI 3.1 description of the agent API.
 *
 * Hand-written and version-controlled rather than generated. A generated spec
 * drifts the moment someone edits a route by hand, and — more importantly — the
 * descriptions here are *prompts*. They are read by a model deciding which call
 * to make and how to interpret the answer, so they say things a generator could
 * never infer: that a monthly price is not a total, that handles aren't
 * guessable, that depot proximity decides availability.
 *
 * Kept in `config/` because it is static app configuration, and served by
 * `app/openapi.json/route.ts`.
 */

const PRICE_WARNING =
  'IMPORTANT: `price.basis` is either `one-time` or `monthly`. About 8,000 of the ~10,000 products are rental or rent-to-own and are priced PER MONTH. `price.amount` alone is ambiguous — quote `price.description`, which spells out the basis and the full-term total in plain English.'

const priceSchema = {
  type: 'object',
  required: ['amount', 'currency', 'basis', 'description'],
  properties: {
    amount: { type: 'number', description: 'Numeric amount. Meaningless without `basis`.' },
    currency: { type: 'string', enum: ['USD'] },
    basis: {
      type: 'string',
      enum: ['one-time', 'monthly'],
      description: '`monthly` means this is a recurring payment, NOT the price of the container.',
    },
    termMonths: { type: 'integer', description: 'Contract length, for rental and rent-to-own.' },
    asOf: { type: 'string', format: 'date-time', description: 'When this figure was read. Do not present an old figure as current.' },
    validUntil: { type: 'string', format: 'date-time', description: 'After this, re-fetch rather than quoting.' },
    description: {
      type: 'string',
      description: 'Complete English sentence, safe to quote verbatim. Prefer this over `amount`.',
      examples: ['$324.63 USD per month on a 24-month rent-to-own agreement. This is NOT the total price — the total over the full term is $7791.12 USD.'],
    },
  },
} as const

const productSchema = {
  type: 'object',
  required: ['handle', 'title', 'url', 'price', 'availability', 'productType'],
  properties: {
    handle: { type: 'string', description: 'Stable identifier. Use it with /products/{handle} and /availability.' },
    title: { type: 'string' },
    url: { type: 'string', format: 'uri', description: 'Human-readable product page.' },
    markdownUrl: { type: 'string', format: 'uri', description: 'Same page as Markdown — specs, FAQ and ordering info in one fetch.' },
    sku: { type: 'string' },
    price: priceSchema,
    availability: { type: 'string', enum: ['in_stock', 'out_of_stock'] },
    productType: { type: 'string', enum: ['container', 'accessory'] },
    purchaseType: { type: 'string', enum: ['buy', 'rental', 'rent_to_own'] },
    condition: { type: 'string', examples: ['New', 'Used'] },
    grade: { type: 'string', examples: ['IICL', 'Cargo Worthy (CW)', 'Wind and Water tight (WWT)'] },
    size: { type: 'string', examples: ["20'", "40'"] },
    height: { type: 'string', examples: ['8\' 6" Standard', '9’ 6” High Cube (HC)'] },
    location: { type: 'string', description: 'Depot this listing is stocked at.' },
    image: { type: 'string', format: 'uri' },
    images: { type: 'array', items: { type: 'string', format: 'uri' } },
    rating: {
      type: 'object',
      properties: { value: { type: 'number' }, count: { type: 'integer' } },
    },
  },
} as const

const errorSchema = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      required: ['code', 'message'],
      properties: {
        code: { type: 'string', description: 'Stable machine-readable code.' },
        message: { type: 'string' },
        hint: { type: 'string', description: 'How to fix the request. Written to be actionable on a retry.' },
      },
    },
  },
} as const

const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
})

export function buildOpenApiSpec() {
  return {
    openapi: '3.1.0',
    info: {
      title: `${SITE.name} Agent API`,
      version: '1.0.0',
      description: [
        `Read-only catalog and delivery-availability API for ${SITE.name}, a shipping container retailer serving the USA and Canada.`,
        '',
        '## What this is for',
        '',
        'Answering questions like "what 40ft high cube containers can you deliver to Phoenix, and what do they cost". Containers are delivered by truck from a depot network, so **availability depends on the customer location, not just the catalog** — `/availability` is usually the call that matters, not `/search`.',
        '',
        `## ${PRICE_WARNING}`,
        '',
        '## Access',
        '',
        'No authentication. 60 requests per minute per IP; a 429 carries `Retry-After`. Responses are cacheable and CORS-open.',
        '',
        `## Versioning`,
        '',
        AGENT_API_SUNSET_POLICY,
        '',
        `See also ${SITE_URL}/llms.txt for a curated index of the site, and any page with a \`.md\` suffix for its Markdown representation.`,
      ].join('\n'),
      contact: { name: `${SITE.name} sales`, email: SITE.email, url: SITE_URL },
    },
    servers: [{ url: SITE_URL, description: 'Production' }],
    paths: {
      [`${AGENT_API_BASE}/search`]: {
        get: {
          operationId: 'searchProducts',
          summary: 'Search the container and accessory catalog',
          description:
            'Free-text and faceted search. Returns a flat array. Defaults to purchase (`buy`) listings so an unqualified search does not mix one-time and monthly prices. To find what is deliverable to a specific customer, use /availability instead — this endpoint does not know where the caller is.',
          parameters: [
            { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Free text over title, tags, SKU, specifications and category.', example: '40ft high cube' },
            { name: 'type', in: 'query', schema: { type: 'string', enum: ['containers', 'accessories'] } },
            { name: 'purchase', in: 'query', schema: { type: 'string', enum: ['buy', 'rental', 'rent_to_own'] }, description: 'Defaults to `buy`.' },
            { name: 'location', in: 'query', schema: { type: 'string' }, description: 'Depot name, e.g. "Phoenix, AZ". If you have a ZIP, call /availability instead.' },
            { name: 'condition', in: 'query', schema: { type: 'string' }, description: 'Repeatable or comma-separated.' },
            { name: 'grade', in: 'query', schema: { type: 'string' } },
            { name: 'size', in: 'query', schema: { type: 'string' }, example: "40'" },
            { name: 'height', in: 'query', schema: { type: 'string' } },
            { name: 'term', in: 'query', schema: { type: 'string' }, description: 'Contract length in months, for rental and rent-to-own.' },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 } },
            { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 } },
          ],
          responses: {
            200: {
              description: 'Matching products.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      total: { type: 'integer', description: 'Total matches, not the number returned.' },
                      count: { type: 'integer' },
                      offset: { type: 'integer' },
                      limit: { type: 'integer' },
                      priceNote: { type: 'string' },
                      products: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                    },
                  },
                },
              },
            },
            400: errorResponse('Invalid parameter. `error.hint` says what is accepted.'),
            429: errorResponse('Rate limited. Honour `Retry-After`.'),
            503: errorResponse('Search temporarily unavailable.'),
          },
        },
      },

      [`${AGENT_API_BASE}/products/{handle}`]: {
        get: {
          operationId: 'getProduct',
          summary: 'Get one product in full',
          description:
            'Full record: price with basis, specifications, FAQ, delivery expectations, and the same physical container as listed at other depots or on other payment terms (`relatedProducts`). Handles are not guessable from a product name — get them from /search.',
          parameters: [
            { name: 'handle', in: 'path', required: true, schema: { type: 'string' }, description: 'From /search.' },
          ],
          responses: {
            200: {
              description: 'The product.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      priceNote: { type: 'string' },
                      product: {
                        allOf: [
                          { $ref: '#/components/schemas/Product' },
                          {
                            type: 'object',
                            properties: {
                              specifications: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, value: { type: 'string' } } } },
                              faq: { type: 'array', items: { type: 'object', properties: { question: { type: 'string' }, answer: { type: 'string' } } } },
                              delivery: { type: 'object', description: 'Handling and transit windows, plus site-access requirements.' },
                            },
                          },
                        ],
                      },
                      relatedProducts: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                      relatedProductsNote: { type: 'string' },
                    },
                  },
                },
              },
            },
            404: errorResponse('No product with that handle.'),
            429: errorResponse('Rate limited.'),
            503: errorResponse('Lookup temporarily unavailable.'),
          },
        },
      },

      [`${AGENT_API_BASE}/availability`]: {
        get: {
          operationId: 'checkAvailability',
          summary: 'What can be delivered to a ZIP, and from which depot',
          description: [
            'The most important call in this API for any question involving a customer location.',
            '',
            'Containers ship by truck from a depot network, so a container listed in the catalog may be stocked 900 miles from the customer. This resolves a ZIP to the nearest depot and reports what that depot can actually supply.',
            '',
            'Without `handle`: the nearest depot, its distance, and a sample of its stock.',
            '',
            'With `handle`: whether that exact container is stocked there (`matchType: exact`), whether the same specification is stocked there under a different listing (`equivalent_at_depot` — **quote the `availableListing`, not the requested one, because its price and handle differ**), or neither (`none`).',
          ].join('\n'),
          parameters: [
            { name: 'zip', in: 'query', required: true, schema: { type: 'string' }, description: 'US ZIP or Canadian postal code.', example: '85001' },
            { name: 'handle', in: 'query', schema: { type: 'string' }, description: 'Optional. Check a specific product.' },
          ],
          responses: {
            200: {
              description: 'Depot and availability for that destination.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      destination: { type: 'object', properties: { zip: { type: 'string' }, city: { type: 'string' }, state: { type: 'string' }, country: { type: 'string' } } },
                      depot: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          distanceMiles: { type: 'integer' },
                          longHaul: { type: 'boolean', description: 'True beyond ~250 miles: the delivery quote will be unusual, so do not estimate one.' },
                        },
                      },
                      deliverable: { type: 'boolean' },
                      matchType: { type: 'string', enum: ['exact', 'equivalent_at_depot', 'shipped_item', 'none'] },
                      requested: { $ref: '#/components/schemas/Product' },
                      availableListing: { $ref: '#/components/schemas/Product' },
                      deliveryNote: { type: 'string' },
                      stockCount: { type: 'integer' },
                      sampleProducts: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                    },
                  },
                },
              },
            },
            400: errorResponse('`zip` missing.'),
            404: errorResponse('ZIP could not be resolved, or no product with that handle.'),
            429: errorResponse('Rate limited.'),
            503: errorResponse('Availability lookup temporarily unavailable.'),
          },
        },
      },
      [`${AGENT_API_BASE}/quote`]: quotePathItem(),
    },
    components: {
      schemas: {
        Product: productSchema,
        Price: priceSchema,
        Error: errorSchema,
      },
    },
  }
}

/**
 * The quote operation, spliced in separately because it is the only write in
 * the API and its description carries rules the read operations don't need.
 */
export function quotePathItem() {
  return {
    post: {
      operationId: 'submitQuoteRequest',
      summary: "Submit a quote request on a customer's behalf",
      description: [
        'The only write operation in this API. An agent may ask for a quote for a customer; it may NOT place an order or pay — containers need site access confirmed by a person, so a human closes the sale.',
        '',
        'This creates a real record that reaches a salesperson, so: submit once, never speculatively, and never with invented contact details. Ask the customer for anything you do not have.',
        '',
        'Limited to 5 submissions per minute. The ZIP is resolved server-side and a request to an unserviceable location is rejected with `unknown_zip`, so you can correct it while you still have the customer.',
        '',
        '**A 201 is not a quote.** No price has been agreed and nothing is reserved. Say so when you report back.',
      ].join('\n'),
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'zip'],
              properties: {
                name: { type: 'string', maxLength: 120, description: "The customer's name." },
                email: { type: 'string', format: 'email', maxLength: 200, description: "The customer's real email address." },
                zip: { type: 'string', maxLength: 20, description: 'Delivery ZIP or postal code. Validated server-side.' },
                handle: { type: 'string', description: 'Optional product handle from /search. Omit if the customer has not chosen one.' },
                quantity: { type: 'integer', minimum: 1, maximum: 100 },
                phone: { type: 'string', maxLength: 40 },
                notes: { type: 'string', maxLength: 2000, description: 'Anything the customer said that sales should know — timing, site access, intended use.' },
                agentName: { type: 'string', maxLength: 80, description: 'Which assistant is submitting. Recorded for triage, not trusted.' },
              },
              additionalProperties: false,
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Recorded. Not a quote — no price agreed, nothing reserved.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  received: { type: 'boolean' },
                  id: { type: 'string' },
                  receivedAt: { type: 'string', format: 'date-time' },
                  destination: { type: 'object' },
                  nearestDepot: { type: 'string' },
                  nextStep: { type: 'string', description: 'What happens next — safe to relay to the customer.' },
                  note: { type: 'string' },
                },
              },
            },
          },
        },
        400: errorResponse('Validation failed. `error.hint` says what to fix.'),
        429: errorResponse('Rate limited — 5 per minute.'),
        503: errorResponse('Not recorded. Do NOT tell the customer it was submitted.'),
      },
    },
  }
}
