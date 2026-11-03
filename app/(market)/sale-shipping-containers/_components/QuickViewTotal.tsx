'use client'

import { useDeliveryRates } from '@/hooks/useDeliveryRates'
import { useStoredZip } from '@/hooks/useStoredZip'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { cheapestDeliveryOption } from '@/lib/delivery'
import { formatMoney } from '@/lib/formatters'
import { CONTACT_NUMBER } from '@/lib/helpers'
import { ZipLookup } from './ZipLookup'

type Props = {
  handle: string
  price: number
  paymentType: string
  location: string
}

const CONTACT_TEL = `tel:${CONTACT_NUMBER.replace(/[^\d+]/g, '')}`

function Row({ label, children, strong = false }: { label: string; children: React.ReactNode; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2 ${strong ? 'text-base font-extrabold' : 'text-sm'}`}>
      <dt className={strong ? 'text-theme-dark dark:text-white' : 'text-theme-muted dark:text-gray-300'}>{label}</dt>
      <dd className="text-right font-semibold tabular-nums text-theme-dark dark:text-white">{children}</dd>
    </div>
  )
}

/**
 * What "See Total Price" on a listing tile opens to: this container's delivery
 * to the visitor's ZIP and what it comes to, by the product page's rules, so the
 * two agree.
 *
 *   Buy          price + cheapest delivery + sales tax = estimated total.
 *   Rent         the monthly price already includes delivery and pickup.
 *   Rent-to-own  delivery is one-time and the price monthly, so they are shown
 *                apart rather than added.
 *
 * A reference listing has no depot to deliver from, so it asks for the ZIP that
 * finds one, as does a visitor with no ZIP. Rates are looked up here, on opening,
 * rather than on the tile: each lookup can cost a paid Google call.
 */
export function QuickViewTotal({ handle, price, paymentType, location }: Props) {
  const { postcode, resolved } = useStoredZip()
  const hasDepot = !!location && location !== DEFAULT_LOCATION
  const isRental = paymentType === 'rental'
  const isRto = paymentType === 'rto'

  const { rates, loading, error } = useDeliveryRates({
    slug: handle,
    zipcode: postcode,
    enabled: hasDepot && !isRental,
  })

  if (!resolved) return <div className="h-24 animate-pulse rounded-lg bg-theme-subtle dark:bg-white/5" />

  if (!hasDepot || !postcode) {
    return (
      <div className="rounded-lg border border-theme-border p-3 dark:border-neutral-700">
        <p className="mb-2 text-sm font-semibold text-theme-dark dark:text-white">
          Enter your ZIP to see delivery and your total
        </p>
        <ZipLookup initialZip={postcode} location={hasDepot ? location : undefined} ptype={paymentType || 'buy'} />
      </div>
    )
  }

  const option = rates ? cheapestDeliveryOption(rates) : null
  const delivery = option?.rate ?? 0
  const isBuy = !isRental && !isRto
  const tax = isBuy && rates?.tax_rate ? Math.round(price * rates.tax_rate * 100) / 100 : null
  const total = Math.round((price + delivery + (tax ?? 0)) * 100) / 100
  const deliveryLabel = `Delivery to ${postcode}`

  return (
    <dl className="divide-y divide-theme-border rounded-lg border border-theme-border px-3 dark:divide-neutral-700 dark:border-neutral-700">
      {isRental ? (
        <Row label={deliveryLabel}>Delivery &amp; pickup included</Row>
      ) : (
        <Row label={deliveryLabel}>
          {loading ? (
            <span className="inline-block h-4 w-20 animate-pulse rounded bg-theme-subtle align-middle dark:bg-white/10">
              <span className="sr-only">Calculating delivery…</span>
            </span>
          ) : option ? (
            <>
              {formatMoney(delivery)}
              {isRto && <span className="ml-1 text-[11px] font-normal text-theme-muted">one-time</span>}
            </>
          ) : (
            <a href={CONTACT_TEL} className="text-theme-primary underline underline-offset-2 hover:decoration-2">
              Call for rate
            </a>
          )}
        </Row>
      )}

      {!isRental && (
        <Row label="Sales tax">{loading ? 'Calculating…' : tax !== null ? formatMoney(tax) : 'Calculated at checkout'}</Row>
      )}

      {/* No total without a delivery price: it would read as the whole cost. */}
      {!isBuy ? (
        <Row label="Monthly payment" strong>{formatMoney(price)}/mo</Row>
      ) : !loading && option ? (
        <Row label="Estimated total" strong>{formatMoney(total)}</Row>
      ) : null}

      {error && !loading && <p className="py-2 text-xs leading-relaxed text-theme-muted">{error.message}</p>}
    </dl>
  )
}
