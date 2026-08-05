import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Type } from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/admin';
import { CONTENT_PAGES } from '@/config/homeContent';
import { STORE_KEY } from '@/config/store';
import { getPageContent } from '@/services/content.service';

export const metadata: Metadata = {
  title: 'Content Editor',
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

export default async function ContentEditorPage() {
  const records = await Promise.all(
    CONTENT_PAGES.map(async (page) => ({
      page,
      content: await getPageContent(page.path),
    })),
  );

  return (
    <>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Content Editor</h1>
        <p className="mt-2 max-w-2xl text-sm text-theme-muted dark:text-neutral-400">
          Edit the headings visitors actually read on the page. For meta titles, descriptions and
          social cards — the text search engines read — use the Page Configurator instead. Editing{' '}
          <span className="font-semibold text-theme-dark dark:text-neutral-200">{STORE_KEY}</span>.
        </p>
      </header>

      <ul className="overflow-hidden rounded-lg border border-theme-border bg-theme-bg dark:border-neutral-800 dark:bg-neutral-900">
        {records.map(({ page, content }) => {
          const edited = Object.keys(content?.headings ?? {}).length;

          return (
            <li
              key={page.id}
              className="border-b border-theme-border last:border-b-0 dark:border-neutral-800"
            >
              <Link
                href={ADMIN_ROUTES.CONTENT_EDITOR_EDIT(page.id)}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-theme-subtle focus-visible:bg-theme-subtle focus-visible:outline-none dark:hover:bg-neutral-800/60 dark:focus-visible:bg-neutral-800/60"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold">{page.label}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-theme-subtle px-2 py-0.5 text-[11px] font-semibold text-theme-muted dark:bg-neutral-800 dark:text-neutral-400">
                      <Type className="h-3 w-3" aria-hidden="true" />
                      {page.headings.length} headings
                    </span>
                    {edited > 0 && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400">
                        {edited} customised
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-theme-muted dark:text-neutral-500">
                    <span className="font-mono">{page.path}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatUpdated(content?.updatedAt)}</span>
                  </p>
                </div>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-theme-muted dark:text-neutral-600"
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
