import Image from 'next/image'
import { Phone } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { CONTACT_NUMBER, telHref } from '@/lib/helpers'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { resolvePageMetadata } from '@/lib/seo'
import { LocationSearch } from './_components/LocationSearch'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.WHERE_TO_BUY)
}

/**
 * The depot index — this app's page since 2026-10-13, where WordPress served
 * it before.
 *
 * Only the parent path moved. Every city beneath it
 * (`/where-to-buy-shipping-containers/atlanta-ga` and 57 others) is still
 * WordPress's and still reaches the `[...slug]` catch-all, which is why
 * `ROUTES.WHERE_TO_BUY` is in `NATIVE_EXACT_PATHS` rather than the segment
 * list — see config/routes.ts.
 *
 * Server-rendered with no client boundary: nothing here is interactive beyond
 * a `tel:` link, so there is no reason to ship JavaScript for it.
 */

/**
 * The hero.
 *
 * In this file rather than `_components/` deliberately — it is used once, by
 * this page, and the project's rule is that route-specific components live
 * with their route. It moves out the moment a second page wants it.
 */
function Hero() {
  // No `overflow-hidden` on the section, deliberately. It was clipping the
  // location search's suggestion list by 140px — the third suggestion onward
  // sat below the hero's bottom edge and could not be read or clicked. Nothing
  // needs the clip: the background image is `fill`, so it is
  // `position: absolute; inset: 0` and cannot overflow the section it is
  // measured against, and the scrim is the same. The clip was defending
  // against an overflow that does not exist, at the cost of one that does.
  return (
    <section className="relative isolate flex min-h-[20rem] items-center justify-center sm:min-h-[26rem] lg:min-h-[32rem]">
      {/*
        `fill` + `priority`: this is the LCP element, so it must not wait for
        layout to discover it. `sizes="100vw"` because it spans the viewport at
        every breakpoint — without it next/image would serve the full-width
        source to a phone.
      */}
      <Image
        src="/images/page-hero/locations-banner.webp"
        alt="Where To Buy Shipping Containers"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/*
        The scrim, not a decorative flourish: white text over a photograph is
        unreadable wherever the photograph happens to be light. Deeper in dark
        mode, matching the homepage hero, so the page does not glare at someone
        who asked for a dark theme.
      */}
      <div className="absolute inset-0 -z-10 bg-black/55 dark:bg-black/70" />

      {/*
        Left-aligned, not centred: `items-start` + `text-left`. `mx-auto` stays
        so the column itself still sits in the middle of a wide viewport —
        without it the content would pin to the far edge of a 2560px screen.
      */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-start gap-5 px-4 py-14 text-left sm:gap-6 sm:px-6 sm:py-20">
        <h1 className="text-3xl font-extrabold uppercase leading-tight tracking-tight text-white drop-shadow-sm sm:text-4xl lg:text-5xl">
          Where to Buy Shipping Containers
        </h1>

        <h2 className="max-w-3xl text-lg font-semibold leading-snug text-white/90 sm:text-xl lg:text-2xl">
          Looking For &ldquo;Shipping Containers Near Me&rdquo;?
        </h2>

        {/*
          A real `tel:` link rather than a button: it is a navigation, so it
          belongs to the element browsers and screen readers already understand
          — and it stays usable on a desktop that cannot dial.

          The number is read from CONTACT_NUMBER so this page cannot drift from
          the rest of the site, and `telHref` strips the formatting that would
          otherwise make the dial string invalid.
        */}
        <a
          href={telHref(CONTACT_NUMBER)}
          className="inline-flex items-center gap-2.5 rounded-md bg-theme-primary px-7 py-3.5 text-base font-extrabold uppercase tracking-wide
                     text-white shadow-lg transition-colors hover:bg-theme-primary-dark
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white
                     sm:text-lg"
        >
          <Phone className="h-5 w-5 shrink-0" aria-hidden />
          <span>
            <span className="sr-only">Call us at </span>
            {CONTACT_NUMBER}
          </span>
        </a>

        {/* Layout only so far — see the note in the component. */}
        <LocationSearch />
      </div>
    </section>
  )
}

export default function WhereToBuyPage() {
  return (
    <>
      <PageHeadScripts path={ROUTES.WHERE_TO_BUY} />
      <main>
        <Hero />
      </main>
    </>
  )
}
