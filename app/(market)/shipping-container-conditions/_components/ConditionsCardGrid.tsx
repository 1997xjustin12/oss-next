import Image from 'next/image'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import type { ConditionsCard } from '@/lib/data/containerConditionsContent'
import { ConditionsRichText } from './ConditionsRichText'

type Props = {
  cards: readonly ConditionsCard[]
  /** Grid columns from lg up: three conditions, four grades. */
  columns: 3 | 4
  label: string
}

const COLUMNS = { 3: 'lg:grid-cols-3', 4: 'md:grid-cols-2 xl:grid-cols-4' } as const

/** The conditions (One Trip, Used, Refurbished) and the grades (IICL, WWT, CW, As Is): photo, linked title, copy. */
export function ConditionsCardGrid({ cards, columns, label }: Props) {
  return (
    <section aria-label={label} className="bg-theme-subtle px-[5%] py-12 sm:py-16 dark:bg-neutral-900">
      <ul className={`grid gap-6 ${COLUMNS[columns]}`}>
        {cards.map((card) => (
          <li key={card.title}>
            <article className="flex h-full flex-col overflow-hidden rounded-xl border border-theme-border bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
              <div className="relative aspect-4/3 bg-theme-subtle dark:bg-neutral-800">
                <Image
                  src={card.image.src}
                  alt={card.image.alt}
                  fill
                  sizes={columns === 3 ? '(max-width: 1024px) 90vw, 30vw' : '(max-width: 768px) 90vw, (max-width: 1280px) 45vw, 22vw'}
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                <h3 className="text-xl font-extrabold tracking-wide text-theme-dark dark:text-white">
                  <Link href={card.href} className="hover:text-theme-primary dark:hover:text-red-400">
                    {card.title}
                  </Link>
                </h3>
                {card.paragraphs.map((segments, i) => (
                  <ConditionsRichText key={i} segments={segments} className="text-[15px] leading-relaxed text-theme-mid dark:text-neutral-300" />
                ))}
                {card.list && (
                  <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-theme-mid marker:text-theme-primary dark:text-neutral-300">
                    {card.list.map((item) => (
                      <li key={item.label}>
                        <strong className="font-bold text-theme-dark dark:text-white">{item.label}</strong> – {item.body}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
