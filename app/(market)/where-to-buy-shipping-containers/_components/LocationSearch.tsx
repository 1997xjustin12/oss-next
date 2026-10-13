'use client'

import { CircleArrowRight, LocateFixed } from 'lucide-react'

/**
 * The depot finder's input — layout only for now.
 *
 * A Client Component because of what it is about to become: a controlled
 * input with address autocomplete and a geolocation call, none of which a
 * Server Component can hold. It has no state yet, so nothing here is wasted on
 * the client beyond the component shell.
 *
 * Deliberately NOT wired up. Submitting does nothing, and the geolocation
 * button does nothing — the shapes are here to be agreed before the behaviour
 * is built.
 *
 * It is a real `<form>` rather than a div with a button. Browsers already know
 * that Enter in a text field submits the form it belongs to, and a screen
 * reader announces a search landmark; rebuilding both on a click handler is
 * work that buys nothing back.
 */
export function LocationSearch() {
  return (
    <div className="w-full max-w-md">
      <form
        role="search"
        aria-label="Find shipping containers near a location"
        // No behaviour yet, so the default page reload is suppressed rather
        // than left to fire and clear the field.
        onSubmit={(e) => e.preventDefault()}
        className="flex w-full items-stretch overflow-hidden rounded-md bg-white shadow-lg dark:bg-neutral-100"
      >
        {/*
          A label, not a placeholder standing in for one. Placeholder text
          disappears the moment someone types, which leaves anyone who looks
          away mid-entry — and every screen reader — with an unlabelled box.
        */}
        <label htmlFor="depot-location" className="sr-only">
          City, state or ZIP code
        </label>

        <input
          id="depot-location"
          name="location"
          type="text"
          autoComplete="postal-code"
          placeholder="New York, NY 10001, USA"
          className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm text-theme-dark
                     placeholder:text-theme-muted focus:outline-none sm:text-base"
        />

        <button
          type="submit"
          // The icon is the whole control, so the name has to come from
          // somewhere a pointer user never sees.
          aria-label="Search this location"
          className="flex shrink-0 items-center justify-center bg-theme-primary px-4 text-white
                     transition-colors hover:bg-theme-primary-dark
                     focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
        >
          <CircleArrowRight className="h-6 w-6" aria-hidden />
        </button>
      </form>

      {/*
        Centred under the input, as in the design. The hero's own content is
        left-aligned; this sits inside that left-aligned block, so centring it
        here is a property of the component rather than of the hero.
      */}
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-white/70 px-4 py-2
                     text-xs font-semibold text-white backdrop-blur-[2px]
                     transition-colors hover:border-white hover:bg-white/10
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white
                     sm:text-sm"
        >
          <LocateFixed className="h-4 w-4 shrink-0" aria-hidden />
          Use my current location
        </button>
      </div>
    </div>
  )
}
