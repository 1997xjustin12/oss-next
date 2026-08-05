// Sidenav for the admin section. One entry for now; add to this list and the
// nav picks it up — nothing else needs touching.
//
// `icon` is a key rather than a component so this stays a plain data module
// importable from both Server and Client Components.
//
// Everything sits under a real `/admin` segment rather than a `(admin)` route
// group. A route group would keep these URLs at the site root (/page-configurator),
// which reads like a storefront page and would force the production gate in
// lib/admin.ts to track one path per section instead of a single prefix.

export const ADMIN_ROUTES = {
  ROOT: '/admin',
  PAGE_CONFIGURATOR: '/admin/page-configurator',
  PAGE_CONFIGURATOR_EDIT: (id: string) => `/admin/page-configurator/${id}`,
  CONTENT_EDITOR: '/admin/content-editor',
  CONTENT_EDITOR_EDIT: (id: string) => `/admin/content-editor/${id}`,
} as const;

export type AdminNavItem = {
  href: string;
  label: string;
  icon: 'FileCog' | 'Type';
  /** One line in the sidenav clarifying what this edits. */
  hint: string;
};

// The split between these two is worth keeping sharp, because "title" means
// something different in each: Page Configurator edits what crawlers and social
// cards read, Content Editor edits what a visitor reads on the page.
export const ADMIN_NAV: readonly AdminNavItem[] = [
  {
    href: ADMIN_ROUTES.PAGE_CONFIGURATOR,
    label: 'Page Configurator',
    icon: 'FileCog',
    hint: 'Meta tags & scripts',
  },
  {
    href: ADMIN_ROUTES.CONTENT_EDITOR,
    label: 'Content Editor',
    icon: 'Type',
    hint: 'On-page headings',
  },
];

/**
 * Upper bound on script rows per page. The form renders one blank row past the
 * saved ones, and the save action scans up to this many indexes — they must
 * agree, or a row past the action's limit would be silently dropped on save.
 */
export const MAX_PAGE_SCRIPTS = 24;
