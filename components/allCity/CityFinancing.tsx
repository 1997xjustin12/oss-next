import { CircleArrowRight } from 'lucide-react'
import { LandingRichText } from '@/components/shared/LandingRichText'
import type { LandingInline } from '@/lib/data/containerLandingContent'

type Block = { title: string; body: readonly LandingInline[] }

type Props = {
  heading: string
  rental: Block
  lease: Block & { button: string; href: string }
}

const PARAGRAPH = 'mt-3 text-base leading-relaxed text-theme-dark dark:text-neutral-200'

/** "FINANCING AND RENTAL OPTIONS AVAILABLE": the navy band, then rental and lease-to-purchase. */
export function CityFinancing({ heading, rental, lease }: Props) {
  return (
    <section aria-labelledby="city-financing" className="bg-white dark:bg-neutral-950">
      <h2 id="city-financing" className="bg-[#0f3a59] px-[5%] py-5 text-center text-xl font-extrabold text-white sm:text-2xl">
        {heading}
      </h2>

      <div className="grid gap-10 px-[5%] py-10 md:grid-cols-2">
        <article>
          <h3 className="text-sm font-bold tracking-wider text-theme-dark dark:text-white">{rental.title}</h3>
          <p className={PARAGRAPH}>
            <LandingRichText content={rental.body} />
          </p>
        </article>

        <article>
          <h3 className="text-sm font-bold tracking-wider text-theme-dark dark:text-white">{lease.title}</h3>
          <p className={PARAGRAPH}>
            <LandingRichText content={lease.body} />
          </p>
          {/* Off-site (TimePayment), so a plain anchor rather than PillLink's prefetching link. */}
          <a
            href={lease.href}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-theme-primary px-6 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary sm:text-base"
          >
            {lease.button}
            <CircleArrowRight aria-hidden className="h-5 w-5 shrink-0" />
          </a>
        </article>
      </div>
    </section>
  )
}
