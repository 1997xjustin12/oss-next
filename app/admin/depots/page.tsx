import { Suspense } from 'react';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import { CheckCircle2, Warehouse } from 'lucide-react';
import { setVirtualDepotsAction } from '@/actions/virtualDepots';
import { DEPOT_SNAPSHOT_TAKEN_AT } from '@/config/depotCoordinates';
import { DEFAULT_LOCATION } from '@/lib/constants';
import { depotCandidates } from '@/lib/nearestDepot';
import { readVirtualDepotsFlag } from '@/lib/virtualDepots';
import { getDepots } from '@/services/depot.service';

/**
 * Admin → Depots. Which depots a visitor's ZIP can resolve to.
 *
 * Every ZIP box, "use my current location", the product page and the agent API
 * send a visitor to the nearest depot by straight-line distance
 * (services/depot.service.ts resolveNearestDepot). The depots come from the
 * backend, with the app's copy as the fallback. This screen holds the one
 * switch on that: whether virtual depots (a service area served from a main
 * depot) count. Off by default.
 */

export const metadata: Metadata = { title: 'Depots' };

type Props = { searchParams: Promise<{ saved?: string }> };

const CARD =
  'rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900';

export default function DepotsSettingsPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-xl font-extrabold tracking-tight text-theme-dark dark:text-white">Depots</h1>
        <p className="mt-1 text-sm text-theme-muted dark:text-neutral-400">
          Which depots a visitor&apos;s ZIP can send them to. The nearest one by distance wins.
        </p>
      </header>

      <Suspense fallback={<div className="h-72 animate-pulse rounded-lg bg-theme-subtle dark:bg-neutral-900" />}>
        <DepotSettings searchParams={searchParams} />
      </Suspense>

      <footer className="mt-8 rounded-lg border border-dashed border-theme-border p-4 text-xs leading-relaxed text-theme-muted dark:border-neutral-700 dark:text-neutral-500">
        <p>
          <strong className="font-semibold">Applies within a minute or two</strong>, to every ZIP box, &ldquo;use my
          current location&rdquo;, the product page and the agent API. Visitors who already saved a location keep it
          until they enter a ZIP again.
        </p>
        <p className="mt-2">
          <strong className="font-semibold">&ldquo;{DEFAULT_LOCATION}&rdquo; is never suggested.</strong> It holds the
          generic products shown before a visitor gives a ZIP.
        </p>
        <p className="mt-2">
          <strong className="font-semibold">If this setting cannot be read</strong>, virtual depots stay off.
        </p>
      </footer>
    </div>
  );
}

async function DepotSettings({ searchParams }: Props) {
  await connection();
  const [{ saved }, enabled, { depots, source }] = await Promise.all([searchParams, readVirtualDepotsFlag(), getDepots()]);
  const main = depotCandidates(depots, false).length;
  const all = depotCandidates(depots, true).length;
  const taken = new Date(DEPOT_SNAPSHOT_TAKEN_AT).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });

  return (
    <>
      {saved && (
        <p
          role="status"
          className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          Saved. Virtual depots are now {saved === 'on' ? 'suggested' : 'not suggested'}.
        </p>
      )}

      <section className={CARD}>
        <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
          <Warehouse className="h-4 w-4 text-theme-primary" aria-hidden />
          Suggest Virtual Depots
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-theme-muted dark:text-neutral-400">
          A virtual depot is a service area with no yard of its own, served from a main depot (Abilene, TX from
          Dallas, TX). When this is off, a ZIP goes to the nearest of the {main} main depots. When it is on, it goes
          to the nearest of all {all}, virtual ones included.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-md border border-theme-border p-4 dark:border-neutral-700">
          <p className="text-sm font-bold text-theme-dark dark:text-neutral-100">
            Currently{' '}
            <span className={enabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-theme-primary'}>
              {enabled ? 'on: main and virtual depots' : 'off: main depots only'}
            </span>
          </p>
          <form action={setVirtualDepotsAction}>
            <input type="hidden" name="virtual" value={enabled ? 'off' : 'on'} />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md bg-theme-primary px-3.5 py-2 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
            >
              {enabled ? 'Turn Off' : 'Turn On'}
            </button>
          </form>
        </div>
      </section>

      <section className={`${CARD} mt-4`}>
        <h2 className="text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">Depot List</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[
            ['Main', main],
            ['Virtual', all - main],
            ['Records', depots.length],
          ].map(([label, n]) => (
            <div key={label} className="rounded-md bg-theme-subtle p-3 dark:bg-neutral-800">
              <dt className="text-xs text-theme-muted dark:text-neutral-400">{label}</dt>
              <dd className="text-lg font-extrabold tabular-nums text-theme-dark dark:text-white">{n}</dd>
            </div>
          ))}
          <div className="rounded-md bg-theme-subtle p-3 dark:bg-neutral-800">
            <dt className="text-xs text-theme-muted dark:text-neutral-400">Source</dt>
            <dd className={`text-sm font-bold ${source === 'live' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {source === 'live' ? 'Backend (live)' : 'App copy (fallback)'}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-theme-muted dark:text-neutral-400">
          The list comes from the backend and is cached for hours (purge &ldquo;Depots&rdquo; on the Cache screen to
          refresh it now). If the backend cannot be read, the app&apos;s copy from {taken} UTC is used, refreshed on
          every deploy. &ldquo;Records&rdquo; includes the placeholder and any depot without a position, which are never
          suggested.
        </p>
      </section>
    </>
  );
}
