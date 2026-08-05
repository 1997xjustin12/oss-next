import { HOME_HEADING_DEFAULTS } from '@/config/homeContent';
import { ROUTES } from '@/config/routes';
import { getPageContent } from '@/services/content.service';

// Merges a page's shipped heading text with whatever the admin Content Editor
// has saved. Precedence is admin override → component default; a blank field is
// "leave it alone", never "blank the heading".

export type Headings = Record<string, string>;

/**
 * Every homepage heading, resolved.
 *
 * Safe to call from a Server Component: the only I/O is `getPageContent`, a
 * `'use cache'` read, so the page stays prerenderable.
 */
export async function getHomeHeadings(): Promise<Headings> {
  const content = await getPageContent(ROUTES.HOME);
  return { ...HOME_HEADING_DEFAULTS, ...(content?.headings ?? {}) };
}
