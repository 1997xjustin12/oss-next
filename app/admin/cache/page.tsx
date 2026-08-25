import type { Metadata } from 'next';
import { CheckCircle2, DatabaseZap, Trash2 } from 'lucide-react';
import { purgeCacheAction } from '@/actions/cache';
import { CACHE_TAGS, PURGEABLE_CACHE_TAGS } from '@/config/cache';

/**
 * Admin → Cache. Purge what the storefront has cached.
 *
 * ## Why this screen exists
 *
 * Cached pages are served in tens of milliseconds; the same page uncached costs
 * up to two seconds, because it has to go to the backend or Elasticsearch. So
 * the cache lifetimes are deliberately long — content pages are kept for a
 * week. That is only a sane setting if there is a way to flush it the moment
 * someone edits something, which is what this page is.
 *
 * Without this screen the choice would be between short lifetimes (slow site)
 * and stale content with no remedy short of a redeploy.
 */

export const metadata: Metadata = { title: 'Cache' };

type Props = {
  searchParams: Promise<{ purged?: string }>;
};

const CARD =
  'rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900';

export default async function CachePage({ searchParams }: Props) {
  const { purged } = await searchParams;

  const purgedLabel =
    purged === CACHE_TAGS.ALL
      ? 'Everything'
      : PURGEABLE_CACHE_TAGS.find((entry) => entry.tag === purged)?.label;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-xl font-extrabold tracking-tight text-theme-dark dark:text-white">Cache</h1>
        <p className="mt-1 text-sm text-theme-muted dark:text-neutral-400">
          Pages are cached so they load in milliseconds instead of seconds. Purge here after editing
          content so the change appears immediately rather than when the cache next refreshes.
        </p>
      </header>

      {purgedLabel && (
        <p
          role="status"
          className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          {purgedLabel} purged. The next visit to an affected page rebuilds it from source.
        </p>
      )}

      {/* Purge everything, kept visually distinct from the per-area buttons —
          it is the one that makes the whole site slow for a moment. */}
      <section className={`${CARD} mb-6 border-theme-primary/40`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
              <DatabaseZap className="h-4 w-4 text-theme-primary" aria-hidden />
              Purge everything
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-theme-muted dark:text-neutral-400">
              Clears every cached page, product, listing and article at once. The next visitor to each
              page waits for it to be rebuilt, so the site is briefly slower — use this after a bulk
              import or a deploy that changed content, and prefer a single area below otherwise.
            </p>
          </div>

          <form action={purgeCacheAction} className="shrink-0">
            <input type="hidden" name="tag" value={CACHE_TAGS.ALL} />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md bg-theme-primary px-3.5 py-2 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Purge all
            </button>
          </form>
        </div>
      </section>

      <h2 className="mb-3 text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
        Or purge one area
      </h2>

      <ul className="space-y-3">
        {PURGEABLE_CACHE_TAGS.map((entry) => (
          <li key={entry.tag} className={CARD}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-theme-dark dark:text-neutral-100">{entry.label}</h3>
                <p className="mt-1 text-xs leading-relaxed text-theme-muted dark:text-neutral-400">
                  {entry.description}
                </p>
                <p className="mt-1.5 font-mono text-[11px] text-theme-muted/80 dark:text-neutral-500">
                  {entry.tag} · {entry.lifetime}
                </p>
              </div>

              <form action={purgeCacheAction} className="shrink-0">
                <input type="hidden" name="tag" value={entry.tag} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-md border border-theme-border px-3 py-1.5 text-xs font-bold text-theme-dark transition-colors hover:border-theme-primary hover:text-theme-primary dark:border-neutral-700 dark:text-neutral-200 dark:hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Purge
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>

      <footer className="mt-8 rounded-lg border border-dashed border-theme-border p-4 text-xs leading-relaxed text-theme-muted dark:border-neutral-700 dark:text-neutral-500">
        <p className="font-semibold text-theme-dark dark:text-neutral-300">Purging from outside the admin</p>
        <p className="mt-1">
          <code className="font-mono">POST /api/revalidate</code> with an{' '}
          <code className="font-mono">x-revalidate-token</code> header does the same thing for webhooks
          and deploy scripts — send <code className="font-mono">{'{"tag":"products"}'}</code> for one
          area, or an empty body for everything.
        </p>
      </footer>
    </div>
  );
}
