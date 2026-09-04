import { resolveContainerVariant } from '@/lib/containerVariant'
import { resolveCondition, resolveGrade } from '@/lib/containerOverview'
import {
  CONDITION_TERMS,
  GRADE_TERMS,
  SIZE_TERMS,
  gradeAbbr,
  sizeSlug,
  specFileStem,
  type ContainerCondition,
  type ContainerGrade,
  type ContainerVariantKey,
} from '@/lib/containerSpecTerms'
import { PDP_RESOURCE_FILES } from './pdpResourceManifest'
import type { ContainerResource } from './pdpShippingContainers'
import type { ProductHit } from '@/types/product'

/**
 * The three resource links, derived from the active product rather than listed.
 *
 * Every file under `public/resources/pdp/` is named after the specs it
 * describes, so the specs are enough to find it: no lookup table to keep in
 * step with the folder, and a correctly-named file becomes live the moment it
 * lands. Which is also the catch — a misspelt filename does not error, it
 * silently fails to match and the button disappears. `npm run
 * resources:manifest` prints the count, and `listUnmatchedResourceFiles()`
 * below names the files nothing is asking for.
 *
 * The three follow different axes because the content does:
 *
 *   1. Dimensions — size only. A 20ft is 20ft whatever grade it is.
 *   2. What to expect — condition + size + grade. What wear looks like depends
 *      on all three.
 *   3. Complete guide — condition + size + grade.
 *
 * Only the five stocked combinations can ever be asked for (`New` is IICL-only)
 * so the matrix is 15 files, not 24.
 */

const DIR = '/resources/pdp'

/**
 * The file named exactly `stem` with one of the given extensions.
 *
 * Exact only — no tolerance for a trailing tag. Filenames are derived from the
 * specs, so a name that does not match is a name nothing asked for, and
 * matching it loosely would let `used_20s_cw_old.webp` quietly become the live
 * image. `npm run resources:check` lists any file nothing reaches, which is
 * where a misspelling shows up instead.
 */
function findFile(stem: string, extensions: string[]): string | null {
  for (const ext of extensions) {
    const name = `${stem}.${ext}`
    if (PDP_RESOURCE_FILES.includes(name)) return name
  }
  return null
}

function resource(
  stem: string,
  extensions: string[],
  label: string,
  type: 'pdf' | 'img',
): ContainerResource | null {
  const file = findFile(stem, extensions)
  return file ? { label, url: `${DIR}/${file}`, type } : null
}

export function getContainerResources(product: ProductHit): ContainerResource[] {
  const size = resolveContainerVariant(product)
  const condition = resolveCondition(product)
  const grade = resolveGrade(product)

  const specStem = specFileStem(size, condition, grade)

  return [
    resource(
      `${sizeSlug(size)}_dimension`,
      ['pdf'],
      `${SIZE_TERMS[size].label} Container Dimensions`,
      'pdf',
    ),
    resource(
      specStem,
      ['webp', 'png', 'jpg', 'jpeg'],
      `What to Expect to ${condition} ${grade} Containers`,
      'img',
    ),
    resource(
      specStem,
      ['pdf'],
      `Complete Guide for ${condition} ${SIZE_TERMS[size].abbr} ${gradeAbbr(grade)} Containers`,
      'pdf',
    ),
    // A missing file means a hidden button, never a link to a 404. Most of the
    // 15 combinations have no file yet, so this is the common case, not the
    // edge one.
  ].filter((r): r is ContainerResource => r !== null)
}

/**
 * Files in the folder that no product can reach.
 *
 * A typo in a filename is invisible from the page — the button just is not
 * there — so this exists to make the folder auditable. Used by
 * `npm run resources:check`.
 */
export function listUnmatchedResourceFiles(): string[] {
  const reachable = new Set<string>()
  const sizes = Object.keys(SIZE_TERMS) as ContainerVariantKey[]
  const conditions = Object.keys(CONDITION_TERMS) as ContainerCondition[]
  const grades = Object.keys(GRADE_TERMS) as ContainerGrade[]

  for (const size of sizes) {
    const dim = findFile(`${sizeSlug(size)}_dimension`, ['pdf'])
    if (dim) reachable.add(dim)

    for (const condition of conditions) {
      for (const grade of grades) {
        const stem = specFileStem(size, condition, grade)
        const img = findFile(stem, ['webp', 'png', 'jpg', 'jpeg'])
        if (img) reachable.add(img)
        const pdf = findFile(stem, ['pdf'])
        if (pdf) reachable.add(pdf)
      }
    }
  }

  return PDP_RESOURCE_FILES.filter((f) => !reachable.has(f))
}
