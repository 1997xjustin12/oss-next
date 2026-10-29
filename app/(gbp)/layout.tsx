import { Poppins } from 'next/font/google'

// The GBP pages' face (WordPress uses Poppins throughout; 300 to 700 are the weights these pages use). Loaded
// here only, so the storefront never downloads it, and applied with next/font's
// own class rather than a theme token, so it can't go missing with a stylesheet.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

/**
 * The GBP location pages (one per Google Business Profile listing): their own
 * header and footer, not the storefront's. Each page renders its header and
 * footer itself, since both carry the page's own phone number.
 *
 * No chat widget: WordPress loads Zoho SalesIQ ("Everyone Qualifies!"), which
 * these pages deliberately leave out (decided 2026-10-29).
 *
 * Excluded from the site-wide width rule (AGENTS.md §14): these pages follow
 * the WordPress originals, content boxed at 1400px.
 * Reference: docs/reference/gbp-subdomain-pages.md
 */
export default function GbpLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`${poppins.className} flex min-h-screen flex-col bg-white text-base text-black dark:bg-neutral-950 dark:text-neutral-100`}>
      {children}
    </div>
  )
}
