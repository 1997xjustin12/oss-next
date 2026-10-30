import { Suspense } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { connection } from 'next/server';
import { AlertTriangle, CheckCircle2, CreditCard, Globe, PhoneCall } from 'lucide-react';
import { setPaymentRedirectAction } from '@/actions/paymentRedirect';
import { PAYMENT_REDIRECT_TTL_SECONDS, normalizeHost, readPaymentRedirectHosts } from '@/lib/paymentRedirect';

/**
 * Admin → Checkout. Whether a placed order goes on to the payment page, per
 * domain.
 *
 * ## Why per domain
 *
 * Checkout is open everywhere and every order is recorded as unpaid, but the
 * automated payment step is not ready for customers yet. So it is **off
 * everywhere by default** (the customer sees "Order placed" and the team
 * contacts them to take payment) and switched on only on the domains listed
 * here: a developer's preview URL, localhost, or, on launch day, the live
 * domain. See lib/paymentRedirect.ts.
 */

export const metadata: Metadata = { title: 'Checkout' };

type Props = {
  searchParams: Promise<{ saved?: string; on?: string; error?: string }>;
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

export default function CheckoutPaymentPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-xl font-extrabold tracking-tight text-theme-dark dark:text-white">Checkout</h1>
        <p className="mt-1 text-sm text-theme-muted dark:text-neutral-400">
          Whether customers are sent to the payment page after they place an order, per domain. Off on
          every domain not listed below.
        </p>
      </header>

      {/* Reading the stored list and the request's domain is request-time
          work, so it streams in behind its own boundary, as on the other admin
          screens that read Redis. */}
      <Suspense fallback={<div className="h-80 animate-pulse rounded-lg bg-theme-subtle dark:bg-neutral-900" />}>
        <PaymentRedirect searchParams={searchParams} />
      </Suspense>

      <footer className="mt-8 rounded-lg border border-dashed border-theme-border p-4 text-xs leading-relaxed text-theme-muted dark:border-neutral-700 dark:text-neutral-500">
        <p>
          <strong className="font-semibold">Either way</strong>, customers can check out and place an
          order. It is recorded as unpaid, and the backend emails the order confirmation.
        </p>
        <p className="mt-2">
          <strong className="font-semibold">Off means:</strong> after placing the order the customer sees
          &ldquo;Order placed&rdquo; with its number and stays on this site; the team contacts them to take
          payment. <strong className="font-semibold">On means:</strong> they are sent straight to the
          backend&rsquo;s payment page.
        </p>
        <p className="mt-2">
          <strong className="font-semibold">Applies</strong> at once on this server, and within{' '}
          {PAYMENT_REDIRECT_TTL_SECONDS} seconds everywhere else.
        </p>
        <p className="mt-2">
          <strong className="font-semibold">If this list cannot be read</strong> — Redis unreachable,
          say — it is off on every domain until it can be.
        </p>
      </footer>
    </div>
  );
}

function HostForm({ host, on, label, className }: { host: string; on: boolean; label: string; className: string }) {
  return (
    <form action={setPaymentRedirectAction} className="shrink-0">
      <input type="hidden" name="host" value={host} />
      <input type="hidden" name="on" value={on ? 'on' : 'off'} />
      <button type="submit" className={className}>
        {on ? <CreditCard className="h-4 w-4" aria-hidden /> : <PhoneCall className="h-3.5 w-3.5" aria-hidden />}
        {label}
      </button>
    </form>
  );
}

async function PaymentRedirect({ searchParams }: Props) {
  await connection();
  const [{ saved, on, error }, list, requestHeaders] = await Promise.all([
    searchParams,
    readPaymentRedirectHosts(),
    headers(),
  ]);
  // The Host header, as the order route reads it, so this screen and the order agree.
  const current = normalizeHost(requestHeaders.get('host') ?? '');
  const currentOn = !!current && list.hosts.includes(current);

  return (
    <>
      {saved && (
        <p
          role="status"
          className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          Saved. Orders on {saved} {on === '1' ? 'now go on to the payment page' : 'now stop at “Order placed”'}.
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
            : 'The list could not be read, so no one is sent to the payment page until it can be.'}
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
              {currentOn ? (
                <>
                  <CreditCard className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> Payment page{' '}
                  <strong className="text-emerald-700 dark:text-emerald-400">on</strong>: orders go on to pay.
                </>
              ) : (
                <>
                  <PhoneCall className="h-3.5 w-3.5 text-theme-primary" aria-hidden /> Payment page{' '}
                  <strong className="text-theme-primary dark:text-red-400">off</strong>: orders stop at
                  &ldquo;Order placed&rdquo;.
                </>
              )}
            </p>
          </div>
          {current && (
            <HostForm
              host={current}
              on={!currentOn}
              label={currentOn ? 'Turn Off Here' : 'Turn On Here'}
              className={PRIMARY}
            />
          )}
        </div>
      </section>

      <section className={`${CARD} mt-6`}>
        <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
          <CreditCard className="h-4 w-4 text-theme-primary" aria-hidden />
          Payment Page On For
        </h2>
        {list.hosts.length === 0 ? (
          <p className="mt-3 text-sm text-theme-muted dark:text-neutral-400">
            No domain. Every order stops at &ldquo;Order placed&rdquo;.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-theme-border dark:divide-neutral-800">
            {list.hosts.map((host) => (
              <li key={host} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <span className="break-all font-mono text-sm text-theme-dark dark:text-neutral-100">
                  {host}
                  {host === current && <span className="ml-2 font-sans text-xs text-theme-muted">(this domain)</span>}
                </span>
                <HostForm host={host} on={false} label="Turn Off" className={SECONDARY} />
              </li>
            ))}
          </ul>
        )}

        <form action={setPaymentRedirectAction} className="mt-5 flex flex-wrap items-end gap-3 border-t border-theme-border pt-4 dark:border-neutral-800">
          <input type="hidden" name="on" value="on" />
          <label className="min-w-56 flex-1">
            <span className="mb-1.5 block text-xs font-semibold text-theme-dark dark:text-neutral-200">
              Turn the payment page on for another domain
            </span>
            <input
              name="host"
              required
              placeholder="my-branch.vercel.app"
              className="h-10 w-full rounded-md border border-theme-border bg-theme-bg px-3 font-mono text-sm text-theme-dark outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
            />
          </label>
          <button type="submit" className={PRIMARY}>
            <CreditCard className="h-4 w-4" aria-hidden />
            Turn On
          </button>
        </form>
      </section>
    </>
  );
}
