import { Suspense } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { connection } from 'next/server';
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Pencil, Plus, RotateCcw, Trash2, Truck } from 'lucide-react';
import { deleteDeliveredAction, saveDeliveredAction, setDeliveredHiddenAction } from '@/actions/deliveredContainers';
import { ADMIN_ROUTES } from '@/config/admin';
import { DEPOT_SNAPSHOT } from '@/config/depotCoordinates';
import { DELIVERED_ARCHIVE_TAKEN_AT } from '@/lib/data/deliveredContainersArchive';
import { DELIVERED_IMAGE_HOSTS, formatDeliveredOn } from '@/lib/deliveredContainers';
import { depotSelectOptions } from '@/lib/depotOptions';
import { readDeliveredForAdmin } from '@/services/deliveredContainer.service';
import type { DeliveredContainer } from '@/types/deliveredContainer';

/**
 * Admin → Delivered Containers: the "Recently Delivered Containers" shown on
 * the homepage (all) and on each location page (its depot and the virtual
 * depots it serves).
 *
 * The list is the WordPress archive (616 records), the backend's delivered
 * orders, and what is added here. Any record can be edited or hidden; edits
 * and additions live in Redis (services/deliveredContainer.service.ts), so the
 * archive and the orders themselves are never changed.
 */

export const metadata: Metadata = { title: 'Delivered Containers', robots: { index: false, follow: false } };

type Search = { q?: string; source?: string; depot?: string; view?: string; page?: string; edit?: string; saved?: string; error?: string };
type Props = { searchParams: Promise<Search> };

const PAGE_SIZE = 40;
const CARD = 'rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900';
const INPUT =
  'w-full rounded-md border border-theme-border bg-white px-3 py-2 text-sm text-theme-dark focus:border-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-primary/30 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white';
const LABEL = 'block text-xs font-semibold text-theme-mid dark:text-neutral-300';
const SAVED: Record<string, string> = {
  added: 'Delivery added.',
  edited: 'Delivery saved.',
  hidden: 'Delivery hidden from the site.',
  shown: 'Delivery shown on the site again.',
  deleted: 'Delivery deleted.',
  reset: 'Edit undone: the original shows again.',
};
const SOURCE_LABEL: Record<DeliveredContainer['source'], string> = { archive: 'WordPress', order: 'Order', admin: 'Added here' };

