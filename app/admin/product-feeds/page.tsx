import { Suspense } from 'react';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import { AlertTriangle, CheckCircle2, Loader2, Rss } from 'lucide-react';
import { MERCHANT_FEED_SOURCES } from '@/config/merchantFeeds';
import { isMerchantFeedStorageConfigured, readMerchantFeedStatus, type MerchantFeedStatus } from '@/services/merchantFeed.service';
import { GenerateFeedsButton } from './_components/GenerateFeedsButton';

/**
 * Admin → Product Feeds. The three Google Merchant feeds: when they were last
 * generated, what they hold, and a button to generate them again. See
 * services/merchantFeed.service.ts.
 */

export const metadata: Metadata = { title: 'Product Feeds' };

const CARD =
  'rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900';

const when = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC' : 'Never';

const megabytes = (bytes: number) => `${(bytes / 1_000_000).toFixed(1)} MB`;

export default function ProductFeedsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-xl font-extrabold tracking-tight text-theme-dark dark:text-white">Product Feeds</h1>
        <p className="mt-1 text-sm text-theme-muted dark:text-neutral-400">
          The Google Merchant data sources. Generated from the catalog every day, or whenever you press the button.
        </p>
      </header>

      <Suspense fallback={<div className="h-80 animate-pulse rounded-lg bg-theme-subtle dark:bg-neutral-900" />}>
        <Feeds />
      </Suspense>

      <footer className="mt-8 rounded-lg border border-dashed border-theme-border p-4 text-xs leading-relaxed text-theme-muted dark:border-neutral-700 dark:text-neutral-500">
        <p>
          <strong className="font-semibold">Prices, availability, links and new products</strong> come from the
          catalog on every run. Each existing product keeps the Merchant ID, title, description, image and GTIN it
          had in the WordPress feed, so Google sees the same products.
        </p>
        <p className="mt-2">
          <strong className="font-semibold">If a run fails</strong>, or comes out with far fewer products than the
          last one, nothing is replaced: Merchant keeps getting the last good files.
        </p>
        <p className="mt-2">
          <strong className="font-semibold">The URLs</strong> stay the WordPress ones. They reach these files once
          the domain points at this app; until then WordPress still answers them.
        </p>
      </footer>
    </div>
  );
}

function RunBanner({ status }: { status: MerchantFeedStatus | null }) {
  if (!status) return null;
  if (status.state === 'running') {
    return (
      <p role="status" className="mb-6 flex items-center gap-2 rounded-lg border border-theme-border px-3.5 py-2.5 text-sm font-semibold text-theme-dark dark:border-neutral-700 dark:text-neutral-200">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
        Generating, started {when(status.startedAt)} by {status.by}. This takes a minute or two.
      </p>
    );
  }
  if (status.state === 'failed') {
    return (
      <p role="alert" className="mb-6 flex items-start gap-2 rounded-lg border border-theme-primary/30 bg-theme-primary/5 px-3.5 py-2.5 text-sm font-semibold text-theme-primary dark:text-red-300">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        The last run failed ({when(status.finishedAt)}) and replaced nothing: {status.error}
      </p>
    );
  }
  return (
    <p role="status" className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
      Generated {when(status.finishedAt)} by {status.by}.
    </p>
  );
}

async function Feeds() {
  await connection();
  const configured = isMerchantFeedStorageConfigured();
  const status = await readMerchantFeedStatus().catch((err: unknown) => {
    console.error('[merchant-feeds] status read failed:', err);
    return null;
  });

  return (
    <>
      {!configured && (
        <p role="alert" className="mb-6 flex items-start gap-2 rounded-lg border border-theme-primary/30 bg-theme-primary/5 px-3.5 py-2.5 text-sm font-semibold text-theme-primary dark:text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Vercel Blob is not connected, so feeds can&rsquo;t be generated here. Create a public Blob store on the Vercel project, then redeploy.
        </p>
      )}
      <RunBanner status={status} />

      <section className={CARD}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
            <Rss className="h-4 w-4 text-theme-primary" aria-hidden />
            Data Sources
          </h2>
          <GenerateFeedsButton disabled={!configured} running={status?.state === 'running'} />
        </div>
        <p className="mt-2 text-xs text-theme-muted dark:text-neutral-400">
          Last good run: {when(status?.lastSuccessAt)}
        </p>

        <ul className="mt-3 divide-y divide-theme-border dark:divide-neutral-800">
          {MERCHANT_FEED_SOURCES.map(({ source, label, path }) => {
            const file = status?.files?.[source];
            const skipped = file ? Object.entries(file.skipped) : [];
            return (
              <li key={source} className="py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-bold text-theme-dark dark:text-neutral-100">{label}</h3>
                  <span className="text-sm text-theme-dark dark:text-neutral-200">
                    {file ? `${file.items.toLocaleString('en-US')} products · ${megabytes(file.bytes)}` : 'Not generated yet'}
                  </span>
                </div>
                <p className="mt-1 break-all font-mono text-xs text-theme-muted dark:text-neutral-400">{path}</p>
                {file && (
                  <p className="mt-1 text-xs text-theme-muted dark:text-neutral-400">
                    {file.added.toLocaleString('en-US')} new since WordPress · {file.titlesRepaired.toLocaleString('en-US')} titles with the city filled in
                    {skipped.length > 0 && ` · left out: ${skipped.map(([reason, count]) => `${count} ${reason}`).join(', ')}`}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
