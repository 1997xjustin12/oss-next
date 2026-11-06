/**
 * The "Shipping Container Quote Requests" form from the WordPress FAQ page: a
 * Zoho CRM web-to-contact form with its own form keys (not the homepage's
 * pricing form or the product page's Save Quote form), so a request lands in
 * the same CRM form and fields as before.
 *
 * Not content: the hidden values identify the form to Zoho, and the field names
 * are Zoho's. They are public (in the WordPress page's HTML). Shared by the
 * browser form (validation, options) and the server route (the post body).
 */

export const ZOHO_QUOTE_REQUEST = {
  title: 'Shipping Container Quote Requests',
  action: 'https://crm.zoho.com/crm/WebToContactForm',
  hidden: {
    xnQsjsdp: 'd3037f4435390bfb35aa1d7f705ca794464ebf79d3b5a6fe8ee0d95eafa1b06c',
    zc_gad: '',
    xmIwtLD: '2aadffe0b3639daae20e5c883d7659c2f4c5e4089941fb9c835cfd326f9e66e3',
    actionType: 'Q29udGFjdHM=',
    // Sent from the server, so Zoho answers with its own page (see
    // postZohoWebForm); the visitor is sent on to `thankYouPath` after.
    returnURL: 'null',
    ldeskuid: '',
    LDTuvid: '',
  },
  /** Where WordPress's `returnURL` sent the visitor. */
  thankYouPath: '/thank-you',
  /** Google reCAPTCHA v2, which Zoho checks (the same key as the newsletter form). */
  recaptchaSiteKey: '6Lda2_chAAAAAHcDQfLME3EAFPRxWLvaWFl62TaG',
  smsConsent:
    'By providing your phone number, you agree to receive order updates and promotional text messages from On-Site Storage Solutions. Message and data rates may apply. Message frequency varies. We will never share, sell, or rent your personal information from third parties. Reply STOP to cancel or HELP for help.',
} as const

/** Our own honeypot field: never shown to a person, never sent to Zoho. */
export const QUOTE_REQUEST_HONEYPOT = 'website'

type Field = {
  /** Zoho's field name. */
  name: string
  label: string
  required: boolean
  maxLength?: number
  kind?: 'text' | 'email' | 'tel' | 'select' | 'textarea'
  options?: readonly string[]
  autoComplete?: string
}

/** The fields, in WordPress's order, by our key. */
export const QUOTE_REQUEST_FIELDS = {
  firstName: { name: 'First Name', label: 'First Name', required: true, maxLength: 40, autoComplete: 'given-name' },
  lastName: { name: 'Last Name', label: 'Last Name', required: true, maxLength: 80, autoComplete: 'family-name' },
  email: { name: 'Email', label: 'Email', required: true, maxLength: 100, kind: 'email', autoComplete: 'email' },
  phone: { name: 'Phone', label: 'Primary Phone Number', required: true, maxLength: 50, kind: 'tel', autoComplete: 'tel' },
  street: { name: 'CONTACTCF20', label: 'Shipping Street', required: false, maxLength: 255, autoComplete: 'street-address' },
  city: { name: 'CONTACTCF3', label: 'Shipping City', required: false, maxLength: 255, autoComplete: 'address-level2' },
  state: { name: 'CONTACTCF5', label: 'Shipping State', required: false, maxLength: 255, autoComplete: 'address-level1' },
  zip: { name: 'CONTACTCF7', label: 'Shipping Zip Code', required: true, maxLength: 255, autoComplete: 'postal-code' },
  size: {
    name: 'CONTACTCF23',
    label: 'Container Size',
    required: true,
    kind: 'select',
    options: ['20ft Container', '40ft Container', '40ft High Cube Container', '45ft Container', '20ft Refrigerated Container', '40ft Refrigerated Container', 'Other Size or Type'],
  },
  condition: { name: 'CONTACTCF22', label: 'Container Condition', required: true, kind: 'select', options: ['New one-trip', 'Used', 'As-is'] },
  timing: { name: 'CONTACTCF24', label: 'Delivery Timing', required: true, kind: 'select', options: ['Next Available Date', 'Within two weeks', 'Just Shopping Around'] },
  notes: { name: 'Description', label: 'Additional Info', required: false, maxLength: 2000, kind: 'textarea' },
} as const satisfies Record<string, Field>

export type QuoteRequestField = keyof typeof QUOTE_REQUEST_FIELDS
export type QuoteRequestValues = Record<QuoteRequestField, string>
export type QuoteRequestErrors = Partial<Record<QuoteRequestField | 'privacy', string>>

export const EMPTY_QUOTE_REQUEST: QuoteRequestValues = Object.fromEntries(
  Object.keys(QUOTE_REQUEST_FIELDS).map((key) => [key, '']),
) as QuoteRequestValues

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Only our fields, only strings: anything else in a request body is dropped. */
export function pickQuoteRequest(input: unknown): QuoteRequestValues {
  const source = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const values = { ...EMPTY_QUOTE_REQUEST }
  for (const key of Object.keys(QUOTE_REQUEST_FIELDS) as QuoteRequestField[]) {
    if (typeof source[key] === 'string') values[key] = source[key]
  }
  return values
}

/**
 * Every problem, by field, as a sentence for the visitor. The same checks run in
 * the browser (inline) and on the server (the authority). Empty when valid.
 */
export function validateQuoteRequest(values: QuoteRequestValues, privacyAccepted: boolean): QuoteRequestErrors {
  const errors: QuoteRequestErrors = {}
  for (const key of Object.keys(QUOTE_REQUEST_FIELDS) as QuoteRequestField[]) {
    const field: Field = QUOTE_REQUEST_FIELDS[key]
    const value = values[key].trim()
    if (field.required && !value) {
      errors[key] = field.kind === 'select' ? `Choose a ${field.label.toLowerCase()}.` : `Enter your ${field.label.toLowerCase()}.`
    } else if (field.kind === 'select' && value && !field.options?.includes(value)) {
      errors[key] = `Choose a ${field.label.toLowerCase()}.`
    }
  }
  if (!errors.email && !EMAIL.test(values.email.trim())) errors.email = 'Enter a valid email address.'
  if (!privacyAccepted) errors.privacy = 'Please accept the Privacy Policy and Terms of Service.'
  return errors
}

/** The body Zoho's form posts: the hidden values, each field under Zoho's name cut to its length, and the captcha. */
export function zohoQuoteRequestBody(values: QuoteRequestValues, captchaToken: string): URLSearchParams {
  const body = new URLSearchParams({ ...ZOHO_QUOTE_REQUEST.hidden })
  for (const key of Object.keys(QUOTE_REQUEST_FIELDS) as QuoteRequestField[]) {
    const field: Field = QUOTE_REQUEST_FIELDS[key]
    const value = values[key].trim()
    body.set(field.name, field.maxLength ? value.slice(0, field.maxLength) : value)
  }
  // WordPress's form sends its privacy checkbox as `privacyTool`.
  body.set('privacyTool', 'on')
  body.set('g-recaptcha-response', captchaToken)
  return body
}
