import { PDP_SHIPPING_CONTAINERS } from '@/lib/data/pdpShippingContainers'
import type { ContainerVariantKey } from '@/lib/containerVariant'

type Props = { variant: ContainerVariantKey }

/**
 * Container specifications as a real `<table>`.
 *
 * Was a `<div>` grid of label/value cards. It looked fine and conveyed nothing:
 * to a screen reader it is an undifferentiated run of text, and to a parser —
 * a crawler, an AI assistant reading the DOM — the association between "External
 * Length" and "40 ft" was a guess based on visual nesting. A table states it.
 *
 * `<th scope="row">` on the label is what carries that association; without the
 * scope a two-column table is still ambiguous about which axis is the header.
 */
export function Specifications({ variant }: Props) {
  const specs = PDP_SHIPPING_CONTAINERS[variant].specs

  return (
    <section aria-labelledby="specs-heading">
      <h3 id="specs-heading" className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4">
        Full Technical Specifications
      </h3>

      {/* Own scroll container so a long value can never push the page into
          horizontal scroll on a narrow viewport. */}
      <div className="overflow-x-auto rounded-lg border border-theme-border">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Technical specifications for this shipping container
          </caption>
          <tbody>
            {specs.map((s, i) => (
              <tr
                key={`specs-${s.label}-${i}`}
                className={i % 2 === 0 ? 'bg-theme-bg' : 'bg-theme-subtle'}
              >
                <th
                  scope="row"
                  className="w-1/2 px-4 py-3 sm:px-5 sm:py-4 align-top text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-theme-muted"
                >
                  {s.label}
                </th>
                <td className="px-4 py-3 sm:px-5 sm:py-4 align-top font-extrabold text-base sm:text-lg">
                  {s.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
