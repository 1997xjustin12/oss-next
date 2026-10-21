import { PciSealLoader } from './PciSealLoader'

/**
 * The RapidScan PCI compliance seal.
 *
 * Configured by one environment variable, NEXT_PUBLIC_SITESEAL_CODE: the
 * `code=` value from the snippet RapidScan supplies —
 *
 *   <script src="https://rapidscansecure.com/siteseal/siteseal.js?code=…">
 *
 * Unset or empty renders nothing at all — no container, no request — so the
 * site is unaffected until a code is set. The code is URL-encoded into the
 * fixed RapidScan address, so whatever is pasted cannot change where the
 * script comes from.
 *
 * The loading itself is PciSealLoader's: after the page, and working with
 * RapidScan's document.write-style seal.
 *
 * NEXT_PUBLIC_ because the code is public anyway (it is in every visitor's
 * page source). Read at build time: set it in Vercel, then redeploy.
 */
const SITESEAL_SCRIPT = 'https://rapidscansecure.com/siteseal/siteseal.js'
const SITESEAL_CODE = process.env.NEXT_PUBLIC_SITESEAL_CODE?.trim().replace(/^["']|["']$/g, '')

export function PciSeal() {
  if (!SITESEAL_CODE) return null

  return <PciSealLoader src={`${SITESEAL_SCRIPT}?code=${encodeURIComponent(SITESEAL_CODE)}`} />
}
