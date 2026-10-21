import Script from 'next/script'

/**
 * The PCI compliance seal, from the provider's script.
 *
 * Configured by one environment variable, NEXT_PUBLIC_PCI_SEAL_SCRIPT_URL: the
 * `src` of the script tag the PCI provider supplies. Unset, empty, or anything
 * that is not an https URL renders nothing at all — no container, no request —
 * so the site is unaffected until a real value is set, and a typo cannot turn
 * into a broken script tag or a `javascript:` URL.
 *
 * Loaded `lazyOnload`, like every non-critical third-party script here, so the
 * seal never competes with the page's own content for the network. The
 * provider's script finds its place through the container rendered here; most
 * seals append their badge next to their own script tag or into a known
 * element. A seal that relies on `document.write` cannot work when loaded
 * after the page — browsers ignore it — so if the provider's instructions say
 * the script must sit exactly where the badge appears and the badge never
 * shows, it needs loading in place instead of `lazyOnload`.
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

  return (
    <div id="pci-seal" className="flex items-center" aria-label="PCI compliance seal">
      <Script id="pci-seal-script" src={src} strategy="lazyOnload" />
    </div>
  )
}
