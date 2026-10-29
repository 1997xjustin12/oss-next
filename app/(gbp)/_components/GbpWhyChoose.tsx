import { Banknote, Medal, Repeat, ShieldUser } from 'lucide-react'
import { GBP_BG_RED, GBP_CONTAINER, sectionPadding, sectionVars } from './gbpStyles'
import type { GbpSectionStyle, GbpSharedContent } from '@/types/gbp'

// WordPress's Font Awesome icons, by the name the shared content gives them.
const ICONS = { 'user-shield': ShieldUser, medal: Medal, 'money-bill': Banknote, retweet: Repeat } as const

type Props = { content: GbpSharedContent['whyChoose']; style?: GbpSectionStyle }

/** The red "Why Choose Us?" band (`#choose`): four white cards. */
export function GbpWhyChoose({ content, style }: Props) {
  return (
    <section
      id="choose"
      aria-labelledby="gbp-choose"
      className={`scroll-mt-4 ${GBP_BG_RED} ${sectionPadding(style, 'py-10 sm:py-12')}`}
      style={sectionVars(style)}
    >
      <div className={GBP_CONTAINER}>
        <h2
          id="gbp-choose"
          className="text-center text-[30px] font-bold leading-[1.1] text-[var(--gbp-heading,#ffffff)] dark:text-[var(--gbp-heading-dark,#ffffff)]"
        >
          {content.heading}
        </h2>
        <ul className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.items.map((item) => {
            const Icon = ICONS[item.icon]
            return (
              <li key={item.title} className="rounded-md bg-white px-5 py-6 text-center dark:bg-neutral-900">
                <Icon aria-hidden className="mx-auto h-9 w-9 text-[var(--gbp-brand,#C60C29)] dark:text-red-400" />
                <h3 className="mt-4 text-lg font-semibold leading-none text-black dark:text-white">{item.title}</h3>
                <p className="mt-4 text-base font-normal leading-normal text-black dark:text-neutral-300">{item.body}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
