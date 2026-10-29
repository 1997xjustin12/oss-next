import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { discardGbpLocationAction, publishGbpLocationAction, saveGbpContentDraftAction } from '@/actions/gbp'
import { ADMIN_ROUTES } from '@/config/admin'
import { GBP_ROUTE_SEGMENTS } from '@/config/routes'
import { GBP_PAGES } from '@/lib/data/gbpPages'
import { GBP_CONTENT_KEYS, pickKeys } from '@/lib/gbpAdmin'
import { readGbpPageState } from '@/services/gbp.service'
import { GbpContentEditor } from '../_components/GbpContentEditor'
import { GbpLocationNav } from '../_components/GbpLocationNav'
import { editorStatus } from '../_components/gbpAdminStatus'

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = { title: 'GBP page content', robots: { index: false, follow: false } }

export function generateStaticParams() {
  return GBP_PAGES.map((page) => ({ slug: page.slug }))
}

export default function GbpContentPage({ params }: Props) {
  return (
    <Suspense fallback={<p className="text-sm text-theme-muted">Loading…</p>}>
      <Editor params={params} />
    </Suspense>
  )
}

async function Editor({ params }: Props) {
  const { slug } = await params
  const state = await readGbpPageState(slug)
  if (!state) notFound()
  const { location } = state.value
  const label = `${location.city}, ${location.stateCode}`

  return (
    <>
      <GbpLocationNav slug={slug} label={label} current="content" live={(GBP_ROUTE_SEGMENTS as readonly string[]).includes(slug)} />
      <GbpContentEditor
        label={label}
        initialValue={pickKeys(state.value, GBP_CONTENT_KEYS)}
        hasDraft={state.hasDraft}
        status={editorStatus(state)}
        previewHref={ADMIN_ROUTES.GBP_PREVIEW(slug)}
        save={saveGbpContentDraftAction.bind(null, slug)}
        publish={publishGbpLocationAction.bind(null, slug)}
        discard={discardGbpLocationAction.bind(null, slug)}
      />
    </>
  )
}
