import type { GuestLead } from '@/lib/guestCapture'

/**
 * The "Save Quote Form": a Zoho CRM web-to-contact form, from the embed code in
 * docs/reference/product-page-quote-form.md. Each submission creates a Contact
 * in Zoho, so this app stores no lead of its own.
 *
 * Meant for more than one place on the site (the product page's guest lead
 * modal first), each with its own look and its own extra behaviour on submit.
 * What they share lives here and in `useZohoQuoteForm`: the field names Zoho
 * expects, the hidden values, the checks, and the visitor's details saved in
 * this browser so every copy of the form opens already filled in.
 */

export const ZOHO_QUOTE_FORM = {
  action: 'https://crm.zoho.com/crm/WebToContactForm',
  /** Sent as they are: Zoho identifies the form and the record type by them. */
  hidden: {
    xnQsjsdp: '3cdebed6dfded11cb5e2868cb69370bb1b380ad9f001cf58579519d1361ca996',
    xmIwtLD: 'f07c8d00119e3fe26f793f0048065cfdcf752fb222d44acf9814cf76f9041489e419b841e83b85476cea1d36748c3961',
    /** "Contacts", base64. */
    actionType: 'Q29udGFjdHM=',
    /** As in Zoho's embed: Zoho answers with its own thank-you page (see zohoAccepted). */
    returnURL: 'null',
    zc_gad: '',
    /** Honeypot ("honeypot", base64): must stay empty, or Zoho drops the lead. */
    aG9uZXlwb3Q: '',
  },
} as const

/** The form's honeypot field, in our own form too: a bot fills it, a person never sees it. */
export const ZOHO_HONEYPOT = 'aG9uZXlwb3Q'

/**
 * The body Zoho's form posts: the hidden values, and each field under Zoho's
 * name, cut to Zoho's length.
 */
export function zohoQuoteBody(values: ZohoQuoteValues): URLSearchParams {
  const body = new URLSearchParams({ ...ZOHO_QUOTE_FORM.hidden })
  for (const key of Object.keys(ZOHO_QUOTE_FIELDS) as ZohoQuoteField[]) {
    const field = ZOHO_QUOTE_FIELDS[key]
    body.set(field.name, values[key].trim().slice(0, field.maxLength))
  }
  return body
}

/** Only our fields, only strings: anything else in a request body is dropped. */
export function pickZohoQuote(input: unknown): ZohoQuoteValues {
  const source = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const values = { ...EMPTY_ZOHO_QUOTE }
  for (const key of Object.keys(EMPTY_ZOHO_QUOTE) as ZohoQuoteField[]) {
    if (typeof source[key] === 'string') values[key] = source[key]
  }
  return values
}

/**
 * Whether Zoho accepted a post, from its answer. Observed 2026-10-30 against
 * this form: an accepted post is HTTP 200 with Zoho's own page, "Thank you for
 * submitting your response. Your response has been submitted successfully. We
 * will reach out to you soon." (whatever `returnURL` says); a refused one is a
 * 302, back to the Referer for wrong form keys or to zoho.com for an empty
 * post. So it is the success wording that decides, not the status alone: a 200
 * that says anything else (an error page, say) is not an acceptance.
 */
export function zohoAccepted(status: number, pageText: string): boolean {
  return status === 200 && /submitted successfully/i.test(pageText)
}

/** The answer from app/api/zoho-quote. */
export type ZohoQuoteResult = { ok: true } | { ok: false; error: string }

/** The form's fields: our key, Zoho's field name, its limit, whether Zoho requires it. */
export const ZOHO_QUOTE_FIELDS = {
  firstName: { name: 'First Name', maxLength: 40, required: true },
  lastName: { name: 'Last Name', maxLength: 80, required: true },
  phone: { name: 'Phone', maxLength: 50, required: true },
  email: { name: 'Email', maxLength: 100, required: true },
  street: { name: 'CONTACTCF20', maxLength: 255, required: false },
  city: { name: 'CONTACTCF3', maxLength: 255, required: false },
  state: { name: 'CONTACTCF5', maxLength: 255, required: false },
  zip: { name: 'CONTACTCF7', maxLength: 255, required: true },
} as const

