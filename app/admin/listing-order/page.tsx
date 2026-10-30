import { Suspense } from 'react';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PLP_DEFAULT_ORDER } from '@/config/plpOrder';
import { readPlpOrderSetting } from '@/lib/plpOrderSettings';
import { ListingOrderEditor } from './_components/ListingOrderEditor';

/**
 * Admin → Listing Order. The container listing's Default sort
 * (/sale-shipping-containers, Buy, Rent and Rent-To-Own).
 *
 * A rule, not a list of products: products are compared by term, grade and
 * size, in the order set here, so it applies to every location and payment
 * type at once and a new product lands in its place without being named.
 * config/plpOrder.ts is the default; docs/reference/plp-product-ordering.md
 * has how it was chosen.
 */

export const metadata: Metadata = { title: 'Listing Order' };

type Props = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

const ERRORS: Record<string, string> = {
  invalid: 'That order could not be saved: every value has to stay in its list. Nothing changed.',
  save: 'The order could not be saved (Redis did not answer). Nothing changed; try again.',
};

export default function ListingOrderPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-xl font-extrabold tracking-tight text-theme-dark dark:text-white">Listing Order</h1>
        <p className="mt-1 text-sm text-theme-muted dark:text-neutral-400">
          The Default sort of the container listing, for every location: Buy, Rent and Rent-To-Own.
        </p>
      </header>

      {/* Reading the stored order is request-time work, so it streams in
          behind its own boundary, as on the other admin screens that read Redis. */}
      <Suspense fallback={<div className="h-[36rem] animate-pulse rounded-lg bg-theme-subtle dark:bg-neutral-900" />}>
        <Editor searchParams={searchParams} />
      </Suspense>

      <footer className="mt-8 rounded-lg border border-dashed border-theme-border p-4 text-xs leading-relaxed text-theme-muted dark:border-neutral-700 dark:text-neutral-500">
        <p>
          <strong className="font-semibold">How it sorts:</strong> by the first key in &ldquo;What Decides
          First&rdquo;; the next breaks ties, then the last; then lowest price, then title. A product whose
          grade, size or term is not in a list comes after the listed ones.
        </p>
        <p className="mt-2">
          <strong className="font-semibold">Applies</strong> on the next visit to the listing. Price sorts,
          Best Rated, searches and accessories are not affected.
        </p>
        <p className="mt-2">
          <strong className="font-semibold">If this setting cannot be read</strong> — Redis unreachable,
          say — the listing uses the default order.
        </p>
      </footer>
    </div>
  );
}

async function Editor({ searchParams }: Props) {
  await connection();
  const [{ saved, error }, setting] = await Promise.all([searchParams, readPlpOrderSetting()]);

  return (
    <>
      {saved && (
        <p
          role="status"
          className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          {saved === 'reset' ? 'Reset. The listing is back to the default order.' : 'Saved. The listing now uses this order.'}
        </p>
      )}
      {(error || setting.error) && (
        <p
          role="alert"
          className="mb-6 flex items-start gap-2 rounded-lg border border-theme-primary/30 bg-theme-primary/5 px-3.5 py-2.5 text-sm font-semibold text-theme-primary dark:text-red-300"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error
            ? (ERRORS[error] ?? 'Something went wrong. Try again.')
            : 'The saved order could not be read, so the listing is using the default order.'}
        </p>
      )}
      <p className="mb-4 text-xs font-semibold text-theme-muted">
        {setting.custom ? 'A saved order is in use.' : 'Using the default order.'}
      </p>
      {/* Keyed on the stored order, so a save or reset shows what was stored. */}
      <ListingOrderEditor
        key={JSON.stringify(setting.order)}
        initial={setting.order}
        defaults={PLP_DEFAULT_ORDER}
        custom={setting.custom}
      />
    </>
  );
}
