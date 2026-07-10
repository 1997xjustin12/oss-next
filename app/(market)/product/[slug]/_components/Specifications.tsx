import { PDP_SHIPPING_CONTAINERS } from '@/lib/data/pdpShippingContainers'
import type { ContainerVariantKey } from '@/lib/containerVariant'

type Props = { variant: ContainerVariantKey }

export function Specifications({ variant }: Props) {
  const specs = PDP_SHIPPING_CONTAINERS[variant].specs

  return (
    <div>
      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4">Full Technical Specifications</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-theme-border rounded-lg overflow-hidden">
        {specs.map((s, i) => (
          <div key={`specs-${s.label}-${i}`} className={`p-4 sm:p-5 ${i % 2 === 0 ? 'bg-theme-bg' : 'bg-theme-subtle'}`}>
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-theme-muted mb-1">{s.label}</div>
            <div className="font-extrabold text-base sm:text-lg">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
