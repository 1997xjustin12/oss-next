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
  /**
   * The delivery address on one line, composed from the fields below.
   *
   * Kept alongside them because several readers want an address to *show* — the
   * review page, the lead that reaches sales, the product page's picker — and
   * rebuilding it in each of them would let them drift apart. The parts are
   * what checkout fills its form from.
   */
  address: string
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  /** 'US' or 'CA' — the two the storefront sells into. */
  country: string
  /**
   * The "Shipping note" field.
   *
   * Named `details` because that is what the form field and the lead note have
   * always been called; the 2026-09-23 design only relabelled it.
   */
  details: string
  /** False when the visitor unticked "invoice address is the same". */
  invoiceSameAsDelivery: boolean
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
      address: String(draft.address ?? ''),
      // Absent on a cookie written before the address was broken into fields:
      // that draft still repopulates everything else rather than being dropped.
      address1: String(draft.address1 ?? ''),
      address2: String(draft.address2 ?? ''),
      city: String(draft.city ?? ''),
      state: String(draft.state ?? ''),
      zip: String(draft.zip ?? ''),
      country: String(draft.country ?? 'US'),
      details: String(draft.details ?? ''),
      // Absent on a draft written before 2026-09-23. Those were all "same as
      // delivery", since there was nowhere to say otherwise.
      invoiceSameAsDelivery: draft.invoiceSameAsDelivery !== false,
    }
  } catch {
    // A cookie we cannot parse is one written by an older shape of this form.
    // Treat it as absent rather than failing the render.
    return null
  }
}
