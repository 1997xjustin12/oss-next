import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ADMIN_ROUTES } from '@/config/admin'
import { GBP_ROUTE_SEGMENTS } from '@/config/routes'
import { GBP_PAGES } from '@/lib/data/gbpPages'
import { gbpPageLabel } from '@/lib/gbp'
import { gbpSeoPageModel, toSeoForm } from '@/lib/gbpAdmin'
import { readGbpPageState, readGbpSeoDraft } from '@/services/gbp.service'
import { getPageSeo } from '@/services/seo.service'
import { GbpLocationNav } from '../../_components/GbpLocationNav'
import { GbpSeoEditor } from '../../_components/GbpSeoEditor'
import { editorStatus } from '@/lib/adminStatus'

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = { title: 'GBP page SEO', robots: { index: false, follow: false } }

export function generateStaticParams() {
  return GBP_PAGES.map((page) => ({ slug: page.slug }))
}

export default function GbpSeoPage({ params }: Props) {
  return (
    <Suspense fallback={<p className="text-sm text-theme-muted">Loading…</p>}>
      <Editor params={params} />
    </Suspense>
  )
}

async function Editor({ params }: Props) {
  const { slug } = await params
  const [state, seoDraft, seoPublished] = await Promise.all([readGbpPageState(slug), readGbpSeoDraft(slug), getPageSeo(`/${slug}`)])
  if (!state) notFound()
  const page = state.value
  const label = gbpPageLabel(page)

  return (
    <>
      <GbpLocationNav slug={slug} label={label} current="seo" live={(GBP_ROUTE_SEGMENTS as readonly string[]).includes(slug)} />
      <GbpSeoEditor
        slug={slug}
        label={label}
        initialValue={{
          page: gbpSeoPageModel(page),
          extras: toSeoForm(seoDraft ?? seoPublished),
        }}
        hasDraft={state.hasDraft || !!seoDraft}
        status={editorStatus(state)}
        previewHref={ADMIN_ROUTES.GBP_PREVIEW(slug)}
      />
    </>
  )
}
