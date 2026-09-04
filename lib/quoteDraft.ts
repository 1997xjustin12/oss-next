import { cookies } from 'next/headers'

/**
 * The details a visitor typed on step 3, carried to step 4.
 *
 * A short-lived httpOnly cookie rather than the query string: a name, email and
 * phone in a URL end up in browser history, server logs and the `Referer`
 * header of every outbound link on the next page. The cookie keeps them out of
 * all three, and the flow still works with JavaScript disabled — which the
 * query string would too, but at that cost.
 *
 * Read here rather than in the action file on purpose: every export of a
 * `'use server'` module becomes a callable endpoint, and a reader that returns
 * personal details should not be one.
 */

export const QUOTE_DRAFT_COOKIE = 'oss_quote_draft'

/** Long enough to finish reading the review page, short enough not to linger. */
export const QUOTE_DRAFT_MAX_AGE = 60 * 30

export type QuoteDraft = {
  fullName: string
  phone: string
  email: string
  contactMethod: string
  interests: string[]
  timeline: string
  details: string
}

export async function readQuoteDraft(): Promise<QuoteDraft | null> {
  const raw = (await cookies()).get(QUOTE_DRAFT_COOKIE)?.value
  if (!raw) return null

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw))
    if (typeof parsed !== 'object' || parsed === null) return null
    const draft = parsed as Partial<QuoteDraft>
    return {
      fullName: String(draft.fullName ?? ''),
      phone: String(draft.phone ?? ''),
      email: String(draft.email ?? ''),
      contactMethod: String(draft.contactMethod ?? 'phone'),
      interests: Array.isArray(draft.interests) ? draft.interests.map(String) : [],
      timeline: String(draft.timeline ?? ''),
      details: String(draft.details ?? ''),
    }
  } catch {
    // A cookie we cannot parse is one written by an older shape of this form.
    // Treat it as absent rather than failing the render.
    return null
  }
}
