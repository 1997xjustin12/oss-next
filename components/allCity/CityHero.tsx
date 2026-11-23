import Image from 'next/image'
import { GoogleReviewsBadge } from '@/components/shared/GoogleReviewsBadge'
import { TemplateRichText } from '@/components/shared/TemplateRichText'
import type { AllCityHeroText, AllCityQuoteCardText } from '@/types/allCity'

type Props = {
  /** The hero's wording, filled (the template's `sections.hero`). */
  text: AllCityHeroText
  /** The port photo (the template's media.heroBackground), the page's LCP image. */
  background: string
}

const ACCENT = 'text-amber-300'

/**
 * The /all-city/ hero (the 2026-11-18 design): the Google rating, the red
 * label, the page's h1 (its own SEO heading, the city part in amber), a line
 * on buying, renting and delivery, the free-quote card, and the figures
 * underneath. A Server Component: the quote card's tabs are radio buttons
 * styled with CSS, so nothing here needs script. The card is off by default
 * (`quote.show`); without it the text takes the full width.
 */
export function CityHero({ text, background }: Props) {
  return (
    <section aria-labelledby="city-hero-title" className="relative isolate overflow-hidden bg-[#0f3a59] px-[5%] py-8 sm:py-10 lg:py-12">
      <Image src={background} alt="" fill preload fetchPriority="high" sizes="100vw" className="-z-20 object-cover" />
      {/* Darker on a phone, where the text runs over the busiest part of the photo. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[#0b2b44]/80 lg:bg-[#0b2b44]/60 dark:bg-[#06192a]/85" />

      <div
        className={
          text.quote.show ? 'grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:items-center lg:gap-12 xl:gap-20' : undefined
        }
      >
        <div>
          <GoogleReviewsBadge tone="onDark" showRating size="sm" />
          {text.badge.trim() && (
            <p className="mt-4 inline-block bg-theme-primary px-4 py-1.5 text-sm text-white sm:text-lg">
              <TemplateRichText text={text.badge} accentClassName="font-bold" />
            </p>
          )}
          <h1
            id="city-hero-title"
            className="mt-4 text-[32px] leading-[1.08] font-extrabold text-balance text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.35)] sm:text-5xl xl:text-6xl"
          >
            <TemplateRichText text={text.heading} accentClassName={ACCENT} />
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-snug text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.35)] sm:text-[22px]">
            <TemplateRichText text={text.body} accentClassName={ACCENT} linkClassName="font-semibold underline underline-offset-2" />
          </p>
        </div>

        {text.quote.show && <QuoteCard text={text.quote} />}
      </div>

      {text.stats.length > 0 && (
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] sm:gap-4 lg:mt-10 lg:gap-6">
          {text.stats.map((stat, i) => (
            <li key={i} className="rounded-sm bg-[#0f3a59]/90 px-5 py-4 text-white shadow-lg sm:px-6 sm:py-5 dark:bg-[#0b2b44]/95 dark:ring-1 dark:ring-white/10">
              <p className="text-4xl leading-none font-extrabold sm:text-5xl">
                <TemplateRichText text={stat.value} accentClassName={ACCENT} />
              </p>
              <p className="mt-2 text-sm text-white/90 sm:text-base">
                <TemplateRichText text={stat.label} accentClassName={ACCENT} />
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

const FIELD =
  'mt-1 block h-11 w-full rounded-sm border border-neutral-400 bg-white px-3 text-base text-neutral-900 focus:border-[#0f3a59] focus:ring-2 focus:ring-[#0f3a59]/30 focus:outline-none dark:border-neutral-600 dark:bg-neutral-950 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/30'
const LABEL = 'block text-sm font-semibold text-neutral-800 dark:text-neutral-200'
const TAB =
  'flex min-h-11 cursor-pointer items-center justify-center rounded-sm bg-neutral-100 px-2 text-center text-sm font-semibold text-[#0f3a59] transition-colors hover:bg-neutral-200 has-[:checked]:bg-[#0f3a59] has-[:checked]:text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#0f3a59] sm:text-base dark:bg-neutral-800 dark:text-sky-200 dark:hover:bg-neutral-700 dark:has-[:checked]:bg-sky-700 dark:has-[:checked]:text-white'

/** The sizes a visitor can ask about; "Not sure yet" leaves it to the sales team. */
const SIZES = ['20ft Standard', '40ft Standard', '40ft High Cube', 'Not sure yet'] as const

/**
 * "Get your free quote". The fields are laid out as designed; sending is a
 * later step, so the button does nothing yet and the form has no action
 * (a submit now would put the visitor's phone or email in the page's URL).
 */
function QuoteCard({ text }: { text: AllCityQuoteCardText }) {
  const tabs = [
    { value: 'buy', label: text.buyLabel },
    { value: 'rental', label: text.rentLabel },
    { value: 'rto', label: text.rtoLabel },
  ]
  return (
    <div className="rounded-lg bg-white p-5 text-neutral-900 shadow-xl sm:p-6 dark:bg-neutral-900 dark:text-white dark:ring-1 dark:ring-white/10">
      <h2 className="text-2xl font-bold">{text.heading}</h2>
      <p className="mt-1 text-[15px] text-neutral-700 dark:text-neutral-300">{text.subheading}</p>

      <form className="mt-4" aria-label={text.heading}>
        <fieldset>
          <legend className="sr-only">Buy, rent or rent-to-own</legend>
          <div className="grid grid-cols-3 gap-2">
            {tabs.map((tab, i) => (
              <label key={tab.value} className={TAB}>
                <input type="radio" name="ptype" value={tab.value} defaultChecked={i === 0} className="sr-only" />
                {tab.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label htmlFor="city-quote-zip" className={LABEL}>
              {text.zipLabel}
            </label>
            <input id="city-quote-zip" name="zip" inputMode="numeric" autoComplete="postal-code" maxLength={10} className={FIELD} />
          </div>
          <div>
            <label htmlFor="city-quote-size" className={LABEL}>
              {text.sizeLabel}
            </label>
            <select id="city-quote-size" name="size" defaultValue="" className={FIELD}>
              <option value="" disabled>
                Choose
              </option>
              {SIZES.map((size) => (
                <option key={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        <label htmlFor="city-quote-contact" className={`${LABEL} mt-3`}>
          {text.contactLabel}
        </label>
        <input id="city-quote-contact" name="contact" autoComplete="email" className={FIELD} />

        {/* type="button": not wired yet (see above). */}
        <button
          type="button"
          className="mt-4 block min-h-11 w-full rounded-sm bg-theme-primary px-4 text-base font-bold text-white transition-colors hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary"
        >
          {text.button}
        </button>
        {text.note.trim() && <p className="mt-2 text-center text-xs text-neutral-600 dark:text-neutral-400">{text.note}</p>}
      </form>
    </div>
  )
}
