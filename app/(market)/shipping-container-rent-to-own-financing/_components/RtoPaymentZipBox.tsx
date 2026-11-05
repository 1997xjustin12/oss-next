'use client'

import { useRouter } from 'next/navigation'
import { ROUTES } from '@/config/routes'
import { RTO_CONFIGURATOR } from '@/lib/data/rentToOwnContent'
import { ConfiguratorZipBox } from './ConfiguratorZipBox'
import type { GeoapifyResult } from '@/hooks/useGeoapify'

type Props = { label: string }

/**
 * The ZIP boxes further down the page ("See My Monthly Payment", "Get Instantly
 * Approved"). By then the configurator is out of view, so as on WordPress these
 * go on to the rent-to-own listing for the visitor's depot.
 */
export function RtoPaymentZipBox({ label }: Props) {
  const router = useRouter()

  function showListing(result: GeoapifyResult) {
    const params = new URLSearchParams({
      location: result.nearestLocation ?? '',
      zipcode: result.postcode,
      ptype: RTO_CONFIGURATOR.paymentType,
    })
    router.push(`${ROUTES.PLP}?${params}`)
  }

  return <ConfiguratorZipBox submitLabel={label} onLocated={showListing} />
}
