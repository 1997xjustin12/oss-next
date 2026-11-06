import Image from 'next/image'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { CARGO_EXPECT, CARGO_INTRO, CARGO_LINKS } from '@/lib/data/cargoWorthyContent'
import { CargoRichText } from './CargoRichText'

const H2 = 'text-2xl font-extrabold leading-tight text-theme-dark sm:text-3xl dark:text-white'
const BODY = 'text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300'

/**
 * What a cargo worthy container is, the three example photos, the survey
 * inspection and the grade, then what a used one comes with, beside the wall
 * and floor close-ups.
 */
export function CargoIntro() {
  const { heading, body, examplesHeading, examples, morePhotosCta, survey, gradeHeading, grade } = CARGO_INTRO

  return (
    <>
      <section aria-labelledby="cargo-intro" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
        <h2 id="cargo-intro" className={H2}>{heading}</h2>
        <CargoRichText segments={body} className={`mt-4 ${BODY}`} />

        <h2 className={`mt-10 ${H2}`}>{examplesHeading}</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {examples.map((photo) => (
            <li key={photo.src} className="overflow-hidden rounded-xl bg-theme-subtle ring-1 ring-theme-border dark:bg-neutral-800 dark:ring-neutral-800">
              <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 640px) 90vw, 30vw" className="h-auto w-full" />
            </li>
          ))}
        </ul>
        <div className="mt-6 text-center">
          <Link
            href={CARGO_LINKS.morePhotos}
            className="inline-flex min-h-12 items-center rounded-md bg-theme-primary px-8 text-base font-bold text-white transition-colors hover:bg-theme-primary-dark
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary"
          >
            {morePhotosCta}
          </Link>
        </div>
        <p className={`mt-8 ${BODY}`}>{survey}</p>

        <h2 className={`mt-10 ${H2}`}>{gradeHeading}</h2>
        <p className={`mt-4 ${BODY}`}>{grade}</p>
      </section>

      <section aria-label="What to expect" className="bg-theme-subtle px-[5%] py-12 sm:py-16 dark:bg-neutral-900">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="min-w-0">
            <p className="text-lg font-extrabold text-theme-dark sm:text-xl dark:text-white">{CARGO_EXPECT.intro}</p>
            <ul className="mt-5 space-y-3">
              {CARGO_EXPECT.items.map((item) => (
                <li key={item} className="relative pl-6 text-base leading-relaxed text-theme-mid dark:text-neutral-300">
                  <span aria-hidden className="absolute left-0 top-[0.55em] h-2.5 w-2.5 rounded-full bg-theme-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <ul className="grid grid-cols-2 gap-4">
            {CARGO_EXPECT.images.map((photo) => (
              <li key={photo.src} className="overflow-hidden rounded-xl bg-white ring-1 ring-theme-border dark:bg-neutral-800 dark:ring-neutral-800">
                <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 1024px) 45vw, 22vw" className="h-auto w-full" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
