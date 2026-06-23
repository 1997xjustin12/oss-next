import Image from 'next/image'
import Link from 'next/link'
import { Phone, Star } from 'lucide-react'
import type { Product } from '@/types/product'

type Props = { product: Product }

const BADGE_CLASSES = {
  red:   'bg-theme-primary',
  amber: 'bg-amber-600',
  green: 'bg-green-600',
} satisfies Record<Product['badge']['tone'], string>

function StarRow({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          className={
            n <= full
              ? 'fill-theme-primary text-theme-primary'
              : 'fill-gray-200 text-gray-200'
          }
        />
      ))}
    </div>
  )
}

export function ProductCard({ product }: Props) {
  const href = product.productPermalink ?? `/products/${product.sku.toLowerCase()}`

  return (
    <article className="relative grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-5 rounded-lg border border-theme-border bg-white p-4 sm:p-5 transition-all hover:border-theme-primary/40 hover:shadow-lg">
      {/* Thumbnail */}
      <div className="relative sm:col-span-3 aspect-4/3 rounded-md bg-theme-subtle overflow-hidden">
        <span
          className={`absolute top-0 left-0 z-10 rounded-br-md px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white ${BADGE_CLASSES[product.badge.tone]}`}
        >
          {product.badge.label}
        </span>
        {product.thumbnailUrl ? (
          <Image
            src={product.thumbnailUrl}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
        )}
      </div>

      {/* Info */}
      <div className="sm:col-span-6 flex min-w-0 flex-col gap-2">
        <h3 className="text-lg font-extrabold leading-tight text-theme-dark">
          {product.title}
        </h3>

        <div className="flex items-center gap-2 text-xs">
          <StarRow rating={product.rating} />
          <span className="text-theme-dark-2">{product.rating}</span>
          <span className="text-theme-muted">({product.reviews} reviews)</span>
        </div>

        {product.location && product.location !== 'Various North America' && (
          <div className="text-xs font-bold text-theme-primary">{product.location}</div>
        )}

        {product.monthly && (
          <div className="rounded-md border border-theme-border bg-theme-subtle px-3 py-2 text-xs leading-relaxed text-theme-muted">
            <span className="font-bold text-theme-dark">Budget-Friendly Option: </span>
            Don&rsquo;t want to pay ${product.price.toLocaleString()} upfront? Select our{' '}
            <Link
              href="/rent-to-own"
              className="font-bold text-theme-accent underline underline-offset-2 hover:text-theme-primary"
            >
              Rent-To-Own option at ${product.monthly.toFixed(2)}/mo
            </Link>
            . No credit check required!
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs font-semibold text-theme-accent">
          <Phone size={12} />
          Found It Cheaper? Call{' '}
          <a href="tel:8889779085" className="hover:underline">(888) 977-9085</a>
        </div>

        <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          {product.condition && (
            <>
              <dt className="font-bold uppercase tracking-wide text-theme-muted text-[10px]">Condition</dt>
              <dd className="text-theme-dark-2">{product.condition}</dd>
            </>
          )}
          {product.doorType && (
            <>
              <dt className="font-bold uppercase tracking-wide text-theme-muted text-[10px]">Door Type</dt>
              <dd className="text-theme-dark-2">{product.doorType}</dd>
            </>
          )}
          {product.grade && (
            <>
              <dt className="font-bold uppercase tracking-wide text-theme-muted text-[10px]">Grade</dt>
              <dd className="text-theme-dark-2">{product.grade}</dd>
            </>
          )}
          {product.size && (
            <>
              <dt className="font-bold uppercase tracking-wide text-theme-muted text-[10px]">Size</dt>
              <dd className="text-theme-dark-2">{product.size} — {product.height}</dd>
            </>
          )}
        </dl>

        {product.sku && (
          <div className="text-[10px] text-theme-muted">SKU: {product.sku}</div>
        )}
      </div>

      {/* Action */}
      <div className="sm:col-span-3 flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3">
        <div className="text-left sm:text-right">
          <div className="text-3xl font-black leading-none text-theme-dark">
            ${product.price.toLocaleString()}
          </div>
          <div className="text-[11px] text-theme-muted">+ delivery, no tax</div>
        </div>
        <div className="flex w-full max-w-45 flex-col gap-2">
          <Link
            href={href}
            className="w-full rounded-md bg-theme-primary px-4 py-2.5 text-sm font-extrabold text-white text-center transition-colors hover:bg-theme-primary-dark"
          >
            Quick View
          </Link>
          <a
            href="tel:8889779085"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-theme-dark px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
          >
            <Phone size={13} />
            (888) 977-9085
          </a>
        </div>
      </div>
    </article>
  )
}
