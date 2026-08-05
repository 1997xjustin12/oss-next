import type { Metadata } from 'next';

// Per-page SEO overrides authored in the admin Page Configurator and stored in
// Redis. Every field is optional: an unset field falls back to the page's
// built-in default in config/pageSeoDefaults.ts, so a blank record changes
// nothing.

/**
 * Loading strategy for an admin-authored page script.
 *
 * `beforeInteractive` is deliberately absent — next/script only honours it from
 * the root layout, so offering it per-page would silently do the wrong thing.
 */
export type ScriptStrategy = 'afterInteractive' | 'lazyOnload';

export type HeadScript = {
  /** Stable id — used as the next/script `id` and as the React key. */
  id: string;
  /** Author-facing name, e.g. "Meta Pixel". Never rendered to the page. */
  name: string;
  /** External script URL. Mutually exclusive with `code`. */
  src?: string;
  /** Inline script body. Mutually exclusive with `src`. */
  code?: string;
  strategy: ScriptStrategy;
  /** Lets you park a script without deleting it. */
  enabled: boolean;
};

export type SeoRobots = {
  index: boolean;
  follow: boolean;
};

export type SeoOpenGraph = {
  title?: string;
  description?: string;
  /** Single absolute or root-relative image path. */
  image?: string;
};

export type PageSeo = {
  title?: string;
  description?: string;
  /** Rendered as <meta name="keywords">. */
  keywords?: string[];
  /** Overrides alternates.canonical. Root-relative or absolute. */
  canonical?: string;
  robots?: SeoRobots;
  openGraph?: SeoOpenGraph;
  scripts?: HeadScript[];
  /** ISO timestamp of the last admin save. */
  updatedAt?: string;
};

/**
 * A page's built-in SEO copy — the fallback layer beneath `PageSeo`.
 *
 * Lives in config/pageSeoDefaults.ts rather than in each page.tsx so the admin
 * can render these values as the placeholder behind every field.
 */
export type PageSeoDefaults = {
  title: string;
  description: string;
  /** Root-relative path, e.g. ROUTES.CART. Resolved against metadataBase. */
  canonical: string;
  keywords?: string[];
  robots?: SeoRobots;
  openGraph?: {
    title?: string;
    description?: string;
    /** Object form carries og:image:width/height, which crawlers prefer. */
    images?: (string | { url: string; width?: number; height?: number })[];
    type?: 'website' | 'article';
    url?: string;
  };
  twitter?: Metadata['twitter'];
};

/** The URL of a defaults image, whichever form it was written in. */
export function ogImageUrl(
  image: string | { url: string } | undefined,
): string | undefined {
  if (!image) return undefined;
  return typeof image === 'string' ? image : image.url;
}
