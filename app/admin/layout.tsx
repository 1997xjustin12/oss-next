import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ShieldAlert } from 'lucide-react';
import { STORE_KEY, STORE_LABELS } from '@/config/store';
import { hasAdminAccess } from '@/lib/adminGuard';
import { AdminNav } from './_components/AdminNav';

// Admin shell. Deliberately does NOT reuse the (market) chrome — no storefront
// header, nav or footer — so admin screens can't be mistaken for public pages.
//
// The gate is three layers: proxy.ts 404s the path outright (that's the one
// users actually hit, and the one that returns a real 404 status), the Server
// Actions re-check for themselves because a form's POST target is its own
// endpoint, and this layout refuses to render the UI.
//
// This layer renders a dead page rather than calling notFound(). A throw here
// would fire during prerender and dump a NEXT_HTTP_ERROR_FALLBACK;404 stack for
// every admin route into every production build — noise that would hide real
// build errors. The status code is the proxy's job anyway; this layer's only
// job is to make sure no admin markup or data ever reaches a response that
// shouldn't carry it.
//
// Reading the session cookie makes every admin route dynamic. That is correct
// rather than merely tolerable: an admin page's output now depends on who is
// asking, so caching one copy across requests would be a bug. cacheComponents
// requires that read to sit inside a <Suspense> boundary, which is why the gate
// is a child component rather than the body of the layout itself — the layout
// stays statically prerenderable and only the gate streams in.
//
// The fallback deliberately shows nothing but a blank frame. It is what a
// non-admin would briefly see, so it must not hint at what lies behind it.

export const metadata: Metadata = {
  title: {
    default: 'Admin',
    template: '%s | Admin',
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-theme-subtle dark:bg-neutral-950" />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

async function AdminGate({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!(await hasAdminAccess())) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="text-sm text-theme-muted dark:text-neutral-500">
          This page is not available.
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-theme-subtle text-theme-dark dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <header className="border-b border-theme-border bg-theme-bg lg:min-h-screen lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-col gap-4 p-4 lg:sticky lg:top-0 lg:gap-6 lg:p-5">
            <div>
              <p className="text-sm font-extrabold tracking-tight">Store Admin</p>
              <p className="mt-0.5 truncate text-xs text-theme-muted dark:text-neutral-500">
                {STORE_LABELS[STORE_KEY]}
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
                <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                Admins only · {STORE_KEY}
              </span>
            </div>

            <nav aria-label="Admin sections">
              <AdminNav />
            </nav>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