export type ZohoQuoteField = keyof typeof ZOHO_QUOTE_FIELDS

export type ZohoQuoteValues = Record<ZohoQuoteField, string>

export const EMPTY_ZOHO_QUOTE: ZohoQuoteValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  street: '',
  city: '',
  state: '',
  zip: '',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * The first problem with the values, as a sentence for the visitor, or null.
 * The same five fields Zoho's own script requires, in the order it checks them.
 */
export function validateZohoQuote(values: ZohoQuoteValues): string | null {
  if (!values.firstName.trim()) return 'Enter your first name.'
  if (!values.lastName.trim()) return 'Enter your last name.'
  if (!values.phone.trim()) return 'Enter a phone number we can reach you on.'
  if (!EMAIL_PATTERN.test(values.email.trim())) return 'Enter a valid email address.'
  if (!values.zip.trim()) return 'Enter the delivery ZIP so we can price the trucking.'
  return null
}

// ─── Saved in this browser ─────────────────────────────────────────────────

const KEY = 'oss-quote-form'

/**
 * What the visitor last submitted, or null. Read by every copy of the form,
 * so details typed in one area fill in the other.
 */
export function readZohoQuote(): ZohoQuoteValues | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ZohoQuoteValues> | null
    if (!parsed || typeof parsed !== 'object') return null
    // Field by field, so a hand-edited or older entry can't put a non-string in a box.
    const values = { ...EMPTY_ZOHO_QUOTE }
    for (const key of Object.keys(EMPTY_ZOHO_QUOTE) as ZohoQuoteField[]) {
      if (typeof parsed[key] === 'string') values[key] = parsed[key]
    }
    return values
  } catch {
    // Safari private mode throws rather than returning null.
    return null
  }
}

export function writeZohoQuote(values: ZohoQuoteValues): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...values, savedAt: new Date().toISOString() }))
  } catch {
    // Storage full or unavailable: the submission still went to Zoho, only the
    // prefill next time is lost.
  }
}

/**
 * The details to open the form with: the last submission; else what the rest
 * of the site already knows (the guest lead the older forms stored, the
 * visitor's ZIP), so nobody is asked twice for something they gave once.
 */
export function initialZohoQuote(lead: GuestLead | null, visitorZip: string): ZohoQuoteValues {
  const saved = readZohoQuote()
  if (saved) return { ...saved, zip: saved.zip || visitorZip }
  if (!lead) return { ...EMPTY_ZOHO_QUOTE, zip: visitorZip }
  const [firstName = '', ...rest] = lead.fullName.trim().split(/\s+/)
  return {
    firstName,
    lastName: rest.join(' '),
    phone: lead.phone,
    email: lead.email,
    street: lead.address1 ?? '',
    city: lead.city ?? '',
    state: lead.state ?? '',
    zip: lead.zip || visitorZip,
  }
}

/**
 * The submission as the site-wide guest lead, which checkout's prefill and the
 * exit-intent prompt read (lib/guestCapture.ts). Kept in step so they go on
 * working without knowing this form exists.
 */
export function zohoQuoteToLead(values: ZohoQuoteValues): Omit<GuestLead, 'capturedAt'> {
  const v = trimmed(values)
  return {
    fullName: [v.firstName, v.lastName].filter(Boolean).join(' '),
    email: v.email,
    phone: v.phone,
    address: [v.street, v.city, [v.state, v.zip].filter(Boolean).join(' ')].filter(Boolean).join(', '),
    ...(v.street ? { address1: v.street } : {}),
    ...(v.city ? { city: v.city } : {}),
    ...(v.state ? { state: v.state } : {}),
    zip: v.zip,
  }
}

export function trimmed(values: ZohoQuoteValues): ZohoQuoteValues {
  const out = { ...values }
  for (const key of Object.keys(out) as ZohoQuoteField[]) out[key] = out[key].trim()
  return out
}
