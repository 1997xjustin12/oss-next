'use server';

import { updateTag } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { ADMIN_ROUTES } from '@/config/admin';
import { CACHE_TAGS } from '@/config/cache';
import { findContentPageById } from '@/config/homeContent';
import { isAdminEnabled } from '@/lib/admin';
import { deletePageContent, savePageContent } from '@/services/content.service';
import type { PageContent } from '@/types/content';

// Mutations behind the admin Content Editor. Mirrors actions/seo.ts.

function assertAdmin(): void {
  // The layout already refuses to render in production, but a Server Action is
  // its own endpoint — it has to check for itself.
  if (!isAdminEnabled()) notFound();
}

export async function savePageContentAction(formData: FormData): Promise<void> {
  assertAdmin();

  const page = findContentPageById(String(formData.get('pageId') ?? ''));
  if (!page) notFound();

  // Iterate the registry rather than the submitted form: a field that isn't a
  // known heading key can't be smuggled into the record, and a heading left at
  // its default is stored as absent rather than as a copy of the default (so
  // changing the default in source still reaches pages nobody has edited).
  const headings: Record<string, string> = {};
  for (const field of page.headings) {
    const raw = formData.get(field.key);
    if (typeof raw !== 'string') continue;
    const text = raw.trim();
    if (text && text !== field.default) headings[field.key] = text;
  }

  const content: PageContent = {
    headings: Object.keys(headings).length ? headings : undefined,
    updatedAt: new Date().toISOString(),
  };

  await savePageContent(page.path, content);
  updateTag(CACHE_TAGS.CONTENT);

  redirect(`${ADMIN_ROUTES.CONTENT_EDITOR_EDIT(page.id)}?status=saved`);
}

export async function resetPageContentAction(formData: FormData): Promise<void> {
  assertAdmin();

  const page = findContentPageById(String(formData.get('pageId') ?? ''));
  if (!page) notFound();

  await deletePageContent(page.path);
  updateTag(CACHE_TAGS.CONTENT);

  redirect(`${ADMIN_ROUTES.CONTENT_EDITOR_EDIT(page.id)}?status=reset`);
}
