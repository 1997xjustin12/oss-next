'use server';

import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { ADMIN_ROUTES, MAX_PAGE_SCRIPTS } from '@/config/admin';
import { CACHE_TAGS } from '@/config/cache';
import { findNativePageById } from '@/config/pages';
import { isAdminEnabled } from '@/lib/admin';
import { deletePageSeo, savePageSeo } from '@/services/seo.service';
import type { HeadScript, PageSeo, ScriptStrategy } from '@/types/seo';

// Mutations behind the admin Page Configurator.
//
// `updateTag` rather than `revalidateTag` because this is read-your-own-writes:
// after saving you land back on the form and must see what you just wrote, not
// a stale copy served while the refresh happens in the background.

function text(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function parseRobots(value: string | undefined): PageSeo['robots'] {
  switch (value) {
    case 'index,follow':
      return { index: true, follow: true };
    case 'index,nofollow':
      return { index: true, follow: false };
    case 'noindex,follow':
      return { index: false, follow: true };
    case 'noindex,nofollow':
      return { index: false, follow: false };
    default:
      // 'default' (or anything unrecognised) means "don't override" — the page
      // keeps whatever its own source declares.
      return undefined;
  }
}

function parseKeywords(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  const keywords = value
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
  return keywords.length ? keywords : undefined;
}

/**
 * Script rows arrive as `script.<index>.<field>`. Rows the author marked for
 * deletion, and blank rows (the trailing "add a script" row nobody filled in),
 * are dropped here rather than stored as empty records.
 */
function parseScripts(formData: FormData): HeadScript[] | undefined {
  const scripts: HeadScript[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < MAX_PAGE_SCRIPTS; i++) {
    if (formData.get(`script.${i}.delete`) === 'on') continue;

    const name = text(formData, `script.${i}.name`);
    const src = text(formData, `script.${i}.src`);
    const code = text(formData, `script.${i}.code`);

    if (!src && !code) continue;

    const rawStrategy = text(formData, `script.${i}.strategy`);
    const strategy: ScriptStrategy =
      rawStrategy === 'afterInteractive' ? 'afterInteractive' : 'lazyOnload';

    // Reuse the existing id so next/script keeps treating it as the same script
    // across edits; mint one only for a genuinely new row.
    let id = text(formData, `script.${i}.id`) ?? crypto.randomUUID();
    while (seenIds.has(id)) id = crypto.randomUUID();
    seenIds.add(id);

    scripts.push({
      id,
      name: name ?? 'Untitled script',
      // src wins if both were filled in — matches the read-side normaliser.
      ...(src ? { src } : { code }),
      strategy,
      enabled: formData.get(`script.${i}.enabled`) === 'on',
    });
  }

  return scripts.length ? scripts : undefined;
}

function assertAdmin(): void {
  // The layout already 404s in production, but a Server Action is its own
  // endpoint — it has to check for itself, or the form's POST target stays
  // live even though nothing renders the form.
  if (!isAdminEnabled()) notFound();
}

export async function savePageSeoAction(formData: FormData): Promise<void> {
  assertAdmin();

  const page = findNativePageById(String(formData.get('pageId') ?? ''));
  if (!page) notFound();

  const openGraph = {
    title: text(formData, 'ogTitle'),
    description: text(formData, 'ogDescription'),
    image: text(formData, 'ogImage'),
  };
  const hasOpenGraph = Object.values(openGraph).some(Boolean);

  const seo: PageSeo = {
    title: text(formData, 'title'),
    description: text(formData, 'description'),
    keywords: parseKeywords(text(formData, 'keywords')),
    canonical: text(formData, 'canonical'),
    robots: parseRobots(text(formData, 'robots')),
    ...(hasOpenGraph ? { openGraph } : {}),
    scripts: parseScripts(formData),
    updatedAt: new Date().toISOString(),
  };

  await savePageSeo(page.path, seo);
  updateTag(CACHE_TAGS.SEO);

  redirect(`${ADMIN_ROUTES.PAGE_CONFIGURATOR_EDIT(page.id)}?status=saved`);
}

export async function resetPageSeoAction(formData: FormData): Promise<void> {
  assertAdmin();

  const page = findNativePageById(String(formData.get('pageId') ?? ''));
  if (!page) notFound();

  await deletePageSeo(page.path);
  updateTag(CACHE_TAGS.SEO);

  redirect(`${ADMIN_ROUTES.PAGE_CONFIGURATOR_EDIT(page.id)}?status=reset`);
}
