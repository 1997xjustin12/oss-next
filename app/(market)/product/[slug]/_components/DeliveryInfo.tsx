import Image from 'next/image'
import { Truck, MapPin, Calendar } from 'lucide-react'
import type { ContainerVariantKey } from '@/lib/containerVariant'

type Props = { variant: ContainerVariantKey }

const deliveryInfo = [
  { Icon: Truck, title: 'Tilt-Bed Delivery', desc: 'We use specialized tilt-bed trucks to place containers precisely where you need them — no crane required in most cases.' },
  { Icon: MapPin, title: '130+ Depot Locations', desc: 'With depots across all 50 states, we always find the closest container to minimize your delivery cost and timeline.' },
  { Icon: Calendar, title: '1–5 Business Days', desc: 'Most orders deliver within 1–5 business days. Rush delivery available. We coordinate a delivery window with you directly.' },
]

// Truck illustrations are keyed by size only — 40S and 40H share the same
// two images. Dimensions below are each file's native size.
const TRUCK_IMAGES: Record<'20' | '40', Record<'tiltBed' | 'flatBed', { src: string; width: number; height: number }>> = {
  '20': {
    tiltBed: { src: '/images/delivery/20-tilt-bed.webp', width: 561, height: 215 },
    flatBed: { src: '/images/delivery/20-flat-bed.webp', width: 526, height: 209 },
  },
  '40': {
    tiltBed: { src: '/images/delivery/40-tilt-bed.webp', width: 498, height: 242 },
    flatBed: { src: '/images/delivery/40-flat-bed.webp', width: 498, height: 242 },
  },
}

const SIZE_KEY: Record<ContainerVariantKey, '20' | '40'> = { '20S': '20', '40S': '40', '40H': '40' }

const CONTAINER_SIZE_LABEL: Record<ContainerVariantKey, string> = {
  '20S': '20 ft',
  '40S': '40 ft',
  '40H': '40 ft High Cube',
}

// Copy is shared across all three variants — only the truck illustrations
// differ, and only by size (20 vs 40).
const truckOptions = [
  {
    imageKey: 'tiltBed' as const,
    title: 'Tilt-Bed Truck (Most Common)',
    desc: 'Ideal for placing the container directly on the ground with no additional equipment required.',
    requirements: ['~65 ft of straight clearance', 'Minimum 12 ft width', '~16 ft vertical clearance', 'Level, firm ground'],
  },
  {
    imageKey: 'flatBed' as const,
    title: 'Flatbed Truck',
    desc: 'Best if you have on-site unloading equipment such as a forklift or crane.',
    requirements: ['~65 ft of straight clearance', 'Minimum 12 ft width', '~14 ft vertical clearance', 'Side access for unloading', 'Forklift or crane rated for 10,000 lbs with 8 ft forks'],
  },
]

const sitePrepRequirements = [
  'Clear and unobstructed access for the truck',
  'No overhead obstacles (trees, power lines, buildings)',
  'Dry, solid, level ground for placement',
  'Containers can be placed directly on flat ground — no foundation required',
]

export function DeliveryInfo({ variant }: Props) {
  const sizeKey = SIZE_KEY[variant]

  return (
    <div>
      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4">Delivery Information</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 bg-theme-dark rounded-xl p-6 sm:p-8 mb-6 text-white">
        {deliveryInfo.map((d, index) => (
          <div key={`delivery-info-${d.title}-${index}`} className="text-center">
            <d.Icon className="w-7 h-7 mx-auto mb-2.5 text-theme-primary" />
            <div className="font-extrabold text-base sm:text-lg mb-1">{d.title}</div>
            <p className="text-xs sm:text-sm text-white/55 leading-relaxed">{d.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-theme-subtle border border-theme-border rounded-xl p-5 sm:p-6 mb-6">
        <h4 className="text-lg sm:text-xl font-extrabold tracking-tight mb-5">Delivery Truck Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {truckOptions.map((t, index) => {
            const img = TRUCK_IMAGES[sizeKey][t.imageKey]
            return (
            <div key={`truck-options-${t.title}-${index}`}>
              <div className="rounded-lg border border-theme-border bg-theme-bg overflow-hidden mb-4">
                <Image
                  src={img.src}
                  alt={`${t.title} loaded with a ${CONTAINER_SIZE_LABEL[variant]} shipping container`}
                  width={img.width}
                  height={img.height}
                  className="w-full h-auto"
                />
              </div>
              <h5 className="font-extrabold text-base mb-1 underline underline-offset-2">{t.title}</h5>
              <p className="text-sm text-theme-muted leading-relaxed mb-2.5">{t.desc}</p>
              <p className="text-xs font-bold uppercase tracking-wide text-theme-mid mb-1.5">Requirements</p>
              <ul className="text-sm text-theme-mid leading-relaxed space-y-1 list-disc pl-5">
                {t.requirements.map((r, i) => <li key={`truck-requirements-${r}-${i}`}>{r}</li>)}
              </ul>
            </div>
            )
          })}
        </div>
      </div>

      <div className="bg-theme-primary-light border border-theme-border rounded-lg p-4 sm:p-5 mb-6">
        <h4 className="text-base sm:text-lg font-extrabold text-theme-primary mb-2">Site Preparation Requirements</h4>
        <p className="text-sm text-theme-mid leading-relaxed mb-2.5">Before scheduling storage container delivery, please ensure:</p>
        <ul className="text-sm text-theme-mid leading-relaxed space-y-1.5 list-disc pl-5 mb-3">
          {sitePrepRequirements.map((tip, index) => <li key={`site-prep-${tip}-${index}`}>{tip}</li>)}
        </ul>
        <p className="text-sm text-theme-mid leading-relaxed">
          If your site has limited access, soft ground, fencing, or tight turns, please notify us in advance so we can select the best delivery option.
        </p>
      </div>

      <div className="border border-theme-border rounded-lg p-4 sm:p-5">
        <h4 className="text-base sm:text-lg font-extrabold mb-2">Delivery Timing</h4>
        <p className="text-sm text-theme-muted leading-relaxed">
          Delivery is typically completed within 1–3 business days once the container is ready for dispatch.
        </p>
      </div>
    </div>
  )
}
