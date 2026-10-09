import Image from 'next/image'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { YouTubeEmbed } from '@/components/product/YouTubeEmbed'
import { BASE_URL } from '@/lib/helpers'
import type { ProductVideo } from '@/config/productVideos'

/**
 * The delivery guide video.
 *
 * Deliberately empty rather than filled with an invented id — the same rule
 * `config/productVideos.ts` follows, and for the same reason: a wrong id
 * renders as "Video unavailable" on a live product page. With no id the right
 * column is the download button alone.
 */
const DELIVERY_VIDEO: ProductVideo = {
  id: '',
  title: 'A Quick Guide to Shipping Container Delivery: What You Need to Know',
}

/**
 * ASSUMED DESTINATION for the download button.
 *
 * No PDF for this exists under `public/`, and this is the site's own delivery
 * guide page. Point it at a file here instead once one is supplied.
 */
const DELIVERY_GUIDE_HREF = `${BASE_URL}/complete-shipping-container-delivery-guide/`

const CONSIDERATIONS = [
  {
    title: 'Accessible Delivery Location',
    desc: 'Allow at least 12 ft of clear width so the delivery truck can safely access and maneuver.',
  },
  {
    title: 'Firm Ground',
    desc: 'Choose hard, stable ground. Avoid sand, mud, or loose soil that may cause the truck to sink.',
  },
  {
    title: 'Flat & Level Surface',
    desc: 'The delivery area must be flat and level for safe tilt-bed unloading and proper container placement.',
  },
  {
    title: 'Clear Delivery Area',
    desc: 'Allow 3× the container length in front for unloading — 60 ft for a 20 ft container and 120 ft for a 40 ft container.',
  },
]

/**
 * Delivery Info for the 20ft standard.
 *
 * Its own component rather than a branch inside a shared one: the sizes are
 * expected to diverge, and a component per size is cheaper to change than a
 * growing set of conditionals. 40ft keeps `DeliveryGeneric` until its own
 * design lands.
 */
export function Delivery20S() {
  return (
    <div>
      <header className="text-center mb-5 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          How is a <span className="text-theme-primary">20&prime;</span> Container Delivered?
        </h3>
        <p className="mt-1 text-sm sm:text-base text-theme-mid">
          We use tilt-bed roll-off trucks for most deliveries.
        </p>
      </header>

      {/* The four-step strip. Native size 1200x217, so it is declared at that
          ratio and left to scale — it is wide and short, and any other ratio
          would letterbox it. */}
      <Image
        src="/resources/pdp-delivery/delivery_guide.webp"
        alt="Four steps of a container delivery: the truck arrives at your site, the container is tilted off, the container is placed in position, and the truck pulls away."
        width={1200}
        height={217}
        sizes="(max-width: 1024px) 100vw, 70vw"
        className="h-auto w-full rounded-lg"
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
        {/* Left — the guidance */}
        <div>
          <h4 className="text-base sm:text-lg font-extrabold tracking-tight mb-2">
            Shipping Container Delivery Guide
          </h4>
          <p className="text-sm sm:text-base text-theme-mid leading-relaxed mb-4">
            Please consider the following points to ensure a hassle-free container delivery of your
            shipping container.
          </p>

          {/* A description list: each heading names a requirement and the text
              under it explains that requirement, which is the association
              <dt>/<dd> states and a styled <div> only implies. */}
          <dl className="space-y-3">
            {CONSIDERATIONS.map((c) => (
              <div key={c.title}>
                <dt className="text-sm sm:text-base font-extrabold">{c.title}</dt>
                <dd className="m-0 text-sm sm:text-base text-theme-mid leading-relaxed">{c.desc}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right — video and download */}
        <div className="flex flex-col gap-5">
          {DELIVERY_VIDEO.id ? (
            <YouTubeEmbed video={DELIVERY_VIDEO} />
          ) : null}

          <Link
            href={DELIVERY_GUIDE_HREF}
            className="inline-flex items-center justify-center gap-2 self-stretch rounded-sm bg-theme-primary px-6 py-4
                       text-sm sm:text-base font-extrabold uppercase tracking-wide text-white
                       transition-colors hover:bg-theme-primary-dark
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary"
          >
            <Download className="h-5 w-5 shrink-0" aria-hidden />
            Download Delivery Guide
          </Link>
        </div>
      </div>
    </div>
  )
}
