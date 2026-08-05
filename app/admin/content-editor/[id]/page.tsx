import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ExternalLink, RotateCcw } from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/admin';
import { CONTENT_PAGES, findContentPageById } from '@/config/homeContent';
import { STORE_KEY } from '@/config/store';
import { contentKey, getPageContent } from '@/services/content.service';
import { ContentForm } from './_components/ContentForm';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
};

export function generateStaticParams() {
  return CONTENT_PAGES.map((page) => ({ id: page.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const page = findContentPageById(id);
  return {
    title: page ? page.label : 'Content Editor',
    robots: { index: false, follow: false },
  };
}

export default function ContentEditorEditPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <Editor params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Editor({ params, searchParams }: Props) {
  const { id } = await params;
  const page = findContentPageById(id);
  if (!page) notFound();

  const [content, { status }] = await Promise.all([getPageContent(page.path), searchParams]);

  return (
    <>
      <Link
        href={ADMIN_ROUTES.CONTENT_EDITOR}
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
          <span className="font-mono">{contentKey(page.path)}</span>
        </p>
      </header>

      {status === 'saved' && (
        <p
          role="status"
          className="mb-6 flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          Saved to <span className="font-mono text-xs">{STORE_KEY}</span>. The live page is already
          showing this copy.
        </p>
      )}

      {status === 'reset' && (
        <p
          role="status"
          className="mb-6 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-400"
        >
          <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />
          Headings cleared. This page is back to its shipped copy.
        </p>
      )}

      <ContentForm page={page} content={content} />
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
          className="h-56 rounded-lg border border-theme-border bg-theme-bg dark:border-neutral-800 dark:bg-neutral-900"
        />
      ))}
    </div>
  );
}
