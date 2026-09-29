import { resolveContainerVariant } from '@/lib/containerVariant'
import { resolveCondition, resolveGrade } from '@/lib/containerOverview'
import { SIZE_TERMS, gradeAbbr, specFileStem } from '@/lib/containerSpecTerms'
import {
  CONTAINER_VIDEO_DIR,
  CONTAINER_VIDEO_EXTENSIONS,
  CONTAINER_VIDEO_META,
  CONTAINER_VIDEO_POSTER_EXTENSIONS,
  type ContainerVideo,
} from '@/config/containerVideos'
import { CONTAINER_VIDEO_FILES } from './data/containerVideoManifest'
import type { ProductHit } from '@/types/product'

/**
 * The walkaround video for a product, or null when there is not one.
 *
 * Derived from the product's own specs rather than listed anywhere, the same
 * way `getContainerResources` finds its files: the specs give a stem, the stem
 * gives a filename, and a name nothing matches means no video. So a correctly
 * named file goes live the moment it lands, and — the part that matters here —
 * an absent one produces `null` rather than a player pointed at a 404.
 *
 * The match is exact. Filenames are built from the specs, so a name that does
 * not match is a name nothing asked for, and matching loosely would let
 * `new_20s_iicl_v2.mp4` quietly become the live video.
 *
 * Note this is finer-grained than `config/productVideos.ts`, which keys the
 * YouTube embeds below the gallery by size alone (`20`, `40`, `40HC`). The two
 * are separate on purpose: those are marketing films about a size, these are a
 * walkaround of one condition and grade, and a 20ft AS-IS should not be
 * illustrated with footage of a new one.
 */

function findFile(stem: string, extensions: readonly string[]): string | null {
  for (const ext of extensions) {
    const name = `${stem}.${ext}`
    if (CONTAINER_VIDEO_FILES.includes(name)) return name
  }
  return null
}

export function getContainerVideo(product: ProductHit): ContainerVideo | null {
  const size = resolveContainerVariant(product)
  const condition = resolveCondition(product)
  const grade = resolveGrade(product)

  const slug = specFileStem(size, condition, grade)
  const file = findFile(slug, CONTAINER_VIDEO_EXTENSIONS)
  if (!file) return null

  const meta = CONTAINER_VIDEO_META[slug] ?? {}
  // A still of the same name, when one is there. The caller falls back to the
  // product's own first photograph when it is not, so there is always
  // something on screen before playback.
  const posterFile = findFile(slug, CONTAINER_VIDEO_POSTER_EXTENSIONS)

  return {
    slug,
    src: `${CONTAINER_VIDEO_DIR}/${file}`,
    poster: meta.poster ?? (posterFile ? `${CONTAINER_VIDEO_DIR}/${posterFile}` : null),
    title:
      meta.title ??
      `Video walkaround of a ${condition.toLowerCase()} ${SIZE_TERMS[size].abbr} ${gradeAbbr(grade)} shipping container`,
    ...(meta.duration ? { duration: meta.duration } : {}),
  }
}
