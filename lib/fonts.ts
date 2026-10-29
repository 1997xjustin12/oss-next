import { Anton, Roboto } from 'next/font/google'

/**
 * The storefront's faces, preloaded: used by app/(market)/layout.tsx, which
 * puts their variables and `font-sans` on its outer element.
 *
 * The root layout defines the same faces without a preload (for the admin,
 * the maintenance page and portals into <body>); this pair is what lets the
 * storefront keep preloading them while the GBP pages, which use only
 * Poppins, download neither. The variable names match the root layout's, so
 * the storefront's copy takes over inside its layout.
 */
export const storefrontRoboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
})

export const storefrontAnton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton-src',
  display: 'swap',
})
