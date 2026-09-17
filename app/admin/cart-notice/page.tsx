import { Suspense } from 'react';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import { BellRing, CheckCircle2, Rows3 } from 'lucide-react';
import { setCartNoticeAction } from '@/actions/cartNotice';
import { readCartNoticeFlag } from '@/lib/cartNotice';

/**
 * Admin → Cart Notice. How the store confirms an add to cart.
 *
 * ## Why this screen exists
 *
 * Adding something to the cart currently opens a dialog with the item's specs
 * and a row of accessories to add next. That is worth an interruption when
 * there is something to offer and the visitor has just started; it is worth
 * rather less to someone adding their third container, who has to dismiss it
 * each time to carry on.
 *
 * Which of those is the common case here is a question about customers, not
 * code, so it is a switch rather than a deploy — flip it, watch, flip it back.
 * Both components stay in the codebase; when one of them clearly wins, delete
 * the other rather than leaving both to drift.
 */

export const metadata: Metadata = { title: 'Cart Notice' };

type Props = {
  searchParams: Promise<{ saved?: string }>;
};

const CARD =
  'rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900';

const OPTIONS = [
  {
    mode: 'modal' as const,
    label: 'Modal — the full dialog',
    shows: ['Item photo', 'Specs', 'Accessories to add', 'View Cart', 'Checkout'],
    description:
      'What customers see today. It stops the page, confirms what was added and offers accessories that go with it — the only place in the flow where that cross-sell appears.',
  },
  {
    mode: 'toast' as const,
    label: 'Toast — a line in the corner',
    shows: ['Item name', 'Price', 'View Cart', 'Checkout'],
    description:
      'Confirms the add and disappears after five seconds without interrupting. Nothing to dismiss before carrying on, and no accessories offered. Better for visitors adding several things in a row.',
  },
];

export default function CartNoticeSettingsPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-xl font-extrabold tracking-tight text-theme-dark dark:text-white">
          Cart Notice
        </h1>
        <p className="mt-1 text-sm text-theme-muted dark:text-neutral-400">
          What the storefront shows when a customer adds something to their cart.
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
        <NoticeChoice searchParams={searchParams} />
      </Suspense>

      <footer className="mt-8 rounded-lg border border-dashed border-theme-border p-4 text-xs leading-relaxed text-theme-muted dark:border-neutral-700 dark:text-neutral-500">
        <p>
          <strong className="font-semibold">Applies immediately.</strong> Switching clears the
          cached setting, so the next customer to add something sees the one you picked — no
          deploy, no waiting.
        </p>
        <p className="mt-2">
          <strong className="font-semibold">If this setting cannot be read</strong> — Redis
          unreachable, say — the storefront shows the modal rather than failing.
        </p>
      </footer>
    </div>
  );
}

async function NoticeChoice({ searchParams }: Props) {
  await connection();
  const [{ saved }, mode] = await Promise.all([searchParams, readCartNoticeFlag()]);

  return (
    <>
      {saved && (
        <p
          role="status"
          className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          Saved. Adding to the cart now shows the {saved === 'toast' ? 'toast' : 'modal'}.
        </p>
      )}

      <section className={CARD}>
        <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
          <BellRing className="h-4 w-4 text-theme-primary" aria-hidden />
          Add-To-Cart Confirmation
        </h2>

        <ul className="mt-4 space-y-3">
          {OPTIONS.map((option) => {
            const active = option.mode === mode;

            return (
              <li
                key={option.mode}
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
                    {/* What each one actually puts in front of the customer,
                        so the choice does not have to be opened in another tab
                        to be understood. */}
                    <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-theme-muted/80 dark:text-neutral-500">
                      <Rows3 className="h-3 w-3 shrink-0" aria-hidden />
                      {option.shows.join(' · ')}
                    </p>
                  </div>

                  {!active && (
                    <form action={setCartNoticeAction} className="shrink-0">
                      <input type="hidden" name="mode" value={option.mode} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-md bg-theme-primary px-3.5 py-2 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
                      >
                        Switch To This
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
