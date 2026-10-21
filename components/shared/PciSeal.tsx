import { PciSealLoader } from './PciSealLoader'

/**
 * The PCI compliance seal, from the provider's script.
 *
 * Configured by one environment variable, NEXT_PUBLIC_PCI_SEAL_SCRIPT_URL: the
 * full `src` of the script tag the PCI provider supplies, including its code —
 * e.g. `https://rapidscansecure.com/siteseal/siteseal.js?code=…`. Unset, empty,
 * or anything that is not an https URL renders nothing at all — no container,
 * no request — so the site is unaffected until a real value is set, and a typo
 * cannot turn into a broken script tag or a `javascript:` URL.
 *
 * The loading itself is PciSealLoader's: after the page, and working for seals
 * that draw themselves with `document.write` as well as those that insert
 * elements.
 *
 * NEXT_PUBLIC_ because the URL is public anyway (it is in every visitor's page
 * source). Read at build time: set it in Vercel, then redeploy.
 */
const PCI_SEAL_SCRIPT_URL = process.env.NEXT_PUBLIC_PCI_SEAL_SCRIPT_URL

function sealUrl(value: string | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  try {
    return new URL(trimmed).protocol === 'https:' ? trimmed : null
  } catch {
    return null
  }
}

export function PciSeal() {
  const src = sealUrl(PCI_SEAL_SCRIPT_URL)
  if (!src) return null

  return <PciSealLoader src={src} />
}
