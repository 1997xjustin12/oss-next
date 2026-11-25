import type { Metadata } from 'next';
import { Download, Info, Link2 } from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/admin';
import { ROUTES } from '@/config/routes';
import { OPENAI_FEED_ORIGIN } from '@/lib/openaiFeed';

/**
 * Admin → Product Feeds. The catalog for ChatGPT shopping.
 *
 * OpenAI's merchant portal rejects the Google feed (/api/feeds/google.xml):
 * it takes .parquet, .jsonl.gz, .csv.gz, .tsv.gz or plain .csv/.tsv, never
 * XML. This page gives the same catalog as a Parquet file in OpenAI's field
 * format (lib/openaiFeed.ts), both as a hosted URL and as a download.
 */

export const metadata: Metadata = { title: 'Product Feeds' };

const CARD =
  'rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900';

const FEED_URL = `${OPENAI_FEED_ORIGIN}${ROUTES.FEED_CHATGPT}`;

export default function ProductFeedsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-xl font-extrabold tracking-tight text-theme-dark dark:text-white">Product Feeds</h1>
        <p className="mt-1 text-sm text-theme-muted dark:text-neutral-400">
          The product catalog for ChatGPT shopping (OpenAI&apos;s merchant portal), which can&apos;t read the
          Google Merchant feed&apos;s XML.
        </p>
      </header>

      <section className={CARD} aria-labelledby="chatgpt-feed">
        <h2 id="chatgpt-feed" className="text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
          ChatGPT product feed (.parquet)
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-theme-muted dark:text-neutral-400">
          Every product: purchase, rental and rent-to-own listings. Refreshed from the catalog at most hourly.
        </p>

        <h3 className="mt-4 flex items-center gap-1.5 text-xs font-bold text-theme-dark dark:text-neutral-200">
          <Link2 className="h-3.5 w-3.5" aria-hidden />
          Hosted URL (recommended: ChatGPT keeps itself up to date)
        </h3>
        <p className="mt-1 text-xs text-theme-muted dark:text-neutral-400">
          In OpenAI&apos;s merchant portal, choose &ldquo;Use a hosted URL&rdquo; and paste:
        </p>
        <input
          readOnly
          value={FEED_URL}
          aria-label="ChatGPT product feed URL"
          className="mt-2 w-full rounded-md border border-theme-border bg-white px-3 py-2 font-mono text-xs text-theme-dark dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        />

        <h3 className="mt-5 flex items-center gap-1.5 text-xs font-bold text-theme-dark dark:text-neutral-200">
          <Download className="h-3.5 w-3.5" aria-hidden />
          Or download the file for a manual upload
        </h3>
        <p className="mt-1 text-xs text-theme-muted dark:text-neutral-400">
          A snapshot: ChatGPT keeps its prices and stock until you upload a newer file.
        </p>
        {/* Plain <a download>, not <Link>: a file from a Route Handler, not a
            page navigation, so there is nothing for the router to prefetch. */}
        <a
          href={ADMIN_ROUTES.PRODUCT_FEED_CHATGPT_DOWNLOAD}
          download
          className="mt-3 inline-flex items-center gap-2 rounded-md bg-theme-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary"
        >
          <Download className="h-4 w-4" aria-hidden />
          Download .parquet
        </a>
      </section>

      <section className={`${CARD} mt-6`} aria-labelledby="feed-notes">
        <h2 id="feed-notes" className="text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
          Good to know
        </h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-theme-muted dark:text-neutral-400">
          <li>
            The first request after a deploy or a cache purge builds the file, which can take a minute or more. If
            it fails, wait a minute and try again.
          </li>
          <li>
            Rental and rent-to-own listings carry their monthly payment as the price, because OpenAI&apos;s format
            has no &ldquo;per month&rdquo; field. Their titles end &ldquo;(monthly)&rdquo; and their descriptions
            state the monthly price and the full-term total.
          </li>
          <li>Products, prices, conditions and stock match the Google Merchant feed and the product pages.</li>
          <li>Listed for search only, not ChatGPT Instant Checkout, which needs a separate integration.</li>
        </ul>
        <p className="mt-3 flex gap-2 text-xs text-theme-muted dark:text-neutral-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Spec: developers.openai.com/commerce/specs/feed
        </p>
      </section>
    </div>
  );
}
