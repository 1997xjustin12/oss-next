import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasAdminAccess } from '@/lib/adminGuard'
import { LOCATION_PAGE_SLUGS } from '@/lib/data/locationPageSlugs'
import { readLocationPageState, readLocationTemplateState } from '@/services/locationPage.service'
import { LocationNativePage } from '../../../where-to-buy-shipping-containers/[location]/_components/LocationNativePage'

// The location-page screens' draft preview: the real page (this route sits in
// the (market) group for its layout) rendered from the drafts, falling back to
// published. Admin-only: the proxy 404s /admin-preview for everyone else
// (ADMIN_PATHS), and this page checks again. Dynamic, never cached, never indexed.

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = { title: 'Draft preview', robots: { index: false, follow: false } }

export function generateStaticParams() {
  return LOCATION_PAGE_SLUGS.map((slug) => ({ slug }))
}

export default function LocationPreviewPage({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <Preview params={params} />
    </Suspense>
  )
}

async function Preview({ params }: Props) {
  if (!(await hasAdminAccess())) notFound()
  const { slug } = await params
  const [page, template] = await Promise.all([readLocationPageState(slug), readLocationTemplateState()])
  if (!page) notFound()
  return (
    <>
      <p className="sticky top-0 z-50 bg-amber-400 px-4 py-1.5 text-center text-xs font-bold text-black">
        Draft preview{page.hasDraft || template.hasDraft ? ' (includes unpublished drafts)' : ' (no drafts: this is what is published)'}
      </p>
      <LocationNativePage page={page.value} template={template.value} />
    </>
  )
}
