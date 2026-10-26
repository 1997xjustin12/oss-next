import Image from 'next/image'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { Stars } from '@/components/product/Stars'
import { ROUTES } from '@/config/routes'
import { formatPrice } from '@/lib/formatters'
import { displayRating } from '@/lib/ratings'
import type { ProductHit } from '@/types/product'

/**
 * Months the "or Purchase for as low as …" line divides by.
 *
 * **Unconfirmed.** `payment_term` is empty on every `buy` product, so this is
 * not in the catalogue — the number is read back from the reference design,
 * where all four figures divide out at exactly 22 (1,350/61.36, 1,800/81.82,
 * 2,000/90.91, 2,900/131.82).
 *
 * It is a price shown to customers, so it wants confirming before launch
 * rather than after. One constant to change if it is wrong.
 */
const PURCHASE_FINANCING_MONTHS = 22

/**
 * The headline price, without the trailing `.00` on a whole number.
 *
 * The design reads "Starting at 1,350 … as low as 61.36/month": the up-front
 * figure is a round number, the monthly one is not, and showing `1,350.00`
 * beside `61.36` makes the first look like false precision. Cents are kept
 * whenever a price actually has them.
 */
function wholeDollars(value: number): string {
  const formatted = formatPrice(value)
  return formatted.endsWith('.00') ? formatted.slice(0, -3) : formatted
}

type Props = { product: ProductHit }

export function FeaturedContainerCard({ product }: Props) {
  // `desc_title` is the clean derived name — "Used WWT 20ft Shipping Container
  // for Sale". The raw `title` is two names joined by `||`, which is a known
  // data problem rather than something to render.
  const title = product.desc_title || product.title
  const handle = String(product.handle ?? '')
  const image = product.images?.[0]?.src ?? ''
  const price = Number(product.sale_price) || 0
  const monthly = price > 0 ? price / PURCHASE_FINANCING_MONTHS : 0

  const { value: rating, count: reviews } = displayRating(product.ratings)

  return (
    <Link
      href={ROUTES.PRODUCT(handle)}
      // Hover as on the WordPress page: a 2px brand-red border and a tight
      // shadow, eased in. The border is 2px at rest too, so nothing moves.
      className="group flex h-full w-full flex-col overflow-hidden rounded-lg border-2 border-theme-border bg-white
                 shadow-sm transition-[border-color,box-shadow] duration-700 hover:border-theme-primary hover:shadow-[1px_2px_5px_-1px_rgba(0,0,0,0.49)]
                 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary
                 dark:border-neutral-800 dark:bg-neutral-900"
    >
      {/*
        Shown on every card, which is a deliberate change from reading
        `sales_tags`.

        That field is real but uneven: three of Atlanta's four featured
        containers carry `bestseller` and the fourth does not, so a data-driven
        badge left one card without its red bar while its neighbours had one —
        the same size, but visibly the odd one out. The four here are a curated
        set rather than a search result, so the band reads as one unit and the
        badge is part of the frame rather than a claim about each product.

        If it should go back to being per-product, the field is
        `sales_tags` and the test was `.includes('bestseller')`.
      */}
      <p className="bg-theme-primary py-2 text-center text-xs font-extrabold uppercase tracking-wider text-white">
        Bestseller
      </p>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/*
          Clamped to two lines. These names run long and differ in length, so
          without it one card's image starts lower than its neighbours' and
          nothing below lines up.
        */}
        <h3 className="line-clamp-2 min-h-[2.75rem] text-center text-sm font-bold leading-snug text-[#0F3A59] dark:text-neutral-100">
          {title}
        </h3>

        {/* Same fixed box as the option cards, for the same reason: the source
            photographs differ in size and shape. */}
        <div className="relative w-full overflow-hidden rounded-md aspect-4/3">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 23vw"
              className="object-contain"
            />
          ) : null}

          {/*
            The hover state from the design. `pointer-events-none` so it never
            becomes the click target — the whole card is already the link, and
            an overlay that swallowed the click would make the card feel broken
            at exactly the moment someone meant to use it.

            Keyboard users get it too, via `group-focus-visible`: without that
            the affordance exists only for a mouse.
          */}
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10 opacity-0
                       transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            aria-hidden
          >
            <span className="rounded-sm bg-theme-primary px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white shadow-lg">
              View Container
            </span>
          </span>
        </div>

        <p className="text-center text-xs leading-relaxed text-theme-mid dark:text-neutral-300 sm:text-sm">
          Starting at{' '}
          <span className="font-extrabold text-theme-dark dark:text-neutral-100">{wholeDollars(price)}</span>{' '}
          or Purchase for as low as{' '}
          <span className="font-extrabold text-theme-primary">{formatPrice(monthly)}</span>/month
        </p>

        {/* `mt-auto` pins this and the rating to the bottom, so they line up
            across cards whose titles wrapped to different heights. */}
        <span className="mt-auto inline-flex items-center justify-center self-center rounded-sm bg-theme-primary px-5 py-2
                         text-xs font-bold text-white transition-colors group-hover:bg-theme-primary-dark sm:text-sm">
          View Container
        </span>

        <p className="flex items-center justify-center gap-1.5 text-xs">
          <span className="font-bold text-theme-dark dark:text-neutral-100">{rating.toFixed(1)}</span>
          <Stars count={Math.round(rating)} className="h-3.5 w-3.5" />
          <span className="text-theme-muted">({reviews})</span>
        </p>
      </div>
    </Link>
  )
}

/**
 * The card's shape while the lookup is in flight.
 *
 * Built from the same boxes at the same sizes as the real card — the badge
 * bar, the two-line title, the 4:3 image, the price line, the button and the
 * rating — so the band does not change height when the data lands. A skeleton
 * of the wrong size is a layout shift with extra steps.
 */
export function FeaturedContainerCardSkeleton() {
  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-theme-border bg-white
                 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
      aria-hidden
    >
      <p className="bg-theme-border py-2 text-center text-xs dark:bg-neutral-800">&nbsp;</p>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-h-[2.75rem] space-y-1.5">
          <div className="mx-auto h-4 w-11/12 animate-pulse rounded bg-theme-border dark:bg-neutral-800" />
          <div className="mx-auto h-4 w-3/5 animate-pulse rounded bg-theme-border dark:bg-neutral-800" />
        </div>

        <div className="w-full animate-pulse rounded-md bg-theme-border aspect-4/3 dark:bg-neutral-800" />

        <div className="mx-auto h-4 w-4/5 animate-pulse rounded bg-theme-border dark:bg-neutral-800" />

        <div className="mt-auto mx-auto h-8 w-32 animate-pulse rounded-sm bg-theme-border dark:bg-neutral-800" />

        <div className="mx-auto h-3.5 w-24 animate-pulse rounded bg-theme-border dark:bg-neutral-800" />
      </div>
    </div>
  )
}
