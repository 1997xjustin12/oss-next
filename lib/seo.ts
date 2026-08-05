import type { Metadata } from 'next';
import { PAGE_SEO_DEFAULTS } from '@/config/pageSeoDefaults';
import { getPageSeo } from '@/services/seo.service';
import type { PageSeoDefaults } from '@/types/seo';

// Merges a page's built-in SEO copy with the overrides authored in the admin
// Page Configurator, and hands the result to Next as a Metadata object.
//
// Precedence is always: admin override → page default → global fallback. A
// blank field in the admin form is not an override, it's "leave it alone" —
// which is what makes the configurator safe to save from with fields empty.

/** Used when neither the override nor the page supplies an OG image. */
const FALLBACK_OG_IMAGE = '/images/logo/oss-logo.webp';

export type { PageSeoDefaults };

/**
 * Builds the final Metadata for a native page.
 *
 * Safe to call directly from `generateMetadata`: the only I/O is `getPageSeo`,
 * which is a `'use cache'` read, so the page stays prerenderable and no dynamic
 * marker is needed (see generate-metadata.md § With Cache Components).
 *
 * @param path      The page's live path — its key in both registries.
 * @param defaults  Overrides the static defaults for this path. Pages whose
 *                  metadata varies per request (the PLP's location, the blog
 *                  index's search term) pass their computed copy here; an admin
 *                  override still wins over it.
 */
export async function resolvePageMetadata(
  path: string,
  defaults: PageSeoDefaults = PAGE_SEO_DEFAULTS[path],
): Promise<Metadata> {
  if (!defaults) {
    throw new Error(
      `[seo] no defaults registered for "${path}" — add it to config/pageSeoDefaults.ts (and config/pages.ts).`,
    );
  }

  const override = await getPageSeo(path);

  const title = override?.title || defaults.title;
  const description = override?.description || defaults.description;
  const canonical = override?.canonical || defaults.canonical;
  const keywords = override?.keywords?.length ? override.keywords : defaults.keywords;
  const robots = override?.robots ?? defaults.robots;

  const ogImage = override?.openGraph?.image;
  const images = ogImage ? [ogImage] : (defaults.openGraph?.images ?? [FALLBACK_OG_IMAGE]);

  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical },
    ...(robots ? { robots } : {}),
    openGraph: {
      title: override?.openGraph?.title || defaults.openGraph?.title || title,
      description:
        override?.openGraph?.description || defaults.openGraph?.description || description,
      ...(defaults.openGraph?.type ? { type: defaults.openGraph.type } : {}),
      ...(defaults.openGraph?.url ? { url: defaults.openGraph.url } : {}),
      images,
    },
    ...(defaults.twitter ? { twitter: defaults.twitter } : {}),
  };
}
