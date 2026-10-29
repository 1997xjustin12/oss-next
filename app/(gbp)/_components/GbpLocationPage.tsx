import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/shared/JsonLd'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { gbpJsonLd, gbpPath } from '@/lib/gbp'
import { gbpMetadata } from '@/lib/gbpMetadata'
import { getGbpPage, getGbpShared, getGbpTemplate } from '@/services/gbp.service'
import { getReviews } from '@/services/review.service'
import { GbpTemplate } from './GbpTemplate'
import type { Metadata } from 'next'

/**
 * A GBP location page, published: its record, the shared content and the
 * template, all cached reads, so the page stays static. Each route file is
 * just `<GbpLocationPage slug=… />`.
 */
export async function GbpLocationPage({ slug }: { slug: string }) {
  const [page, shared, template, reviews] = await Promise.all([getGbpPage(slug), getGbpShared(), getGbpTemplate(), getReviews()])
  if (!page) notFound()
  return (
    <>
      <JsonLd data={gbpJsonLd(page)} />
      <PageHeadScripts path={gbpPath(page)} />
      <GbpTemplate page={page} shared={shared} template={template} reviews={reviews} />
    </>
  )
}

export async function gbpLocationMetadata(slug: string): Promise<Metadata> {
  const page = await getGbpPage(slug)
  if (!page) return {}
  return gbpMetadata(page)
}
