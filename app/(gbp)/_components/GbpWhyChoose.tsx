import { Banknote, Medal, Repeat, ShieldUser } from 'lucide-react'
import { GBP_WHY_CHOOSE } from '@/lib/data/gbpShared'
import { GBP_CONTAINER } from './gbpStyles'

// WordPress's Font Awesome icons, by the name gbpShared.ts gives them.
const ICONS = { 'user-shield': ShieldUser, medal: Medal, 'money-bill': Banknote, retweet: Repeat } as const

/** The red "Why Choose Us?" band (`#choose`): four white cards. */
export function GbpWhyChoose() {
  return (
    <section id="choose" aria-labelledby="gbp-choose" className="scroll-mt-4 bg-gbp py-10 sm:py-12 dark:bg-[#7a0718]">
      <div className={GBP_CONTAINER}>
        <h2 id="gbp-choose" className="text-center text-2xl font-semibold text-white sm:text-[32px]">
          Why Choose Us?
        </h2>
        <ul className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GBP_WHY_CHOOSE.map((item) => {
            const Icon = ICONS[item.icon]
            return (
              <li key={item.title} className="rounded-md bg-white px-5 py-6 text-center dark:bg-neutral-900">
                <Icon aria-hidden className="mx-auto h-9 w-9 text-gbp dark:text-red-400" />
                <h3 className="mt-3 font-semibold text-black dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-black dark:text-neutral-300">{item.body}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
