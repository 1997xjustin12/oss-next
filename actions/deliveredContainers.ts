'use server';

import { randomUUID } from 'node:crypto';
import { updateTag } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { ADMIN_ROUTES } from '@/config/admin';
import { CACHE_TAGS } from '@/config/cache';
import { DEPOT_SNAPSHOT } from '@/config/depotCoordinates';
import { hasAdminAccess } from '@/lib/adminGuard';
import { parseDeliveredForm } from '@/lib/deliveredContainers';
import {
  archivedDeliveries,
  deleteDeliveredRecord,
  readDeliveredEdits,
  saveDeliveredRecord,
  setDeliveredHidden,
} from '@/services/deliveredContainer.service';
import type { DeliveredContainer } from '@/types/deliveredContainer';

/**
 * Admin → Delivered Containers. Each action re-checks admin access (a Server
 * Action is its own endpoint; the layout gate does not cover it) and busts the
 * delivered tag with updateTag, so the homepage and location pages follow now.
 * Every write is a single Redis command (lib: services/deliveredContainer.service.ts).
 */

const field = (form: FormData, name: string) => String(form.get(name) ?? '');

/** Where to go back to: the list as it was (filters, page), with a message. */
function back(form: FormData, message: Record<string, string>): never {
  const params = new URLSearchParams(field(form, 'return'));
  params.delete('edit');
  params.delete('error');
  params.delete('saved');
  for (const [k, v] of Object.entries(message)) params.set(k, v);
  redirect(`${ADMIN_ROUTES.DELIVERED}?${params}`);
}

/** The record an id names, as currently shown (an admin edit wins over the original). */
async function findRecord(id: string): Promise<DeliveredContainer | null> {
  const edits = await readDeliveredEdits();
  return edits.records.find((r) => r.id === id) ?? archivedDeliveries().find((r) => r.id === id) ?? null;
}

export async function saveDeliveredAction(form: FormData): Promise<void> {
  if (!(await hasAdminAccess())) notFound();

  const id = field(form, 'id');
  const existing = id ? await findRecord(id) : null;
  // An order record not edited before is not stored here: the form carries its fields.
  const base: DeliveredContainer | null =
    existing ?? (id.startsWith('order-') ? { id, source: 'order', title: '', deliveredOn: '', location: '', depotId: null, image: null } : null);
  if (id && !base) back(form, { error: 'That delivery no longer exists.' });

  const result = parseDeliveredForm(
    {
      title: field(form, 'title'),
      deliveredOn: field(form, 'deliveredOn'),
      location: field(form, 'location'),
      depotId: field(form, 'depotId'),
      image: field(form, 'image'),
    },
    DEPOT_SNAPSHOT,
    base,
    `admin-${randomUUID()}`,
  );
  if ('error' in result) back(form, { error: result.error, ...(id ? { edit: id } : {}) });

  await saveDeliveredRecord(result.record);
  updateTag(CACHE_TAGS.DELIVERED);
  back(form, { saved: id ? 'edited' : 'added' });
}

export async function setDeliveredHiddenAction(form: FormData): Promise<void> {
  if (!(await hasAdminAccess())) notFound();

  const id = field(form, 'id');
  const hide = field(form, 'hidden') === 'on';
  if (!id) back(form, { error: 'No delivery given.' });
  await setDeliveredHidden(id, hide);
  updateTag(CACHE_TAGS.DELIVERED);
  back(form, { saved: hide ? 'hidden' : 'shown' });
}

/** Deletes a delivery added here, or undoes an edit of an archive or order record. */
export async function deleteDeliveredAction(form: FormData): Promise<void> {
  if (!(await hasAdminAccess())) notFound();

  const id = field(form, 'id');
  if (!id) back(form, { error: 'No delivery given.' });
  await deleteDeliveredRecord(id);
  // A deleted admin record has nothing left to hide.
  if (id.startsWith('admin-')) await setDeliveredHidden(id, false);
  updateTag(CACHE_TAGS.DELIVERED);
  back(form, { saved: id.startsWith('admin-') ? 'deleted' : 'reset' });
}
