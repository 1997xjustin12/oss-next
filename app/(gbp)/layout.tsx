import { Poppins } from 'next/font/google'
import Script from 'next/script'
import { GBP_SCRIPTS } from '@/lib/data/gbpShared'

// The GBP pages' face (WordPress uses Poppins throughout, 300 to 800). Loaded
// here only, so the storefront never downloads it, and applied with next/font's
// own class rather than a theme token, so it can't go missing with a stylesheet.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

/**
 * The GBP location pages (one per Google Business Profile listing): their own
 * header and footer, not the storefront's. Each page renders its header and
 * footer itself, since both carry the page's own phone number.
 *
 * Excluded from the site-wide width rule (AGENTS.md §14): these pages follow
 * the WordPress originals, content boxed at 1400px.
 * Reference: docs/reference/gbp-subdomain-pages.md
 */
export default function GbpLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { zohoSalesIq } = GBP_SCRIPTS
  return (
    <div className={`${poppins.className} flex min-h-screen flex-col bg-white text-base text-black dark:bg-neutral-950 dark:text-neutral-100`}>
      {children}
      {/* Zoho SalesIQ chat, as on WordPress. After load: it is a bubble in the
          corner, not something the first paint needs. */}
      <Script id="zsiqchat" strategy="lazyOnload">
        {`var $zoho=$zoho||{};$zoho.salesiq=$zoho.salesiq||{widgetcode:${JSON.stringify(zohoSalesIq.widgetCode)},values:{},ready:function(){}};var d=document,s=d.createElement("script");s.type="text/javascript";s.id="zsiqscript";s.defer=true;s.src=${JSON.stringify(zohoSalesIq.src)};d.body.appendChild(s);`}
      </Script>
    </div>
  )
}
