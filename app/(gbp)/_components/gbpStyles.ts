/**
 * Shared class strings for the GBP template.
 *
 * The content box: 1400px, centred, as WordPress's Elementor container. These
 * pages are exempt from the site-wide `px-[5%]` rule (AGENTS.md §14).
 */
export const GBP_CONTAINER = 'mx-auto w-full max-w-[1400px] px-4 sm:px-6'

/*
 * Colours and type are hex and px values written into each class, measured
 * from the WordPress pages (Elementor: 30px headings, 24px on phones; tablet
 * matches desktop). Not theme tokens in globals.css: these pages carry their
 * own styling, so a stale or shared stylesheet can't drop it.
 */

/** An accented heading run. WordPress writes it as `color: red`, pure #FF0000. */
export const GBP_ACCENT = 'text-[#FF0000] dark:text-red-400'

/** Section heading: 30px bold (24px on phones), centred. */
export const GBP_H2 = 'text-center text-2xl font-bold leading-[1.1] text-black md:text-[30px] dark:text-white'

/** The red button's colours (the call buttons, Request a Quote, Submit). */
export const GBP_BUTTON =
  'bg-[#C60C29] text-white transition-colors hover:bg-[#a30a22] focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-[#C60C29] dark:focus-visible:outline-white'
