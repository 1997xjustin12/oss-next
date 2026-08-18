import { PDP_SHIPPING_CONTAINERS } from '@/lib/data/pdpShippingContainers'
import { Specifications } from './Specifications'
import type { ContainerVariantKey } from '@/lib/containerVariant'

type Props = { variant: ContainerVariantKey }

/**
 * The PDP's specifications and FAQ, rendered into the server HTML.
 *
 * `BodyTabsSection` is a Client Component that renders only the active tab, so
 * the specification values and the FAQ answers exist in the DOM only after
 * hydration and only after the visitor clicks. A `curl` of this page showed the
 * words "Specifications" and "Frequently" but not "External Length" or any
 * answer text — meaning the substance of the page was invisible to every
 * consumer that doesn't execute JavaScript, which includes several AI crawlers.
 *
 * `<noscript>` rather than a second visible copy: browsers with JS drop this
 * entirely, so there is no duplicate content, no layout shift and no extra
 * bytes painted. The data is the same array the tabs render from, so the two
 * can't disagree.
 */
export function NoScriptDetails({ variant }: Props) {
  const { faq } = PDP_SHIPPING_CONTAINERS[variant]

  return (
    <noscript>
      <Specifications variant={variant} />

      {faq.length > 0 && (
        <section aria-labelledby="noscript-faq-heading" className="mt-8">
          <h3 id="noscript-faq-heading" className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4">
            Frequently Asked Questions
          </h3>
          <dl>
            {faq.map((item) => (
              <div key={item.question} className="mb-4">
                <dt className="font-bold text-sm sm:text-[15px]">{item.question}</dt>
                <dd className="text-sm text-theme-muted leading-relaxed mt-1">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </noscript>
  )
}
