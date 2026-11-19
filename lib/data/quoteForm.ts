/**
 * "Get a free quote" (components/shared/QuoteForm.tsx): the homepage's words,
 * which the /all-city/ template starts from. Kept here, not in the component:
 * it is a Client Component, and server code cannot import plain values from one.
 */

export const QUOTE_FORM_BODY =
  'Tell us your size, location, and needs — we’ll respond with an accurate, no-obligation price and fast delivery timeline from our nearest depot'

export const QUOTE_FORM_POINTS: readonly string[] = [
  'No obligation — free pricing always',
  'Same-day response from our team',
  'All container grades and conditions',
  'Buy, rent, or rent-to-own options',
  'Delivery from 130+ nationwide depots',
]
