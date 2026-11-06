import { Phone } from 'lucide-react'
import { PROMO_GIVEAWAYS, PROMO_PHONES } from '@/lib/data/specialPromotionsContent'
import { telHref } from '@/lib/helpers'

const TONE = {
  red: { disc: 'bg-theme-primary text-white', amount: 'text-[#FBEE45]' },
  white: {
    disc: 'bg-white text-theme-dark ring-1 ring-theme-border shadow-[0_0_15px_rgba(0,0,0,0.15)] dark:bg-neutral-900 dark:text-white dark:ring-neutral-700',
    amount: 'text-theme-primary dark:text-red-400',
  },
} as const

/**
 * "Exclusive giveaways": WordPress's four round price badges, then the call
 * line. Static, so it stays a Server Component.
 */
export function PromoGiveaways() {
  const { heading, items, call } = PROMO_GIVEAWAYS

  return (
    <section aria-labelledby="promo-giveaways" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <h2 id="promo-giveaways" className="text-center text-2xl font-extrabold text-theme-primary sm:text-4xl dark:text-red-400">
        {heading}
      </h2>
      <ul className="mt-10 grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => {
          const tone = TONE[item.tone]
          return (
            <li
              key={`${item.amount}-${index}`}
              className={`flex aspect-square w-full max-w-72 flex-col items-center justify-center rounded-full p-8 text-center ${tone.disc}`}
            >
              {item.was && <del className="text-lg font-bold text-[#FBEE45]">{item.was}</del>}
              <p className={`text-4xl font-extrabold leading-tight sm:text-5xl ${tone.amount}`}>{item.amount}</p>
              <p className="mt-2 text-base font-medium leading-snug sm:text-lg">{item.note}</p>
            </li>
          )
        })}
      </ul>
      <p className="mt-10 text-center">
        <a
          href={telHref(PROMO_PHONES.main)}
          className="inline-flex min-h-11 items-center gap-2 text-lg font-semibold text-theme-dark underline underline-offset-4 hover:text-theme-primary dark:text-white dark:hover:text-red-400"
        >
          <Phone aria-hidden className="h-5 w-5 shrink-0" />
          {call}
        </a>
      </p>
    </section>
  )
}
