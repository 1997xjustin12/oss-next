/**
 * A page's `<meta name="keywords">`: its focus keyphrase first, then its other
 * keywords, each once (case-insensitive), cleaned of the invisible characters
 * pasted text brings along. Undefined when there is nothing to say.
 *
 * The focus keyphrase is the one phrase a page is written to rank for (Yoast's
 * "focus keyphrase"), set per page in the admin (Page Configurator, GBP SEO);
 * the analytics team reads it from the keywords tag. Pure.
 */
const INVISIBLE = /[​-‍⁠﻿]/g

export function cleanKeyphrase(value: string | null | undefined): string {
  return (value ?? '').replace(INVISIBLE, '').replace(/\s+/g, ' ').trim()
}

export function metaKeywords(focusKeyphrase: string | null | undefined, keywords: readonly string[] | null | undefined): string[] | undefined {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of [focusKeyphrase, ...(keywords ?? [])]) {
    const k = cleanKeyphrase(raw)
    if (k && !seen.has(k.toLowerCase())) {
      seen.add(k.toLowerCase())
      out.push(k)
    }
  }
  return out.length ? out : undefined
}
