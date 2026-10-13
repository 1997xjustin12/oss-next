import { ContainerTypeCardLink } from './ContainerTypeCardLink'
import type { ContainerType } from './ContainerTypeCardLink'

type Props = {
  types: ContainerType[]
  heading?: string
}

/**
 * The three ways to get a container, side by side.
 *
 * Takes its options as a prop rather than importing them, so the band can be
 * pointed at a different set — two options, or a seasonal fourth — without
 * being edited.
 *
 * One column on a phone, three from `sm` up. `items-stretch` with `h-full` on
 * the cards keeps the buttons on one line across all three, which they would
 * not be otherwise: the perk lists differ in length, and a card sized to its
 * own content leaves its button floating higher than its neighbours'.
 */
export function SelectContainerType({ types, heading = 'Select An Option Below' }: Props) {
  return (
    <section aria-labelledby="select-container-type" className="w-full px-4 py-10 sm:px-6 sm:py-12">
      <h2
        id="select-container-type"
        className="mb-6 text-center text-lg font-bold text-theme-dark dark:text-neutral-100 sm:mb-8 sm:text-xl"
      >
        {heading}
      </h2>

      {/*
        `auto-rows-fr` is what makes the cards the same height on a phone too.
        Across three columns `items-stretch` is enough, because they share one
        row. Stacked in a single column each card is its own row, and rows size
        to their own content — so the one with the longest perk came out taller
        until the rows were made equal.
      */}
      <ul className="container mx-auto grid auto-rows-fr grid-cols-1 items-stretch gap-5 sm:grid-cols-3 sm:gap-6">
        {types.map((type) => (
          <li key={type.item} className="flex">
            <ContainerTypeCardLink type={type} />
          </li>
        ))}
      </ul>
    </section>
  )
}
