'use client'

import { useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { ProductImageGallery } from '@/components/product/ProductImageGallery'
import { Stars } from '@/components/product/Stars'
import { useAddContainerToCart } from '@/hooks/useAddContainerToCart'
import { useConfiguratorProducts, type ConfiguratorData } from '@/hooks/useConfiguratorProducts'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { formatMoney } from '@/lib/formatters'
import { CONTACT_NUMBER, telHref } from '@/lib/helpers'
import {
  productsByLastGroup,
  resolveSelection,
  startingPrice,
  type ConfiguratorGroup,
  type ConfiguratorPaymentType,
  type ConfiguratorSelection,
} from '@/lib/configurator'
import { ConfiguratorOptionGroup } from './ConfiguratorOptionGroup'
import { ConfiguratorZipBox } from './ConfiguratorZipBox'

export type ConfiguratorSetup = {
  paymentType: ConfiguratorPaymentType
  /** Spec groups, then the term group last. */
  groups: readonly ConfiguratorGroup[]
  defaults: Readonly<ConfiguratorSelection>
  leadTerm: string
  fallbackRating: number
  maxQuantity: number
}

type Props = {
  setup: ConfiguratorSetup
  /** The generic listing's products, rendered on the server. Null if that failed. */
  initial: ConfiguratorData | null
}

const ORDER_LABEL: Record<ConfiguratorPaymentType, string> = { rto: 'Rent-to-Own', rental: 'Rental', buy: 'Purchase' }

function StepBadge({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-3 text-[15px] font-semibold text-theme-dark sm:text-lg dark:text-white">
      <span className="rounded-md bg-neutral-600 px-3 py-1.5 text-sm font-bold text-white sm:text-base dark:bg-neutral-500">
        Step {step}
      </span>
      {children}
    </h3>
  )
}

/**
 * The container configurator: the visitor's depot, a spec and a term → one
 * product, priced, and into the cart. Carried over from the WordPress plugin's
 * block on the rent-to-own page; built from props so rentals or purchases can
 * use it later.
 *
 * Spec: docs/reference/shipping-container-configurator-to-cart-component.md
 */
export function ContainerConfigurator({ setup, initial }: Props) {
  const { groups, defaults, leadTerm, fallbackRating, maxQuantity, paymentType } = setup
  const specGroups = groups.slice(0, -1)
  const termGroup = groups[groups.length - 1]

  const { location, products, loading, failed, retry } = useConfiguratorProducts(paymentType, initial)
  const { addContainerToCart } = useAddContainerToCart()

  const [wanted, setWanted] = useState<ConfiguratorSelection>(defaults)
  const [quantity, setQuantity] = useState(1)
  const [titleOpen, setTitleOpen] = useState(false)
  const zipRef = useRef<HTMLInputElement>(null)

  const { selection, available } = useMemo(() => resolveSelection(products, groups, wanted), [products, groups, wanted])
  const byTerm = useMemo(
    () => (selection ? productsByLastGroup(products, groups, selection) : new Map()),
    [products, groups, selection],
  )
  const selected = selection ? (byTerm.get(selection[termGroup.key]) ?? null) : null
  const leadPrice = startingPrice(byTerm, leadTerm)

  const ready = !loading && !failed && selected !== null
  // The generic listings have no depot behind them; the cart refuses them.
  const needsZip = !location || location === DEFAULT_LOCATION || selected?.location === DEFAULT_LOCATION
  const rating = selected && selected.rating.value > 0 ? selected.rating.value : fallbackRating
  const total = selected ? selected.price * quantity : null

  function pick(key: string, value: string) {
    // From the resolved selection, so a choice the cascade moved stays moved.
    setWanted({ ...(selection ?? wanted), [key]: value })
  }

  function setQty(next: number) {
    setQuantity(Math.min(maxQuantity, Math.max(1, Math.floor(next) || 1)))
  }

  function addToCart() {
    if (!selected || !selection || needsZip) return
    const size = specGroups.find((g) => g.key === 'size')?.options.find((o) => o.value === selection.size)?.label
    addContainerToCart({
      id: selected.id,
      name: selected.title,
      price: selected.price,
      quantity,
      sku: selected.sku || undefined,
      size: size ?? selected.sizeLabel,
      condition: selected.conditionLabel,
      orderType: `${ORDER_LABEL[paymentType]} · ${selection[termGroup.key]} Months`,
      image: selected.images[0],
      isContainer: true,
      location: selected.location,
    })
  }

  const stem = selection ? `${selection.condition}_${selection.size}_${selection.grade}` : 'none'
  // Nothing stocked at this depot (rather than still loading, or failed).
  const empty = !loading && !failed && selection === null

  return (
    <div aria-busy={loading} className="grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-2">
      {/* Title and rating: full width above both columns on desktop; under
          the gallery on phones, clamped to two lines. */}
      <div className="order-2 lg:order-1 lg:col-span-2">
        <div className="flex items-start gap-2">
          <h2
            id="rto-configurator-title"
            className={`min-w-0 flex-1 text-lg font-bold leading-snug text-theme-dark sm:text-2xl lg:text-3xl dark:text-white ${titleOpen ? '' : 'line-clamp-2 lg:line-clamp-none'}`}
          >
            {selected?.title ?? 'Rent-to-Own Shipping Container'}
          </h2>
          <button
            type="button"
            onClick={() => setTitleOpen((open) => !open)}
            aria-expanded={titleOpen}
            aria-controls="rto-configurator-title"
            aria-label={titleOpen ? 'Show less of the title' : 'Show the full title'}
            className="mt-0.5 shrink-0 rounded p-1 text-theme-dark lg:hidden dark:text-white"
          >
            <ChevronDown aria-hidden className={`h-5 w-5 transition-transform ${titleOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {/* A div: Stars renders one, which a <p> can't contain. */}
        <div className="mt-1 flex items-center gap-1.5">
          <span className="font-bold text-theme-primary dark:text-red-400">{rating.toFixed(1)}</span>
          <Stars count={Math.round(rating)} className="h-5 w-5" />
          <span className="sr-only">out of 5 stars</span>
        </div>
      </div>

      {/* Gallery. Keyed on the spec so it starts from the first slide when the
          container changes, and not on a term change (same photographs). */}
      <div className={`order-1 min-w-0 lg:order-2 ${loading ? 'opacity-60' : ''}`}>
        {selected ? (
          <ProductImageGallery
            key={stem}
            images={selected.images}
            video={selected.video}
            title={selected.title}
            lcp={false}
          />
        ) : (
          <div className="aspect-4/3 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        )}
      </div>

      {/* The steps */}
      <div className="order-3 min-w-0 rounded-2xl border border-neutral-300 bg-white p-4 sm:p-5 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="space-y-5">
          <section aria-labelledby="rto-step-1" className="space-y-3">
            <div id="rto-step-1">
              <StepBadge step={1}>
                <span>
                  Pricing Starts at{' '}
                  <span className={loading ? 'opacity-60' : ''}>
                    {leadPrice !== null ? `${formatMoney(leadPrice)}/month` : '—'}
                  </span>
                </span>
              </StepBadge>
            </div>
            <ConfiguratorZipBox inputRef={zipRef} disabled={loading && products.length === 0} busy={loading} />
            {failed && (
              <p role="alert" className="text-sm text-theme-dark dark:text-neutral-200">
                We couldn&apos;t load prices for this location.{' '}
                <button type="button" onClick={retry} className="font-semibold text-theme-primary underline underline-offset-2">
                  Try again
                </button>{' '}
                or call{' '}
                <a href={telHref(CONTACT_NUMBER)} className="font-semibold text-theme-primary underline underline-offset-2">
                  {CONTACT_NUMBER}
                </a>
                .
              </p>
            )}
            {empty && (
              <p role="status" className="text-sm text-theme-dark dark:text-neutral-200">
                {ORDER_LABEL[paymentType]} isn&apos;t available at this location yet. Call{' '}
                <a href={telHref(CONTACT_NUMBER)} className="font-semibold text-theme-primary underline underline-offset-2">
                  {CONTACT_NUMBER}
                </a>
                .
              </p>
            )}
          </section>

          <section aria-labelledby="rto-step-2" className="space-y-3">
            <div id="rto-step-2">
              <StepBadge step={2}>Select Container Specifications</StepBadge>
            </div>
            {specGroups.map((group) => (
              <ConfiguratorOptionGroup
                key={group.key}
                name={`rto-${group.key}`}
                legend={group.label}
                options={group.options}
                value={selection?.[group.key] ?? null}
                available={available[group.key] ?? new Set()}
                onChange={(value) => pick(group.key, value)}
                disabled={loading}
                className={group.options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}
              />
            ))}
          </section>

          <section aria-labelledby="rto-step-3" className="space-y-3">
            <div id="rto-step-3">
              <StepBadge step={3}>Select Payment Terms</StepBadge>
            </div>
            <ConfiguratorOptionGroup
              name={`rto-${termGroup.key}`}
              legend={termGroup.label}
              legendHidden
              options={termGroup.options.map((option) => {
                const product = byTerm.get(option.value)
                return { ...option, detail: product ? formatMoney(product.price) : '—' }
              })}
              value={selection?.[termGroup.key] ?? null}
              available={available[termGroup.key] ?? new Set()}
              onChange={(value) => pick(termGroup.key, value)}
              disabled={loading}
              className="grid-cols-4"
            />
          </section>

          <p className="text-center">
            <a
              href={telHref(CONTACT_NUMBER)}
              className="text-[15px] font-medium text-theme-primary hover:underline dark:text-red-400"
            >
              Found It Cheaper?&nbsp; {CONTACT_NUMBER}
            </a>
          </p>

          <div className="rounded-md bg-neutral-50 px-4 py-3 dark:bg-neutral-800/60">
            <div className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-3 text-sm dark:border-neutral-700">
              <span className="text-theme-muted dark:text-neutral-400">Sales Tax</span>
              <span className="italic text-theme-muted dark:text-neutral-400">Calculated at Checkout</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-3">
              <span className="text-base font-semibold text-theme-dark dark:text-white">Total</span>
              {needsZip && ready && (
                <button
                  type="button"
                  onClick={() => zipRef.current?.focus()}
                  className="order-3 w-full text-center text-sm font-semibold text-theme-primary underline underline-offset-2 sm:order-0 sm:w-auto dark:text-red-400"
                >
                  Please enter zip/postal code first
                </button>
              )}
              <span aria-live="polite" className="text-lg font-bold text-theme-dark dark:text-white">
                {total !== null ? formatMoney(total) : '—'}
                {total !== null && <span className="sr-only"> per month</span>}
              </span>
            </div>
            <div className="mt-3 flex gap-3">
              <label htmlFor="rto-quantity" className="sr-only">
                Quantity
              </label>
              <input
                id="rto-quantity"
                type="number"
                inputMode="numeric"
                min={1}
                max={maxQuantity}
                step={1}
                value={quantity}
                disabled={!ready}
                onChange={(e) => setQty(Number(e.target.value))}
                className="h-12 w-24 shrink-0 rounded-sm border border-neutral-300 bg-white px-3 text-base text-theme-dark disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white"
              />
              <button
                type="button"
                onClick={addToCart}
                disabled={!ready || needsZip}
                className="h-12 flex-1 rounded-sm bg-theme-primary text-base font-bold text-white transition-colors hover:bg-theme-primary-dark
                           focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary
                           disabled:cursor-not-allowed disabled:bg-theme-primary/30 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-400"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
