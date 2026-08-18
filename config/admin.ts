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
  AGENT_TRAFFIC: '/admin/agent-traffic',
  QUOTE_REQUESTS: '/admin/quote-requests',
} as const;

export type AdminNavItem = {
  href: string;
  label: string;
  icon: 'FileCog' | 'Type' | 'Bot' | 'Inbox';
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
  {
    href: ADMIN_ROUTES.AGENT_TRAFFIC,
    label: 'Agent Traffic',
    icon: 'Bot',
    hint: 'Which AI crawlers visit',
  },
  {
    href: ADMIN_ROUTES.QUOTE_REQUESTS,
    label: 'Quote Requests',
    icon: 'Inbox',
    hint: 'Leads submitted by agents',
  },
];

/**
 * Upper bound on script rows per page. The form renders one blank row past the
 * saved ones, and the save action scans up to this many indexes — they must
 * agree, or a row past the action's limit would be silently dropped on save.
 */
export const MAX_PAGE_SCRIPTS = 24;

/**
 * Who may reach /admin.
 *
 * This is the list to edit when someone joins or leaves — the gate logic in
 * lib/admin.ts reads it and needs no changes. Entries may be either a username
 * or an email address; both are compared against the identity the backend
 * returns after it has authenticated the password, never against anything the
 * browser sent.
 *
 * Being on this list grants nothing on its own. A visitor still has to log in
 * through the storefront form at /my-account with a working password; the list
 * only decides whether that successful login also mints an admin session.
 */
export const ADMIN_USERNAMES: readonly string[] = [
  'denver@onsitestorage.com',
  'denver_admin',
  'onsite_jhie',
  'onsite_justin',
  'oss_aira',
];

/**
 * How long an admin session lasts before the user has to log in again.
 *
 * Matched to the `isLoggedIn` cookie the storefront login already sets, so both
 * expire together — an admin whose storefront session is alive but whose admin
 * cookie quietly expired would just get 404s with no explanation.
 */
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
