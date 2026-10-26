import Image from 'next/image'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { ArrowRight } from 'lucide-react'

export type ContainerType = {
  /** The heading the card is known by — Buy, Rent, Rent-To-Own. */
  item: string
  /** Artwork. Empty until supplied; the card renders without it rather than broken. */
  image: string
  /** Where the card goes. */
  url: string
  perks: string[]
}

type Props = { type: ContainerType }

/**
 * One option card: artwork, its selling points, and a way through to the
 * listing.
 *
 * The whole card is the link, not just the button. A card that looks clickable
 * and only responds at one 90px target is a card people click and nothing
 * happens. The button is styled as a button but is part of the same anchor, so
 * there is one tab stop and one thing to activate rather than a link wrapping
 * another link — which is invalid markup and unpredictable for a screen reader.
 *
 * Not a Client Component, deliberately, despite the brief asking for one: it
 * renders a link, a picture and a list, with no state, no effect and no
 * handler. `'use client'` would ship JavaScript for a card that never needs
 * any, against the project's own "Server Components by default" rule. Say so
 * if an interaction is coming and it should be one from the start.
 */
export function ContainerTypeCardLink({ type }: Props) {
  const { item, image, url, perks } = type

  return (
    <Link
      href={url}
      // `group` so the button can react to a hover anywhere on the card, which
      // is what makes the whole surface read as one control.
      // Hover as on the WordPress page: the border goes full brand red and a
      // tight shadow lifts the card.
      className="group flex h-full w-full flex-col gap-4 rounded-lg border-2 border-theme-primary/70 bg-white p-4
                 transition-[border-color,box-shadow] duration-300 hover:border-theme-primary hover:shadow-[1px_2px_5px_-1px_rgba(0,0,0,0.49)]
                 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary
                 dark:bg-neutral-900 sm:p-5"
    >
      {/*
        A fixed 16:9 box, whatever the file is.

        The three sources are 330x171, 1224x637 and 342x180 — different sizes
        and slightly different shapes. Sized to their own dimensions they came
        out at three different heights, which pushed each card's perks and
        button to a different line. The wrapper owns the shape, `fill` makes
        the image obey it, and `object-contain` fits the whole picture inside
        without cropping or stretching it.

        Reserved even when there is no image, so a card with artwork and a card
        without are the same height. An empty `src` is still skipped: next/image
        would request the page's own URL and draw a broken frame.
      */}
      <div className="relative w-full overflow-hidden rounded-md aspect-video">
        {image ? (
          <Image
            src={image}
            // The sr-only heading below says "Buy"; repeating it here would
            // make a screen reader announce the same word twice for one card.
            alt=""
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            className="object-contain"
          />
        ) : null}
      </div>

      {/* The card's accessible name, and what the alt text above defers to. */}
      <h3 className="sr-only">{item}</h3>

      <ul className="flex flex-1 flex-col gap-2">
        {perks.map((perk) => (
          <li
            key={perk}
            className="relative pl-5 text-sm font-extrabold leading-snug text-theme-dark dark:text-neutral-100 sm:text-base"
          >
            <span
              className="absolute left-0 top-[0.45em] h-2 w-2 rounded-full bg-theme-primary"
              aria-hidden
            />
            {perk}
          </li>
        ))}
      </ul>

      {/*
        A span, not a button. It is inside an anchor, and a button there is
        invalid markup — the anchor already carries the click, the focus and
        the accessible role.
      */}
      <span
        className="mt-auto inline-flex items-center justify-between gap-3 self-start rounded-sm bg-theme-primary
                   px-4 py-2 text-xs font-bold text-white transition-colors group-hover:bg-theme-primary-dark sm:text-sm"
      >
        See Prices
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
      </span>
    </Link>
  )
}
