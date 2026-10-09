import Image from 'next/image'
import { PDP_SHIPPING_CONTAINERS } from '@/lib/data/pdpShippingContainers'
import type { ContainerVariantKey } from '@/lib/containerVariant'

type Props = { variant: ContainerVariantKey }

/**
 * Container specifications: a dimensioned drawing over a strip of figures.
 *
 * The figures are a `<dl>`, not a grid of `<div>`s. To a screen reader or a
 * parser the association between "Exterior Length" and "20 ft" has to be
 * stated, not implied by visual nesting — `<dt>`/`<dd>` is what states it, and
 * it survives the layout changing between four and eight columns.
 *
 * The icons carry `alt=""`: each one sits directly above the label it
 * illustrates, so naming it again would make a screen reader read every figure
 * twice.
 */
export function Specifications({ variant }: Props) {
  const { items, image, intro } = PDP_SHIPPING_CONTAINERS[variant].tabs.specs

  return (
    <section aria-labelledby="specs-heading">
      <h3 id="specs-heading" className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4">
        Full Technical Specifications
      </h3>

      {/* Optional lead paragraph. No size has one yet; the slot is here so copy
          can be added to the data rather than to this component. */}
      {intro && <p className="mb-4 text-sm sm:text-base text-theme-mid">{intro}</p>}

      {/* Sizes without a drawing render the figures alone rather than a gap. */}
      {image && (
        <div className="mb-4 sm:mb-5 overflow-hidden rounded-lg border border-theme-border bg-theme-bg">
          <Image
            src={image}
            alt={`Dimensioned drawing of a ${variant === '20S' ? '20ft standard' : variant === '40S' ? '40ft standard' : '40ft high cube'} shipping container, showing exterior and interior measurements`}
            width={1200}
            height={800}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="h-auto w-full"
          />
        </div>
      )}

      {/*
        Four across on phones and tablets, all eight on a wide screen.

        The 1px gaps are the dividers: the grid's own background shows through
        them, and the cells paint over everything else. That draws the right
        lines at any column count on its own, where per-cell borders would need
        an nth-child rule per breakpoint to stop a stray rule on the outer edge.
      */}
      <dl className="grid grid-cols-4 lg:grid-cols-8 gap-px overflow-hidden rounded-lg border border-theme-border bg-theme-border">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-1 bg-theme-subtle px-1.5 py-3 text-center sm:gap-1.5 sm:px-3 sm:py-4"
          >
            <Image
              src={item.image}
              alt=""
              // Sources are ~260px square; these are the rendered sizes, so
              // next/image serves something near them rather than the original.
              width={28}
              height={28}
              className="h-5 w-5 shrink-0 object-contain sm:h-7 sm:w-7"
            />
            <dt className="text-[8px] leading-tight font-bold uppercase tracking-wide text-theme-muted sm:text-[10px]">
              {item.label}
            </dt>
            <dd className="m-0">
              <span className="block text-[11px] font-extrabold leading-tight sm:text-sm lg:text-base">
                {item.value}
              </span>
              <span className="block text-[9px] leading-tight text-theme-muted sm:text-[11px]">
                {item.sub_value}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
