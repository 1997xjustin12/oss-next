import { GBP_PAGES } from '@/lib/data/gbpPages'
import { gbpPageLabel } from '@/lib/gbp'

/** Every location, for the preview's picker (labels from the seed; slugs never change). */
export function gbpPreviewLocations(): { slug: string; label: string }[] {
  return GBP_PAGES.map((page) => ({ slug: page.slug, label: gbpPageLabel(page) }))
}
