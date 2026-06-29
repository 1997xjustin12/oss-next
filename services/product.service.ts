import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import { BASE_URL } from '@/lib/helpers'
import type {
  Product,
  FetchProductsOptions,
  WpApiProduct,
  WpApiResponse,
  WpSingleProductResponse,
  BadgeTone,
  Accessory,
  WpAccessoryProduct,
  WpAccessoriesResponse,
} from '@/types/product'

const WP_ORIGIN                = 'https://onsitestorage.com'
const WP_SINGLE_PRODUCT_URL    = `${WP_ORIGIN}/wp-json/custom/v1/product`
const WP_PRODUCTS_URL          = `${WP_ORIGIN}/wp-json/custom/v1/products-v2`
const WP_ACCESSORIES_URL       = `${WP_ORIGIN}/wp-json/custom/v1/accessories`

function rebasePermalink(permalink: string): string {
  if (!permalink.startsWith(WP_ORIGIN)) return permalink
  return BASE_URL.replace(/\/$/, '') + permalink.slice(WP_ORIGIN.length)
}

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
    price:            parsePrice(wp.sale_price || wp.product_price),
    condition:        wp.condition,
    grade:            wp.grade,
    sku:              wp.sku,
    size:             wp.size,
    height:           wp.height,
    thumbnailUrl:     wp.thumbnail_url || undefined,
    gallery:          wp.gallery ?? [],
    productPermalink: wp.product_permalink ? rebasePermalink(wp.product_permalink) : undefined,
    paymentType:      wp.payment_type,
    monthly:          wp.monthly_price ? parsePrice(wp.monthly_price) : null,
    rtoOffer:         wp.rto_offer ?? null,
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

function mapAccessory(wp: WpAccessoryProduct): Accessory {
  return {
    id:           String(wp.productID),
    title:        wp.product_name,
    price:        parsePrice(wp.sale_price || wp.product_price),
    thumbnailUrl: wp.thumbnail_url || undefined,
    permalink:    wp.product_permalink ? rebasePermalink(wp.product_permalink) : undefined,
    sku:          wp.sku ?? '',
    category:     wp.payment_type ?? 'accessories',
    badge:        badgeFromTag(wp.condition ?? ''),
    rating:       parseFloat(wp.ratings ?? '0') || 0,
    reviews:      wp.review_count ?? 0,
  }
}

export async function fetchAccessories(opts: {
  page?: number
  perPage?: number
  sort?: string
  category?: string
} = {}): Promise<{ accessories: Accessory[]; maxPages: number }> {
  'use cache'
  cacheLife('minutes')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRODUCTS)

  const params = new URLSearchParams({
    page:     String(opts.page ?? 1),
    per_page: String(opts.perPage ?? 20),
    sort:     opts.sort ?? 'default',
    category: opts.category ?? 'accesories',
  })

  try {
    const res = await fetch(`${WP_ACCESSORIES_URL}?${params}`)
    if (!res.ok) return { accessories: [], maxPages: 0 }
    const data = (await res.json()) as WpAccessoriesResponse
    return {
      accessories: (data.products ?? []).map(mapAccessory),
      maxPages:    data.max_pages ?? 0,
    }
  } catch {
    return { accessories: [], maxPages: 0 }
  }
}
