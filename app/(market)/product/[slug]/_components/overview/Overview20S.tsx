import { Shield, CheckCircle2, Lock, Layers } from 'lucide-react'

const useCases = [
  'Residential Storage', 'Construction Sites', 'Farm & Agriculture', 'Retail Overflow',
  'Workshop Space', 'Event Storage', 'Moving & Relocation', 'Disaster Relief',
  'Military Storage', 'Pop-up Retail',
]

const features = [
  { Icon: Shield, title: 'Material', desc: 'High-strength Corten steel.' },
  { Icon: Layers, title: 'Flooring', desc: 'Marine-grade plywood over steel cross members.' },
  { Icon: Lock, title: 'Security', desc: 'Heavy-duty cargo doors with secure locking bars.' },
  { Icon: CheckCircle2, title: 'Inspection', desc: 'Fully inspected for operational doors, seals, and floors.' },
]

export function Overview20S() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 mb-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3.5">
            20 FT Shipping Container for Sale Overview
          </h2>
          <p className="text-sm sm:text-base text-theme-muted leading-relaxed">
            Our 20 ft shipping containers provide a cost-effective, durable solution for storage and shipping. Made from tough Corten steel, these containers are built to last and are fully inspected for door, floor, and seal functionality.
          </p>
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight mb-3.5">Ideal For</h3>
          <div className="flex flex-wrap gap-2">
            {useCases.map((u, index) => (
              <span
                key={`use-cases-${u}-${index}`}
                className="bg-theme-subtle border border-theme-border text-theme-accent px-3 py-1.5 rounded text-xs sm:text-sm font-semibold cursor-pointer hover:bg-theme-accent hover:text-white transition-colors"
              >
                {u}
              </span>
            ))}
          </div>
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4">Key Features</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {features.map((f, index) => (
          <div
            key={`features-${f.title}-${index}`}
            className="group flex gap-3.5 items-start p-4 sm:p-4.5 rounded-lg border border-theme-border bg-theme-subtle hover:border-theme-primary hover:-translate-y-0.5 transition-all"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-theme-primary-light flex items-center justify-center shrink-0 group-hover:bg-theme-primary transition-colors">
              <f.Icon className="w-4.5 h-4.5 text-theme-primary group-hover:text-white transition-colors" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base mb-1">{f.title}</h4>
              <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
