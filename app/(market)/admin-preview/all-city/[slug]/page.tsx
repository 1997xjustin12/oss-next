import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AllCityPage } from '@/components/allCity/AllCityPage'
import { hasAdminAccess } from '@/lib/adminGuard'
import { readAllCityDepotState, readAllCityPageState, readAllCityTemplateState } from '@/services/allCity.service'

// The All City Pages screens' draft preview: the real page (this route sits in
// the (market) group for its layout) rendered from the drafts of the page, the
// template and its depot, falling back to published. Admin-only: the proxy
// 404s /admin-preview for everyone else (ADMIN_PATHS), and this page checks
// again. Dynamic, never cached, never indexed. The city lists show what is
// published (a draft changes them only once published).

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = { title: 'Draft preview', robots: { index: false, follow: false } }

export function generateStaticParams() {
  return [{ slug: 'storage-units-cocoa-beach-fl' }]
}

export default function AllCityPreviewPage({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <Preview params={params} />
    </Suspense>
  )
}

async function Preview({ params }: Props) {
  if (!(await hasAdminAccess())) notFound()
  const { slug } = await params
  const [page, template] = await Promise.all([readAllCityPageState(slug), readAllCityTemplateState()])
  if (!page) notFound()
  const depot = await readAllCityDepotState(page.value.depotKey)
  if (!depot) notFound()
  const drafts = page.hasDraft || template.hasDraft || depot.hasDraft
  const notes = [page.value.hidden && 'hidden: visitors get a 404', page.value.redirectTo && `redirects to /all-city/${page.value.redirectTo}`].filter(Boolean)

  return (
    <>
      <p className="sticky top-0 z-50 bg-amber-400 px-4 py-1.5 text-center text-xs font-bold text-black">
        Draft preview{drafts ? ' (includes unpublished drafts)' : ' (no drafts: this is what is published)'}
        {notes.length > 0 && ` · This page is ${notes.join(' and ')}`}
      </p>
      <AllCityPage page={page.value} template={template.value} depot={depot.value} />
    </>
  )
}
