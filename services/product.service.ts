import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import type {
  Product,
  FetchProductsOptions,
  WpApiProduct,
  WpApiResponse,
  WpSingleProductResponse,
  BadgeTone,
} from '@/types/product'

const WP_SINGLE_PRODUCT_URL = 'https://onsitestorage.com/wp-json/custom/v1/product'
const WP_PRODUCTS_URL = 'https://onsitestorage.com/wp-json/custom/v1/products-v2'

const PTYPE_MAP: Record<string, string> = {
  buy:         'buy',
  rental:      'rental',
  rto:         'rto',
  accessories: 'accessories',
}

function parsePrice(price: string): number {
  return parseFloat(price.replace(/,/g, '')) || 0
}

function badgeFromTag(tag: string): { label: string; tone: BadgeTone } {
  if (!tag) return { label: 'In Stock', tone: 'green' }
  const t = tag.toLowerCase()
  if (t.includes('best') || t.includes('popular')) return { label: tag, tone: 'red' }
  if (t.includes('sale') || t.includes('deal'))    return { label: tag, tone: 'amber' }
  return { label: tag, tone: 'green' }
}

function mapProduct(wp: WpApiProduct): Product {
  return {
    id:               String(wp.productID),
    title:            wp.container_title,
    badge:            badgeFromTag(wp.tag),
    rating:           parseFloat(wp.ratings) || 0,
    reviews:          wp.review_count,
    location:         wp.location,
    price:            parsePrice(wp.product_price),
    condition:        wp.condition,
    grade:            wp.grade,
    sku:              wp.sku,
    size:             wp.size,
    height:           wp.height,
    thumbnailUrl:     wp.thumbnail_url || undefined,
    gallery:          wp.gallery ?? [],
    productPermalink: wp.product_permalink || undefined,
    paymentType:      wp.payment_type,
    stock:            wp.stock ?? 0,
    isVirtualDepo:    wp.is_virtual_depo ?? false,
  }
}

export async function fetchProduct(slug: string): Promise<WpSingleProductResponse | null> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRODUCTS)

  try {
    const res = await fetch(`${WP_SINGLE_PRODUCT_URL}?slug=${encodeURIComponent(slug)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null
    const data: unknown = await res.json()
    if (typeof data === 'object' && data !== null && 'message' in data) return null
    const response = data as WpSingleProductResponse
    if (!response.product) return null
    return response
  } catch {
    return null
  }
}

export async function fetchSaleProducts(
  opts: FetchProductsOptions = {},
): Promise<{ products: Product[]; maxPages: number }> {
  'use cache'
  cacheLife('minutes')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRODUCTS)

  const paymentType = PTYPE_MAP[opts.ptype ?? 'buy'] ?? 'buy'

  const params = new URLSearchParams({
    payment_type: paymentType,
    page:         String(opts.page ?? 1),
    sort:         opts.sort ?? 'default',
  })
  params.set('location', opts.location ?? 'Various North America')

  const res = await fetch(`${WP_PRODUCTS_URL}?${params}`)
  if (!res.ok) return { products: [], maxPages: 0 }

  const data = (await res.json()) as WpApiResponse

  const raw = data.products?.length ? data.products : (data.raw_products ?? [])
  let products = raw.map(mapProduct)

  if (opts.length_width) products = products.filter(p => p.size?.includes(opts.length_width!))
  if (opts.condition)    products = products.filter(p => p.condition === opts.condition)
  if (opts.grade)        products = products.filter(p => p.grade === opts.grade)
  if (opts.height)       products = products.filter(p => p.height === opts.height)

  return { products, maxPages: data.max_pages ?? 0 }
}
