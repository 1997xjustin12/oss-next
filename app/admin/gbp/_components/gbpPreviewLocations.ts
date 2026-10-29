import { GBP_PAGES } from '@/lib/data/gbpPages'

/** Every location, for the preview's picker (labels from the seed; slugs never change). */
export function gbpPreviewLocations(): { slug: string; label: string }[] {
  return GBP_PAGES.map((page) => ({ slug: page.slug, label: `${page.location.city}, ${page.location.stateCode}` }))
}
