import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasAdminAccess } from '@/lib/adminGuard'
import { GBP_PAGES } from '@/lib/data/gbpPages'
import { readGbpPageState, readGbpSharedState, readGbpTemplateState } from '@/services/gbp.service'
import { getReviews } from '@/services/review.service'
import { GbpTemplate } from '../../../_components/GbpTemplate'

// The GBP screens' draft preview: the real page (this route sits in the (gbp)
// group for its layout) rendered from the drafts, falling back to published.
// Admin-only: the proxy 404s /admin-preview for everyone else (ADMIN_PATHS),
// and this page checks again. Dynamic, never cached, never indexed.

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = { title: 'Draft preview', robots: { index: false, follow: false } }

export function generateStaticParams() {
  return GBP_PAGES.map((page) => ({ slug: page.slug }))
}

export default function GbpPreviewPage({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <Preview params={params} />
    </Suspense>
  )
}

async function Preview({ params }: Props) {
  if (!(await hasAdminAccess())) notFound()
  const { slug } = await params
  const [page, shared, template, reviews] = await Promise.all([readGbpPageState(slug), readGbpSharedState(), readGbpTemplateState(), getReviews()])
  if (!page) notFound()
  return (
    <>
      <p className="sticky top-0 z-50 bg-amber-400 px-4 py-1.5 text-center text-xs font-bold text-black">
        Draft preview{page.hasDraft || shared.hasDraft || template.hasDraft ? ' (includes unpublished drafts)' : ' (no drafts: this is what is published)'}
      </p>
      <GbpTemplate page={page.value} shared={shared.value} template={template.value} reviews={reviews} />
    </>
  )
}
