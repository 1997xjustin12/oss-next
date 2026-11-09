import { Suspense } from 'react'
import type { Metadata } from 'next'
import { WordPressPage } from '@/components/wp/WordPressPage'
import { LOCATION_PAGE_SLUGS } from '@/lib/data/locationPages'
import { locationPath } from '@/lib/locationPage'
import { resolvePageMetadata } from '@/lib/seo'
import { wordPressPageMetadata } from '@/lib/wpPageMetadata'
import { getLocationPage } from '@/services/locationPage.service'
import { LocationNativePage } from './_components/LocationNativePage'

/**
 * /where-to-buy-shipping-containers/[location]: the depot pages.
 *
 * A location with a native record (lib/data/locationPages.ts) renders the
 * shared template; any other still renders its WordPress page, exactly as the
 * catch-all did. This route takes every one-segment path under the prefix, so
 * it must keep serving those until all of them are native
 * (docs/reference/location-pages.md, "Plan: native location pages").
 */

type Props = {
  params: Promise<{ location: string }>
}

const PREFIX = 'where-to-buy-shipping-containers'

// As the catch-all: a prefetch loads the route's shell, the content follows on click.
export const prefetch = 'partial'

/** The native locations, built at deploy time. */
export function generateStaticParams() {
  return LOCATION_PAGE_SLUGS.map((location) => ({ location }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params
  const page = await getLocationPage(location)
  // The defaults are registered from the record (config/pageSeoDefaults.ts),
  // so the Page Configurator can override them.
  if (page) return resolvePageMetadata(locationPath(page.slug))
  return wordPressPageMetadata([PREFIX, location])
}

async function LocationContent({ params }: Props) {
  const { location } = await params
  const page = await getLocationPage(location)
  if (page) return <LocationNativePage page={page} />
  return <WordPressPage slug={[PREFIX, location]} />
}

/**
 * `params` is request-time data for the locations that are not prebuilt, so
 * the work sits behind a Suspense boundary, as in the catch-all.
 */
export default function LocationRoutePage(props: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-gray-100" />}>
      <LocationContent {...props} />
    </Suspense>
  )
}
