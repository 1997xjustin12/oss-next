import { Suspense } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { connection } from 'next/server';
import { AlertTriangle, CheckCircle2, Globe, Lock, LockOpen } from 'lucide-react';
import { setCheckoutOpenAction } from '@/actions/checkoutGate';
import { ROUTES } from '@/config/routes';
import { CHECKOUT_GATE_TTL_SECONDS, normalizeHost, readOpenHosts } from '@/lib/checkoutGate';

/**
 * Admin → Checkout. Whether checkout is open, per domain.
 *
 * ## Why per domain
 *
 * The store is not taking online orders yet, but the checkout flow still has
 * to be built and tested. So checkout is **closed everywhere by default** —
 * /checkout shows /checkout-unavailable and the order API refuses — and opened
 * only on the domains listed here: a developer's preview URL, localhost, or,
 * on launch day, the live domain. See lib/checkoutGate.ts.
 */

export const metadata: Metadata = { title: 'Checkout' };

type Props = {
  searchParams: Promise<{ saved?: string; open?: string; error?: string }>;
};

const CARD =
  'rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900';
const PRIMARY =
  'inline-flex items-center gap-1.5 rounded-md bg-theme-primary px-3.5 py-2 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary/40';
const SECONDARY =
  'inline-flex items-center gap-1.5 rounded-md border border-theme-border px-3 py-1.5 text-xs font-bold text-theme-dark transition-colors hover:border-theme-primary hover:text-theme-primary dark:border-neutral-700 dark:text-neutral-200';

const ERRORS: Record<string, string> = {
  host: 'That does not look like a domain. Enter it like staging.onsitestorage.com.',
  save: 'The change could not be saved (Redis did not answer). Nothing changed; try again.',
};

export default function CheckoutGatePage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-xl font-extrabold tracking-tight text-theme-dark dark:text-white">Checkout</h1>
        <p className="mt-1 text-sm text-theme-muted dark:text-neutral-400">
          Whether the checkout flow is open, per domain. Closed on every domain not listed below.
        </p>
      </header>

      {/* Reading the stored list and the request's domain is request-time
          work, so it streams in behind its own boundary, as on the other admin
          screens that read Redis. */}
      <Suspense fallback={<div className="h-80 animate-pulse rounded-lg bg-theme-subtle dark:bg-neutral-900" />}>
        <CheckoutGate searchParams={searchParams} />
      </Suspense>

      <footer className="mt-8 rounded-lg border border-dashed border-theme-border p-4 text-xs leading-relaxed text-theme-muted dark:border-neutral-700 dark:text-neutral-500">
        <p>
          <strong className="font-semibold">Closed means:</strong> /checkout shows the &ldquo;Checkout
          isn&rsquo;t open yet&rdquo; page ({ROUTES.CHECKOUT_UNAVAILABLE}) with the phone number, and the
          order API refuses orders. Carts are kept, and the delivery-quote form still sends its details
          to Zoho.
        </p>
        <p className="mt-2">
          <strong className="font-semibold">Applies</strong> at once on this server, and within{' '}
          {CHECKOUT_GATE_TTL_SECONDS} seconds everywhere else.
        </p>
        <p className="mt-2">
          <strong className="font-semibold">If this list cannot be read</strong> — Redis unreachable,
          say — checkout is closed on every domain until it can be.
        </p>
      </footer>
    </div>
  );
}

function HostForm({ host, open, label, className }: { host: string; open: boolean; label: string; className: string }) {
  return (
    <form action={setCheckoutOpenAction} className="shrink-0">
      <input type="hidden" name="host" value={host} />
      <input type="hidden" name="open" value={open ? 'open' : 'close'} />
      <button type="submit" className={className}>
        {open ? <LockOpen className="h-4 w-4" aria-hidden /> : <Lock className="h-3.5 w-3.5" aria-hidden />}
        {label}
      </button>
    </form>
  );
}

async function CheckoutGate({ searchParams }: Props) {
  await connection();
  const [{ saved, open, error }, list, requestHeaders] = await Promise.all([searchParams, readOpenHosts(), headers()]);
  // The Host header, as the gate reads it (proxy.ts), so this screen and the gate agree.
  const current = normalizeHost(requestHeaders.get('host') ?? '');
  const fromEnv = !!current && list.envHosts.includes(current);
  const currentOpen = !!current && (fromEnv || list.hosts.includes(current));

  return (
    <>
      {saved && (
        <p
          role="status"
          className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          Saved. Checkout is now {open === '1' ? 'open' : 'closed'} on {saved}.
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
            : 'The list could not be read, so checkout is closed on every domain until it can be.'}
        </p>
      )}

      {/* The domain this screen is open on: the one a developer most often
          wants to switch. */}
      <section className={CARD}>
        <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
          <Globe className="h-4 w-4 text-theme-primary" aria-hidden />
          This Domain
        </h2>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-md border border-theme-border p-4 dark:border-neutral-700">
          <div className="min-w-0">
            <p className="break-all font-mono text-sm font-bold text-theme-dark dark:text-neutral-100">
              {current || '(unknown)'}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-theme-muted dark:text-neutral-400">
              {currentOpen ? (
                <>
                  <LockOpen className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> Checkout is{' '}
                  <strong className="text-emerald-700 dark:text-emerald-400">open</strong> here.
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 text-theme-primary" aria-hidden /> Checkout is{' '}
                  <strong className="text-theme-primary dark:text-red-400">closed</strong> here.
                </>
              )}
            </p>
          </div>
          {current && !fromEnv && (
            <HostForm
              host={current}
              open={!currentOpen}
              label={currentOpen ? 'Close Checkout Here' : 'Open Checkout Here'}
              className={PRIMARY}
            />
          )}
        </div>
        {fromEnv && (
          <p className="mt-3 text-xs text-theme-muted dark:text-neutral-400">
            Open by this server&rsquo;s <code className="font-mono">CHECKOUT_OPEN_HOSTS</code> setting, so it
            cannot be closed from here.
          </p>
        )}
      </section>

      <section className={`${CARD} mt-6`}>
        <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
          <LockOpen className="h-4 w-4 text-theme-primary" aria-hidden />
          Open On
        </h2>
        {list.hosts.length === 0 ? (
          <p className="mt-3 text-sm text-theme-muted dark:text-neutral-400">
            No domain. Checkout is closed everywhere.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-theme-border dark:divide-neutral-800">
            {list.hosts.map((host) => (
              <li key={host} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <span className="break-all font-mono text-sm text-theme-dark dark:text-neutral-100">
                  {host}
                  {host === current && <span className="ml-2 font-sans text-xs text-theme-muted">(this domain)</span>}
                </span>
                <HostForm host={host} open={false} label="Close" className={SECONDARY} />
              </li>
            ))}
          </ul>
        )}

        <form action={setCheckoutOpenAction} className="mt-5 flex flex-wrap items-end gap-3 border-t border-theme-border pt-4 dark:border-neutral-800">
          <input type="hidden" name="open" value="open" />
          <label className="min-w-56 flex-1">
            <span className="mb-1.5 block text-xs font-semibold text-theme-dark dark:text-neutral-200">
              Open checkout on another domain
            </span>
            <input
              name="host"
              required
              placeholder="my-branch.vercel.app"
              className="h-10 w-full rounded-md border border-theme-border bg-theme-bg px-3 font-mono text-sm text-theme-dark outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
            />
          </label>
          <button type="submit" className={PRIMARY}>
            <LockOpen className="h-4 w-4" aria-hidden />
            Open Checkout
          </button>
        </form>
      </section>
    </>
  );
}
