// Visible on-page copy authored in the admin Content Editor and stored in
// Redis. Distinct from types/seo.ts, which covers the invisible metadata a
// crawler reads — this is what a visitor actually reads.

/**
 * Heading text may carry accent markers: `What Our [[Customers]] Say` renders
 * the bracketed run in the section's accent colour.
 *
 * A marker rather than raw HTML, so the editor stays a plain text field that
 * cannot inject markup or break the layout, while the design's emphasis
 * survives an edit. See components/shared/AccentText.tsx for the renderer.
 */
export const ACCENT_PATTERN = /\[\[(.+?)\]\]/g;

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';

export type PageContent = {
  /** Heading key (see config/homeContent.ts) → authored text. */
  headings?: Record<string, string>;
  /** ISO timestamp of the last admin save. */
  updatedAt?: string;
};
