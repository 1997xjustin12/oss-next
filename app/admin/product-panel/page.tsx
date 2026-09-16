import { Suspense } from 'react';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import { CheckCircle2, LayoutPanelTop, Rows3 } from 'lucide-react';
import { setProductPanelVersionAction } from '@/actions/productPanel';
import { readProductPanelV2Flag } from '@/lib/productPanel';

/**
 * Admin → Product Panel. Which version of the product page's info panel renders.
 *
 * ## Why this screen exists
 *
 * The Selected Container Summary on a product page currently lists Distance,
 * Delivery and Sales tax alongside the container's own details. Version 2 drops
 * those three rows, leaving the summary to describe the container and the
 * ordering block below it to carry the delivery estimate. Which one sells
 * better is a question about customers, not code, so it is a switch rather than
 * a deploy — flip it, watch, flip it back.
 *
 * Two fixed versions rather than per-row checkboxes: the rows were removed
 * together because they are one idea ("what this will cost to get here"), and a
 * screen offering eight combinations would invite six nobody designed.
 */

export const metadata: Metadata = { title: 'Product Panel' };

type Props = {
  searchParams: Promise<{ saved?: string }>;
};

const CARD =
  'rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900';

const OPTIONS = [
  {
    version: 'default' as const,
    label: 'Default — full summary',
    rows: ['Unit', 'Condition', 'Unit price', 'Distance', 'Delivery', 'Sales tax'],
    description:
      'The summary customers see today. It answers what delivery costs and where the container ships from without anyone having to reach checkout to find out.',
  },
  {
    version: 'v2' as const,
    label: 'Version 2 — container details only',
    rows: ['Unit', 'Condition', 'Unit price'],
    description:
      'Drops the Distance, Delivery and Sales tax rows. The summary describes the container, and the price block below still shows the delivery estimate — so nothing is hidden, it is said once instead of twice.',
  },
];

export default function ProductPanelSettingsPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-xl font-extrabold tracking-tight text-theme-dark dark:text-white">
          Product Panel
        </h1>
        <p className="mt-1 text-sm text-theme-muted dark:text-neutral-400">
          Which rows the Selected Container Summary shows on every container product page.
        </p>
      </header>

      {/* Reading the stored setting is request-time work, so it streams in
          behind its own boundary, as on the other admin screens that read
          Redis. Without one, cacheComponents reports uncached data on every
          render and navigation. */}
      <Suspense
        fallback={
          <div className="h-72 animate-pulse rounded-lg bg-theme-subtle dark:bg-neutral-900" />
        }
      >
        <VersionChoice searchParams={searchParams} />
      </Suspense>

      <footer className="mt-8 rounded-lg border border-dashed border-theme-border p-4 text-xs leading-relaxed text-theme-muted dark:border-neutral-700 dark:text-neutral-500">
        <p>
          <strong className="font-semibold">Applies immediately.</strong> Switching clears the
          cached setting, so the next visitor to open a product page sees the version you picked —
          no deploy, no waiting.
        </p>
        <p className="mt-2">
          <strong className="font-semibold">If this setting cannot be read</strong> — Redis
          unreachable, say — product pages fall back to the default panel rather than failing.
        </p>
      </footer>
    </div>
  );
}

async function VersionChoice({ searchParams }: Props) {
  await connection();
  const [{ saved }, v2] = await Promise.all([searchParams, readProductPanelV2Flag()]);

  return (
    <>
      {saved && (
        <p
          role="status"
          className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          Saved. Product pages are now rendering the {saved === 'v2' ? 'Version 2' : 'default'}{' '}
          panel.
        </p>
      )}

      <section className={CARD}>
        <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
          <LayoutPanelTop className="h-4 w-4 text-theme-primary" aria-hidden />
          Summary version
        </h2>

        <ul className="mt-4 space-y-3">
          {OPTIONS.map((option) => {
            const active = (option.version === 'v2') === v2;

            return (
              <li
                key={option.version}
                className={[
                  'rounded-md border p-4 transition-colors',
                  active
                    ? 'border-theme-primary bg-theme-primary/5 dark:bg-theme-primary/10'
                    : 'border-theme-border dark:border-neutral-700',
                ].join(' ')}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="flex flex-wrap items-center gap-2 text-sm font-bold text-theme-dark dark:text-neutral-100">
                      {option.label}
                      {active && (
                        <span className="rounded-full bg-theme-primary px-2 py-0.5 text-[11px] font-bold text-white">
                          Current
                        </span>
                      )}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-theme-muted dark:text-neutral-400">
                      {option.description}
                    </p>
                    {/* The rows spelled out, so nobody has to open a product
                        page in another tab to see what they are choosing. */}
                    <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-theme-muted/80 dark:text-neutral-500">
                      <Rows3 className="h-3 w-3 shrink-0" aria-hidden />
                      {option.rows.join(' · ')}
                    </p>
                  </div>

                  {!active && (
                    <form action={setProductPanelVersionAction} className="shrink-0">
                      <input type="hidden" name="version" value={option.version} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-md bg-theme-primary px-3.5 py-2 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
                      >
                        Switch to this
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
