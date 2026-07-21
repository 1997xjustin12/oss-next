// The checkout/address forms store country as a display label ("United States
// (US)"), but external APIs want an ISO 3166-1 alpha-2 code. Single source of
// truth for that mapping — used by the Zippopotam ZIP lookup (lowercased, as a
// URL segment) and by the Braintree charge (uppercased, as countryCodeAlpha2).
const COUNTRY_ALPHA2: Record<string, string> = {
  'United States (US)': 'US',
  'Canada (CA)': 'CA',
}

/** Display label -> uppercase ISO2 ("US"), or undefined if unrecognised. */
export function toAlpha2(label: string): string | undefined {
  return COUNTRY_ALPHA2[label]
}
