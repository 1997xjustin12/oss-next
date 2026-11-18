import { resolveContainerVariant } from '@/lib/containerVariant'
import { resolveCondition, resolveGrade } from '@/lib/containerOverview'
import { specFileStem } from '@/lib/containerSpecTerms'
import {
  CONTAINER_IMAGE_DIR,
  CONTAINER_IMAGE_EXTENSIONS,
  CONTAINER_IMAGE_PATTERN,
} from '@/config/containerImages'
import { CONTAINER_IMAGE_FILES } from './data/containerImageManifest'
import type { ProductHit } from '@/types/product'

/**
 * Curated photographs for a product, in order, or an empty array.
 *
 * Derived from the product's own specs the same way the resource row and the
 * walkaround video are: the specs give a stem, the stem gives a set of
 * filenames, and a stem nothing matches means the caller keeps the images that
 * came with the product.
 *
 * Empty is the ordinary answer — most specs have no curated set — so callers
 * should treat it as "use what you had", not as a failure.
 */
export function getContainerImages(product: ProductHit): string[] {
  const size = resolveContainerVariant(product)
  const condition = resolveCondition(product)
  const grade = resolveGrade(product)

  return getContainerImagesForStem(specFileStem(size, condition, grade))
}

/**
 * The curated photographs of one spec stem (`used_20s_wwt`), in order, or an
 * empty array. For callers that name the spec themselves rather than holding a
 * product: the homepage's container list (version 3).
 */
export function getContainerImagesForStem(stem: string): string[] {
  const allowed = new Set<string>(CONTAINER_IMAGE_EXTENSIONS)

  return CONTAINER_IMAGE_FILES.map((file) => {
    const match = CONTAINER_IMAGE_PATTERN.exec(file)
    if (!match) return null

    const [, fileStem, order, ext] = match
    if (fileStem !== stem || !allowed.has(ext.toLowerCase())) return null

    return { file, order: Number(order) }
  })
    .filter((entry): entry is { file: string; order: number } => entry !== null)
    // Numerically, not as text: a lexicographic sort puts `_10` between `_1`
    // and `_2`, which silently reorders any gallery that reaches ten images.
    .sort((a, b) => a.order - b.order)
    .map((entry) => `${CONTAINER_IMAGE_DIR}/${entry.file}`)
}
