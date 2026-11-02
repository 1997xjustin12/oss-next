import { Suspense } from 'react';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import { AlertTriangle, CheckCircle2, EyeOff, Headset, Plus } from 'lucide-react';
import { setSalesIqPathAction } from '@/actions/salesIq';
import { readSalesIqExcludedPaths } from '@/lib/salesIq';

/**
 * Admin → Live Chat. The storefront pages that leave out the Zoho SalesIQ chat.
 * See lib/salesIq.ts.
 */

export const metadata: Metadata = { title: 'Live Chat' };

type Props = {
  searchParams: Promise<{ saved?: string; excluded?: string; error?: string }>;
};

const CARD =
  'rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900';

const ERRORS: Record<string, string> = {
  path: 'That does not look like a page path. Enter it like /blogs.',
  save: 'The change could not be saved (Redis did not answer). Nothing changed; try again.',
};

export default function LiveChatPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-xl font-extrabold tracking-tight text-theme-dark dark:text-white">Live Chat</h1>
        <p className="mt-1 text-sm text-theme-muted dark:text-neutral-400">
          The Zoho SalesIQ chat bubble shows on every storefront page except the ones listed here.
        </p>
      </header>

      <Suspense fallback={<div className="h-80 animate-pulse rounded-lg bg-theme-subtle dark:bg-neutral-900" />}>
        <ExcludedPages searchParams={searchParams} />
      </Suspense>

      <footer className="mt-8 rounded-lg border border-dashed border-theme-border p-4 text-xs leading-relaxed text-theme-muted dark:border-neutral-700 dark:text-neutral-500">
        <p>
          <strong className="font-semibold">A listed path covers everything beneath it:</strong> /blogs also hides
          the chat on every article. To hide it on one article only, list that article&rsquo;s own path.
        </p>
        <p className="mt-2">
          <strong className="font-semibold">Applies</strong> within a minute or so. Someone already on the site gets
          the change when they next load a page in full.
        </p>
        <p className="mt-2">
          <strong className="font-semibold">Shared:</strong> production and staging read this same list.
        </p>
        <p className="mt-2">
          <strong className="font-semibold">If this list cannot be read</strong>, the chat stays off the cart and
          checkout, and shows everywhere else.
        </p>
      </footer>
    </div>
  );
}

async function ExcludedPages({ searchParams }: Props) {
  await connection();
  const [{ saved, excluded, error }, list] = await Promise.all([searchParams, readSalesIqExcludedPaths()]);

  return (
    <>
      {saved && (
        <p
          role="status"
          className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          Saved. The chat is now {excluded === '1' ? 'hidden on' : 'back on'} {saved}.
        </p>
      )}
      {(error || list.error) && (
        <p
          role="alert"
          className="mb-6 flex items-start gap-2 rounded-lg border border-theme-primary/30 bg-theme-primary/5 px-3.5 py-2.5 text-sm font-semibold text-theme-primary dark:text-red-300"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error
            ? (ERRORS[error] ?? 'Something went wrong. Try again.')
            : 'The list could not be read, so the default pages are shown and used until it can be.'}
        </p>
      )}

      <section className={CARD}>
        <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
          <EyeOff className="h-4 w-4 text-theme-primary" aria-hidden />
          Chat Hidden On
        </h2>
        {list.paths.length === 0 ? (
          <p className="mt-3 text-sm text-theme-muted dark:text-neutral-400">
            No pages. The chat shows on the whole storefront.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-theme-border dark:divide-neutral-800">
            {list.paths.map((path) => (
              <li key={path} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <span className="break-all font-mono text-sm text-theme-dark dark:text-neutral-100">{path}</span>
                <form action={setSalesIqPathAction} className="shrink-0">
                  <input type="hidden" name="path" value={path} />
                  <input type="hidden" name="excluded" value="off" />
                  <button
                    type="submit"
                    aria-label={`Show the chat on ${path}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-theme-border px-3 py-1.5 text-xs font-bold text-theme-dark transition-colors hover:border-theme-primary hover:text-theme-primary dark:border-neutral-700 dark:text-neutral-200"
                  >
                    <Headset className="h-3.5 w-3.5" aria-hidden />
                    Show Chat
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={setSalesIqPathAction} className="mt-5 flex flex-wrap items-end gap-3 border-t border-theme-border pt-4 dark:border-neutral-800">
          <input type="hidden" name="excluded" value="on" />
          <label className="min-w-56 flex-1">
            <span className="mb-1.5 block text-xs font-semibold text-theme-dark dark:text-neutral-200">
              Hide the chat on another page
            </span>
            <input
              name="path"
              required
              placeholder="/blogs"
              className="h-10 w-full rounded-md border border-theme-border bg-theme-bg px-3 font-mono text-sm text-theme-dark outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-md bg-theme-primary px-3.5 py-2 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Hide Chat
          </button>
        </form>
      </section>
    </>
  );
}