export default function DeliveredContainersAdmin({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-theme-dark dark:text-white">
          <Truck className="h-5 w-5 text-theme-primary" aria-hidden />
          Delivered Containers
        </h1>
        <p className="mt-1 text-sm text-theme-muted dark:text-neutral-400">
          &ldquo;Recently Delivered Containers&rdquo;: every delivery on the homepage, and each location page&apos;s own
          (its depot and the virtual depots it serves). Newest first.
        </p>
      </header>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-theme-subtle dark:bg-neutral-900" />}>
        <DeliveredAdmin searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function DeliveredAdmin({ searchParams }: Props) {
  await connection();
  const [search, data] = await Promise.all([searchParams, readDeliveredForAdmin()]);
  const depotNames = new Map(DEPOT_SNAPSHOT.map((d) => [d.id, d.title]));
  const depotOptions = depotSelectOptions(DEPOT_SNAPSHOT);

  // Filters (GET form below); the action redirects back with them.
  const q = (search.q ?? '').trim().toLowerCase();
  const view = search.view ?? 'all';
  const depotFilter = search.depot ? Number(search.depot) : null;
  const filtered = data.records.filter((r) => {
    if (search.source && r.source !== search.source) return false;
    if (depotFilter !== null && r.depotId !== depotFilter) return false;
    if (view === 'shown' && data.hidden.has(r.id)) return false;
    if (view === 'hidden' && !data.hidden.has(r.id)) return false;
    if (view === 'unmatched' && r.depotId !== null) return false;
    if (view === 'edited' && !data.edited.has(r.id)) return false;
    return !q || `${r.title} ${r.location} ${depotNames.get(r.depotId ?? -1) ?? ''}`.toLowerCase().includes(q);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(search.page) || 1), pages);
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const keep = new URLSearchParams(
    Object.entries({ q: search.q, source: search.source, depot: search.depot, view: search.view, page: page > 1 ? String(page) : undefined }).filter(
      (e): e is [string, string] => !!e[1],
    ),
  );
  const href = (extra: Record<string, string>) => {
    const p = new URLSearchParams(keep);
    for (const [k, v] of Object.entries(extra)) p.set(k, v);
    return `${ADMIN_ROUTES.DELIVERED}?${p}`;
  };
  const editing = search.edit ? (data.records.find((r) => r.id === search.edit) ?? null) : null;

  const shownCount = data.records.filter((r) => !data.hidden.has(r.id)).length;
  const counts = {
    archive: data.records.filter((r) => r.source === 'archive').length,
    order: data.records.filter((r) => r.source === 'order').length,
    admin: data.records.filter((r) => r.source === 'admin').length,
  };

  return (
    <>
      {search.saved && SAVED[search.saved] && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          {SAVED[search.saved]} The site follows within a minute.
        </p>
      )}
      {search.error && (
        <p role="alert" className="mb-4 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          {search.error}
        </p>
      )}
      {!data.ordersOk && (
        <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
          The backend&apos;s delivered orders could not be read just now, so they are missing from this list.
        </p>
      )}

      <dl className="mb-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
        {[
          ['On the site', shownCount],
          ['Hidden', data.hidden.size],
          ['WordPress', counts.archive],
          ['Orders', counts.order],
          ['Added here', counts.admin],
        ].map(([label, n]) => (
          <div key={label} className="rounded-md bg-theme-subtle p-3 dark:bg-neutral-800">
            <dt className="text-xs text-theme-muted dark:text-neutral-400">{label}</dt>
            <dd className="text-lg font-extrabold tabular-nums text-theme-dark dark:text-white">{n}</dd>
          </div>
        ))}
      </dl>

      <DeliveryForm key={editing?.id ?? 'new'} editing={editing} depotOptions={depotOptions} returnTo={keep.toString()} cancelHref={href({})} />

      <section className={`${CARD} mt-6`} aria-labelledby="delivered-list">
        <h2 id="delivered-list" className="text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
          Deliveries <span className="font-normal text-theme-muted">({filtered.length})</span>
        </h2>
        <form method="get" className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]">
          <input name="q" defaultValue={search.q} placeholder="Search title, place or depot" className={INPUT} aria-label="Search" />
          <select name="view" defaultValue={view} className={INPUT} aria-label="Show">
            <option value="all">All</option>
            <option value="shown">On the site</option>
            <option value="hidden">Hidden</option>
            <option value="edited">Added or edited here</option>
            <option value="unmatched">No depot</option>
          </select>
          <select name="source" defaultValue={search.source ?? ''} className={INPUT} aria-label="Source">
            <option value="">Every source</option>
            <option value="archive">WordPress</option>
            <option value="order">Orders</option>
            <option value="admin">Added here</option>
          </select>
          <select name="depot" defaultValue={search.depot ?? ''} className={`${INPUT} sm:max-w-56`} aria-label="Depot">
            <option value="">Every depot</option>
            {depotOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-md bg-theme-dark px-3.5 py-2 text-sm font-bold text-white hover:opacity-90 dark:bg-neutral-700">
            Filter
          </button>
        </form>

        <ul className="mt-4 divide-y divide-theme-border dark:divide-neutral-800">
          {rows.map((r) => {
            const hidden = data.hidden.has(r.id);
            const edited = data.edited.has(r.id);
            return (
              <li key={r.id} className={`flex flex-wrap items-center gap-3 py-3 sm:flex-nowrap ${hidden ? 'opacity-55' : ''}`}>
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-theme-subtle dark:bg-neutral-800">
                  {r.image && <Image src={r.image} alt="" fill sizes="64px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-semibold text-theme-dark dark:text-white">{r.title}</p>
                  <p className="text-xs text-theme-muted dark:text-neutral-400">
                    {formatDeliveredOn(r.deliveredOn)} · {r.location || 'No place'} ·{' '}
                    {r.depotId !== null ? depotNames.get(r.depotId) ?? `#${r.depotId}` : <span className="text-amber-700 dark:text-amber-400">no depot (homepage only)</span>}
                  </p>
                  <p className="mt-0.5 flex flex-wrap gap-1 text-[11px] font-semibold uppercase tracking-wide">
                    <span className="rounded bg-theme-subtle px-1.5 py-0.5 text-theme-mid dark:bg-neutral-800 dark:text-neutral-300">{SOURCE_LABEL[r.source]}</span>
                    {edited && r.source !== 'admin' && <span className="rounded bg-sky-100 px-1.5 py-0.5 text-sky-800 dark:bg-sky-950 dark:text-sky-300">Edited</span>}
                    {hidden && <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">Hidden</span>}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Link href={href({ edit: r.id })} className="inline-flex items-center gap-1 rounded-md border border-theme-border px-2.5 py-1.5 text-xs font-semibold hover:bg-theme-subtle dark:border-neutral-700 dark:hover:bg-neutral-800" aria-label={`Edit ${r.title}`}>
                    <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                  </Link>
                  <form action={setDeliveredHiddenAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="hidden" value={hidden ? 'off' : 'on'} />
                    <input type="hidden" name="return" value={keep.toString()} />
                    <button type="submit" className="inline-flex items-center gap-1 rounded-md border border-theme-border px-2.5 py-1.5 text-xs font-semibold hover:bg-theme-subtle dark:border-neutral-700 dark:hover:bg-neutral-800">
                      {hidden ? <Eye className="h-3.5 w-3.5" aria-hidden /> : <EyeOff className="h-3.5 w-3.5" aria-hidden />}
                      {hidden ? 'Show' : 'Hide'}
                    </button>
                  </form>
                  {edited && (
                    <form action={deleteDeliveredAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="return" value={keep.toString()} />
                      <button type="submit" className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40">
                        {r.source === 'admin' ? <Trash2 className="h-3.5 w-3.5" aria-hidden /> : <RotateCcw className="h-3.5 w-3.5" aria-hidden />}
                        {r.source === 'admin' ? 'Delete' : 'Undo edit'}
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
          {rows.length === 0 && <li className="py-6 text-center text-sm text-theme-muted">No deliveries match.</li>}
        </ul>

        {pages > 1 && (
          <nav aria-label="Pages" className="mt-4 flex items-center justify-between text-sm">
            {page > 1 ? <Link href={href({ page: String(page - 1) })} className="font-semibold text-theme-primary hover:underline">← Newer</Link> : <span />}
            <span className="text-theme-muted">
              Page {page} of {pages}
            </span>
            {page < pages ? <Link href={href({ page: String(page + 1) })} className="font-semibold text-theme-primary hover:underline">Older →</Link> : <span />}
          </nav>
        )}
      </section>

      <footer className="mt-8 rounded-lg border border-dashed border-theme-border p-4 text-xs leading-relaxed text-theme-muted dark:border-neutral-700 dark:text-neutral-500">
        <p>
          <strong className="font-semibold">Where each shows.</strong> The homepage shows the newest 20 of all of them.
          A location page shows the newest 20 of its depot and the virtual depots it serves (set by the page&apos;s
          &ldquo;Depot&rdquo; in Location Pages); with none, it keeps its fixed delivery photos. A delivery with no depot
          shows on the homepage only.
        </p>
        <p className="mt-2">
          <strong className="font-semibold">Sources.</strong> WordPress: the old site&apos;s 616 records, copied on{' '}
          {new Date(DELIVERED_ARCHIVE_TAKEN_AT).toLocaleDateString('en-US', { dateStyle: 'medium', timeZone: 'UTC' })}. Orders: the
          backend&apos;s delivered orders, read every few minutes. Editing a WordPress or order record stores your version
          here; &ldquo;Undo edit&rdquo; brings the original back.
        </p>
      </footer>
    </>
  );
}

function DeliveryForm({
  editing,
  depotOptions,
  returnTo,
  cancelHref,
}: {
  editing: DeliveredContainer | null;
  depotOptions: { value: string; label: string }[];
  returnTo: string;
  cancelHref: string;
}) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <details open={!!editing} className={CARD}>
      <summary className="flex cursor-pointer items-center gap-2 text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
        {editing ? <Pencil className="h-4 w-4 text-theme-primary" aria-hidden /> : <Plus className="h-4 w-4 text-theme-primary" aria-hidden />}
        {editing ? `Edit: ${editing.title}` : 'Add a delivery'}
      </summary>
      <form action={saveDeliveredAction} className="mt-4 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="id" value={editing?.id ?? ''} />
        <input type="hidden" name="return" value={returnTo} />
        <label className="sm:col-span-2">
          <span className={LABEL}>Title (what was delivered)</span>
          <input name="title" required maxLength={120} defaultValue={editing?.title} placeholder="Used 40' High Cube" className={`${INPUT} mt-1`} />
        </label>
        <label>
          <span className={LABEL}>Delivery date</span>
          <input name="deliveredOn" type="date" required max={today} defaultValue={editing?.deliveredOn ?? today} className={`${INPUT} mt-1`} />
        </label>
        <label>
          <span className={LABEL}>Place (as the card shows it)</span>
          <input name="location" maxLength={80} defaultValue={editing?.location} placeholder="Long Beach" className={`${INPUT} mt-1`} />
        </label>
        <label className="sm:col-span-2">
          <span className={LABEL}>Depot</span>
          <select name="depotId" defaultValue={editing?.depotId != null ? String(editing.depotId) : ''} className={`${INPUT} mt-1`}>
            <option value="">Match from the place</option>
            {depotOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-theme-muted">Which location pages show it: this depot&apos;s, and its main depot&apos;s when it is virtual.</span>
        </label>
        <label className="sm:col-span-2">
          <span className={LABEL}>Photo link</span>
          <input name="image" type="url" defaultValue={editing?.image ?? ''} placeholder={`https://${DELIVERED_IMAGE_HOSTS[0]}/…`} className={`${INPUT} mt-1`} />
          <span className="mt-1 block text-xs text-theme-muted">An image already on the CDN ({DELIVERED_IMAGE_HOSTS[0]}). Square photos fit the card best.</span>
        </label>
        <div className="flex items-center gap-3 sm:col-span-2">
          <button type="submit" className="rounded-md bg-theme-primary px-4 py-2 text-sm font-bold text-white hover:bg-theme-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary/40">
            {editing ? 'Save' : 'Add delivery'}
          </button>
          {editing && (
            <Link href={cancelHref} className="text-sm font-semibold text-theme-muted hover:underline">
              Cancel
            </Link>
          )}
        </div>
      </form>
    </details>
  );
}
