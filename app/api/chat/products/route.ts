import { connection } from 'next/server'
import { MAX_HANDLE_CHARS, MAX_PRODUCT_HANDLES } from '@/config/chat'
import { ROUTES } from '@/config/routes'
import { withRateLimit } from '@/lib/agentApi'
import {
  getCustomFieldValue,
  getPriceBasis,
  isContainerHit,
  isGenericDisplayHit,
  isInStockHit,
} from '@/lib/pricing'
import { getProductByHandle } from '@/services/search.service'
import type { CartItem } from '@/types/cart'

/**
 * GET /api/chat/products?handles=a,b,c — resolve handles from a reply into cards.
 *
 * **This endpoint is why a chat card can be trusted.** The assistant writes
 * product links from its own index; the card is built here from the live
 * catalogue instead. So a card can never point at a page that does not exist,
 * and can never show a price the model invented — an unknown handle simply does
 * not come back, and no card is drawn for it.
 *
 * The same reason drives reusing getProductByHandle rather than querying
 * Elasticsearch directly: a chat card, a listing tile and the product page all
 * read the same record and cannot disagree about what something costs.
 */

export type ChatProductCard = {
  handle: string
  title: string
  url: string
  image?: string
  /** Already formatted for display, including the /month suffix where it applies. */
  priceLabel: string
  /** What that figure means. Never render the amount without it. */
  priceBasis: string
  inStock: boolean
  /**
   * False for a "Generic Product Page" — a template listing with no real depot
   * behind it. The card still links to the page (the assistant mentioned it,
   * and it is a real page), but it offers no Add to cart, because the PDP and
   * PLP refuse one too.
   */
  addable: boolean
  /** Exactly what a product page would hand the cart. */
  cartItem: CartItem
}

function parseHandles(raw: string | null): string[] {
  if (!raw) return []

  const seen = new Set<string>()
  const out: string[] = []

  for (const part of raw.split(',')) {
    const handle = part.trim()
    if (!handle || handle.length > MAX_HANDLE_CHARS) continue

    const key = handle.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(handle)

    if (out.length >= MAX_PRODUCT_HANDLES) break
  }

  return out
}

async function toCard(handle: string): Promise<ChatProductCard | null> {
  try {
    const result = await getProductByHandle(handle)
    const product = result?.product
    if (!product?.title) return null

    // Accessories are not containers, and stamping them as one would subject
    // them to the cart's one-depot-per-order rule for no reason.
    const isContainer = isContainerHit(product)

    const basis = getPriceBasis(product)
    const amount = product.sale_price
    const price = typeof amount === 'number' && Number.isFinite(amount) ? amount : null

    const orderType =
      basis.period === 'one-time'
        ? 'Purchase'
        : getCustomFieldValue(product, 'payment_type') === 'rental'
          ? 'Rental'
          : 'Rent-to-Own'

    return {
      handle,
      title: product.title,
      url: ROUTES.PRODUCT(handle),
      image: product.images?.[0]?.src,
      priceLabel: price === null ? 'Call for pricing' : `$${price.toLocaleString('en-US')}${basis.suffix}`,
      priceBasis: basis.termMonths ? `${basis.label} · ${basis.termMonths}-month term` : basis.label,
      inStock: isInStockHit(product),
      addable: !isGenericDisplayHit(product) && price !== null,
      cartItem: {
        id: product.objectID,
        name: product.title,
        price: price ?? 0,
        quantity: 1,
        sku: product.variants?.[0]?.sku,
        size: getCustomFieldValue(product, 'length_width'),
        condition: getCustomFieldValue(product, 'condition'),
        orderType,
        image: product.images?.[0]?.src,
        isContainer,
        location: getCustomFieldValue(product, 'location'),
        rawHit: product,
      },
    }
  } catch (err) {
    // One bad handle must not fail the batch — the rest of the shelf is still
    // useful, and a missing card is invisible to the shopper.
    console.error(`[chat] could not resolve product "${handle}":`, err)
    return null
  }
}

export async function GET(request: Request): Promise<Response> {
  await connection()

  return withRateLimit(
    request,
    async (headers) => {
      const handles = parseHandles(new URL(request.url).searchParams.get('handles'))
      if (handles.length === 0) {
        return Response.json({ products: [] }, { headers: { 'Cache-Control': 'no-store', ...headers } })
      }

      const settled = await Promise.all(handles.map(toCard))

      return Response.json(
        { products: settled.filter((card): card is ChatProductCard => card !== null) },
        {
          // Short and private: the underlying catalogue read is already cached
          // for an hour, and stock changes faster than a conversation lasts.
          headers: { 'Cache-Control': 'private, max-age=60', ...headers },
        },
      )
    },
    'light',
  )
}
