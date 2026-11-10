import { capitalizeWords } from '@/lib/utils'
import type { ProductHit } from '@/types/product'

/**
 * The marketing team's SEO fields on a product (`seo` on the Elasticsearch
 * document), cleaned for use on the product page. Their Yoast equivalents:
 *
 * - `seo.title`, the SEO title: the page's `<title>`.
 * - `seo.description`, the meta description.
 * - `seo.focus_keyphrase`, the focus keyphrase. Yoast never prints this; it
 *   checks that the keyphrase appears in the title, description, H1 and image
 *   alt text. Here it leads the H1, sits in the main image's alt text, and is
 *   the page's `keywords` (meta tag and the Product JSON-LD).
 *
 * Measured 2026-11-10 on the live index: 4,102 of ~10,500 products have a
 * keyphrase, and those carry a hand-written title and description too. The
 * rest have `seo.title` equal to the product title and no description, so for
 * them nothing changes.
 *
 * Pure, so the server (metadata) and the client (the H1) read the same values.
 */

type SeoSource = Pick<ProductHit, 'seo' | 'title'>

/**
 * Zero-width characters pasted in along with the text: "portable storage
 * temecula​" is in the index as written. Invisible on screen, but they
 * make the keyphrase a different string from the words a visitor searches.
 */
const INVISIBLE = /[​-‍⁠﻿]/g

function clean(value: string | null | undefined): string {
  return (value ?? '').replace(INVISIBLE, '').replace(/\s+/g, ' ').trim()
}

/** State and province codes, which keyphrases write in lowercase ("phoenix az"). */
const REGION_CODES = new Set(
  (
    'al ak az ar ca co ct de dc fl ga hi id il in ia ks ky la me md ma mi mn ms mo mt ne nv nh nj nm ny nc nd oh ok ' +
    'or pa ri sc sd tn tx ut vt va wa wv wi wy ab bc mb nb nl ns nt nu on pe qc sk yt'
  ).split(' '),
)

/**
 * Codes that are also ordinary words ("storage in phoenix", "containers on
 * sale"). Uppercased only as the keyphrase's last word, where a state goes.
 */
const WORD_CODES = new Set(['al', 'co', 'de', 'hi', 'id', 'in', 'la', 'ma', 'me', 'oh', 'ok', 'on', 'or', 'pa'])

/** The focus keyphrase as written, cleaned; '' when there is none. */
export function focusKeyphrase(product: SeoSource): string {
  return clean(product.seo?.focus_keyphrase)
}

/**
 * The keyphrase as a heading: each word capitalised, state and province codes
 * in capitals. "mobile storage containers in phoenix az" becomes "Mobile
 * Storage Containers In Phoenix AZ" (not "Phoenix Az"). '' when there is none.
 */
export function keyphraseHeading(product: SeoSource): string {
  const words = focusKeyphrase(product).split(' ')
  return words
    .map((word, i) => {
      const lower = word.toLowerCase()
      const last = i === words.length - 1
      if (REGION_CODES.has(lower) && (last || !WORD_CODES.has(lower))) return lower.toUpperCase()
      return capitalizeWords(word)
    })
    .join(' ')
}

/**
 * The hand-written SEO title, or null when there is none. A `seo.title` equal
 * to the product title is the backend's default, not something someone wrote.
 */
export function productSeoTitle(product: SeoSource): string | null {
  const title = clean(product.seo?.title)
  return title && title !== clean(product.title) ? title : null
}

/** The hand-written meta description, or null when there is none. */
export function productSeoDescription(product: SeoSource): string | null {
  return clean(product.seo?.description) || null
}
