'use client'

import { useId, useState } from 'react'
import { ArrowLeftRight, BadgeCheck, BookOpen, CalendarClock, Container, DollarSign, KeyRound, Truck, type LucideIcon } from 'lucide-react'
import { PlpLink } from '@/components/shared/PlpLink'
import { TemplateRichText } from '@/components/shared/TemplateRichText'
import { OFFER_TABS, type OfferFeatureIcon, type OfferTab } from '@/lib/data/homeOfferTabs'

const ICONS: Record<OfferFeatureIcon, LucideIcon> = {
  price: DollarSign,
  sizes: ArrowLeftRight,
  conditions: Container,
  guides: BookOpen,
  terms: CalendarClock,
  delivery: Truck,
  ownership: KeyRound,
  approval: BadgeCheck,
}

/** Each tab's price colour when it is not the open one (4.5:1 on white and on the dark card). */
const PRICE_COLOR: Record<OfferTab['id'], string> = {
  buy: 'text-[#0f3a59] dark:text-sky-300',
  rent: 'text-[#0f3a59] dark:text-sky-300',
  rto: 'text-green-700 dark:text-emerald-400',
}

/*
 * One set of elements, laid out two ways by `order` (no duplicated content):
 *   phone: the open tab first, its panel under it, then the other tabs;
 *   desktop: the three tabs in a row (in their own order), the panel below.
 * Literal class names so Tailwind sees every one.
 */
const PHONE_ORDER_CLOSED = ['order-3', 'order-4', 'order-5'] as const
const DESKTOP_TAB_ORDER = ['lg:order-1', 'lg:order-2', 'lg:order-3'] as const

const BODY_LINK = 'font-semibold text-theme-dark underline underline-offset-2 hover:text-theme-primary dark:text-white dark:hover:text-red-400'

/**
 * The homepage's Buy / Rent / Rent-To-Own section, under the hero on every
 * version of the homepage (copy in lib/data/homeOfferTabs.ts). Tabs on desktop,
 * an accordion on a phone: each tab is a disclosure button for its panel, so
 * the same markup is accessible both ways. Every panel is in the HTML; only
 * the open one shows.
 */
export function OfferTabs() {
  const [openId, setOpenId] = useState<OfferTab['id']>('buy')
  const baseId = useId()
  const openIndex = OFFER_TABS.findIndex((tab) => tab.id === openId)

  return (
    <section aria-label="Buy, rent or rent-to-own a shipping container" className="bg-white px-[5%] py-10 sm:py-14 dark:bg-neutral-950">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-8">
        {OFFER_TABS.map((tab, i) => {
          const open = tab.id === openId
          // Closed tabs keep their own order among themselves, after the open one's panel.
          const closedRank = i < openIndex ? i : i - 1
          return (
            <button
              key={tab.id}
              type="button"
              id={`${baseId}-tab-${tab.id}`}
              aria-expanded={open}
              aria-controls={`${baseId}-panel-${tab.id}`}
              onClick={(event) => {
                setOpenId(tab.id)
                // On a phone the opened tab moves to the top of the section: follow it there.
                const button = event.currentTarget
                if (!window.matchMedia('(min-width: 1024px)').matches) {
                  requestAnimationFrame(() => button.scrollIntoView({ block: 'start', behavior: 'smooth' }))
                }
              }}
              className={`${open ? 'order-1' : PHONE_ORDER_CLOSED[closedRank]} ${DESKTOP_TAB_ORDER[i]} scroll-mt-24 rounded-md px-5 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary sm:px-8 sm:py-4 ${
                open
                  ? 'bg-[#0f3a59] text-white shadow-lg ring-1 ring-black/40'
                  : 'border border-theme-border bg-white text-neutral-700 shadow-md hover:border-[#0f3a59] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-sky-400'
              }`}
            >
              <span className="block text-[22px] leading-tight font-bold sm:text-[28px]">{tab.label}</span>
              <span className="mt-0.5 block text-sm font-semibold sm:text-lg">
                <span className={open ? 'text-[#F4BF3C]' : PRICE_COLOR[tab.id]}>{tab.price}</span>
                <span className={open ? 'text-[#F4BF3C]' : 'font-normal text-neutral-500 dark:text-neutral-400'}> &middot; {tab.note}</span>
              </span>
            </button>
          )
        })}

        {OFFER_TABS.map((tab) => (
          <div
            key={tab.id}
            id={`${baseId}-panel-${tab.id}`}
            role="region"
            aria-labelledby={`${baseId}-tab-${tab.id}`}
            hidden={tab.id !== openId}
            className="order-2 lg:order-4 lg:col-span-3"
          >
            <OfferPanel tab={tab} />
          </div>
        ))}
      </div>
    </section>
  )
}

function OfferPanel({ tab }: { tab: OfferTab }) {
  const paragraphs = tab.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className="grid grid-cols-1 gap-6 pt-2 lg:grid-cols-[1fr_20rem] lg:gap-x-16 lg:gap-y-8 lg:px-10 lg:pt-0">
      <div className="order-1">
        <h2 className="text-2xl font-bold text-theme-primary sm:text-3xl dark:text-red-400">{tab.heading}</h2>
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-neutral-700 sm:mt-6 sm:text-base dark:text-neutral-300">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>
              <TemplateRichText text={paragraph} linkClassName={BODY_LINK} />
            </p>
          ))}
        </div>
      </div>

      {/* After the features on a phone (its mockup), beside the text on desktop. */}
      <aside aria-label={`${tab.card.lead} ${tab.card.price}`} className="order-3 self-center rounded-lg bg-[#0f3a59] text-center text-white shadow-lg lg:order-2">
        <div className="px-6 pt-6 pb-5">
          <p className="text-base">{tab.card.lead}</p>
          <p className="mt-1 text-5xl leading-none font-bold sm:text-6xl">{tab.card.price}</p>
          <p className="mt-4 text-base">{tab.card.caption}</p>
        </div>
        <div className="border-t border-white/25 px-5 py-4">
          <PlpLink
            prefetch={false}
            href={tab.card.href}
            className="block rounded bg-theme-primary px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-theme-primary-dark"
          >
            {tab.card.button}
          </PlpLink>
        </div>
      </aside>

      {/* Column by column from sm, so a phone's list order reads down the desktop grid's columns (the mockups). */}
      <ul className="order-2 grid grid-cols-1 gap-4 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-2 lg:order-3 lg:col-span-2 lg:gap-x-8">
        {tab.features.map((feature) => {
          const Icon = ICONS[feature.icon]
          return (
            <li key={feature.title} className="flex items-center gap-4 rounded-md bg-[#dbe7f1] p-4 shadow-md sm:gap-6 sm:px-5 dark:bg-neutral-900 dark:ring-1 dark:ring-neutral-800">
              <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#b9d7ea] text-[#0f3a59] sm:h-18 sm:w-18 dark:bg-sky-950 dark:text-sky-300">
                <Icon className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={1.5} />
              </span>
              <div>
                <h3 className="text-[15px] font-semibold text-theme-dark sm:text-lg dark:text-white">{feature.title}</h3>
                <p className="mt-0.5 text-[13px] leading-snug text-neutral-700 sm:text-base dark:text-neutral-300">{feature.text}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
