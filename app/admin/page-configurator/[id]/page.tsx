import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ExternalLink, RotateCcw } from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/admin';
import { NATIVE_PAGES, findNativePageById } from '@/config/pages';
import { PAGE_SEO_DEFAULTS } from '@/config/pageSeoDefaults';
import { STORE_KEY } from '@/config/store';
import { getPageSeo, seoKey } from '@/services/seo.service';
import { SeoForm } from './_components/SeoForm';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
};

// The set of editable pages is fixed and known at build time, so prerender all
// of them rather than rendering each on first visit.
//
// An unknown id still answers 200 with the 404 body: `notFound()` fires inside
// the Suspense boundary below, by which point the shell has been flushed and
// the status can no longer change. `dynamicParams = false` would fix that, but
// cacheComponents rejects that segment config. Same trade-off the storefront's
// /blogs/[slug] already makes, and the ids here only ever come from the list
// page's own links.
export function generateStaticParams() {
  return NATIVE_PAGES.map((page) => ({ id: page.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const page = findNativePageById(id);
  return {
    title: page ? page.label : 'Page Configurator',
    robots: { index: false, follow: false },
  };
}

export default function PageConfiguratorEditPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <Editor params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Editor({ params, searchParams }: Props) {
  const { id } = await params;
  const page = findNativePageById(id);
  if (!page) notFound();

  const defaults = PAGE_SEO_DEFAULTS[page.path];
  if (!defaults) notFound();

  const [seo, { status }] = await Promise.all([getPageSeo(page.path), searchParams]);

  return (
    <>
      <Link
        href={ADMIN_ROUTES.PAGE_CONFIGURATOR}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-theme-muted transition-colors hover:text-theme-dark dark:text-neutral-500 dark:hover:text-neutral-200"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All pages
      </Link>

      <header className="mt-3 mb-6 sm:mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{page.label}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-theme-muted dark:text-neutral-500">
          <Link
            href={page.path}
            className="inline-flex items-center gap-1 font-mono underline-offset-2 hover:underline"
          >
            {page.path}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Link>
          <span aria-hidden="true">·</span>
          <span className="font-mono">{seoKey(page.path)}</span>
        </p>
      </header>

      {status === 'saved' && (
        <p
          role="status"
          className="mb-6 flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          Saved to <span className="font-mono text-xs">{STORE_KEY}</span>. The live page is already
          serving these values.
        </p>
      )}

      {status === 'reset' && (
        <p
          role="status"
          className="mb-6 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-400"
        >
          <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />
          Overrides cleared. This page is back to its built-in defaults.
        </p>
      )}

      <SeoForm page={page} seo={seo} defaults={defaults} />
    </>
  );
}

function EditorSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-4 w-24 rounded bg-theme-border dark:bg-neutral-800" />
      <div className="h-9 w-64 rounded bg-theme-border dark:bg-neutral-800" />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-64 rounded-lg border border-theme-border bg-theme-bg dark:border-neutral-800 dark:bg-neutral-900"
        />
      ))}
    </div>
  );
}
