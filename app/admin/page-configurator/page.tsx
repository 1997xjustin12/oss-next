import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Globe, EyeOff, Code2 } from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/admin';
import { NATIVE_PAGES, PAGE_GROUPS } from '@/config/pages';
import { STORE_KEY } from '@/config/store';
import { getAllPageSeo } from '@/services/seo.service';
import type { PageSeo } from '@/types/seo';

export const metadata: Metadata = {
  title: 'Page Configurator',
  robots: { index: false, follow: false },
};

function formatUpdated(iso: string | undefined): string {
  if (!iso) return 'Never edited';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Never edited';
  return `Edited ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

/** Whether anything was actually authored, ignoring the bookkeeping timestamp. */
function isCustomised(seo: PageSeo | null): boolean {
  if (!seo) return false;
  return Boolean(
    seo.title ||
      seo.description ||
      seo.keywords?.length ||
      seo.canonical ||
      seo.robots ||
      seo.openGraph?.title ||
      seo.openGraph?.description ||
      seo.openGraph?.image ||
      seo.scripts?.length,
  );
}

export default async function PageConfiguratorPage() {
  const overrides = await getAllPageSeo();

  return (
    <>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Page Configurator</h1>
        <p className="mt-2 max-w-2xl text-sm text-theme-muted dark:text-neutral-400">
          Override the SEO title, description, keywords, social tags and page scripts for this
          app&apos;s own pages. Settings are stored per store — you are editing{' '}
          <span className="font-semibold text-theme-dark dark:text-neutral-200">{STORE_KEY}</span>.
          Anything left blank falls back to the page&apos;s built-in defaults.
        </p>
      </header>

      <div className="space-y-8">
        {PAGE_GROUPS.map((group) => {
          const pages = NATIVE_PAGES.filter((page) => page.group === group);
          if (pages.length === 0) return null;

          return (
            <section key={group} aria-labelledby={`group-${group}`}>
              <h2
                id={`group-${group}`}
                className="mb-2 text-xs font-bold tracking-wider text-theme-muted uppercase dark:text-neutral-500"
              >
                {group}
              </h2>

              <ul className="overflow-hidden rounded-lg border border-theme-border bg-theme-bg dark:border-neutral-800 dark:bg-neutral-900">
                {pages.map((page) => {
                  const seo = overrides[page.path] ?? null;
                  const customised = isCustomised(seo);
                  const scriptCount = seo?.scripts?.length ?? 0;

                  return (
                    <li
                      key={page.id}
                      className="border-b border-theme-border last:border-b-0 dark:border-neutral-800"
                    >
                      <Link
                        href={ADMIN_ROUTES.PAGE_CONFIGURATOR_EDIT(page.id)}
                        className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-theme-subtle focus-visible:bg-theme-subtle focus-visible:outline-none dark:hover:bg-neutral-800/60 dark:focus-visible:bg-neutral-800/60"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-sm font-semibold">{page.label}</span>

                            {customised ? (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400">
                                Custom
                              </span>
                            ) : (
                              <span className="rounded-full bg-theme-subtle px-2 py-0.5 text-[11px] font-semibold text-theme-muted dark:bg-neutral-800 dark:text-neutral-400">
                                Default
                              </span>
                            )}

                            {scriptCount > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800 dark:bg-sky-500/15 dark:text-sky-400">
                                <Code2 className="h-3 w-3" aria-hidden="true" />
                                {scriptCount}
                              </span>
                            )}
                          </div>

                          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-theme-muted dark:text-neutral-500">
                            <span className="font-mono">{page.path}</span>
                            <span aria-hidden="true">·</span>
                            <span>{formatUpdated(seo?.updatedAt)}</span>
                          </p>
                        </div>

                        <span
                          className="hidden shrink-0 items-center gap-1 text-xs text-theme-muted sm:flex dark:text-neutral-500"
                          title={page.indexable ? 'Indexable by search engines' : 'Not indexed'}
                        >
                          {page.indexable ? (
                            <>
                              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                              Indexed
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                              No-index
                            </>
                          )}
                        </span>

                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-theme-muted dark:text-neutral-600"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
