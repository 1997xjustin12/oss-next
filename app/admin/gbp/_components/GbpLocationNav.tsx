import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ADMIN_ROUTES } from '@/config/admin'

type Props = { slug: string; label: string; current: 'content' | 'seo'; live: boolean }

/** The heading and the Content / SEO tabs of one location's screens. */
export function GbpLocationNav({ slug, label, current, live }: Props) {
  const tab = (key: 'content' | 'seo', text: string, href: string) => (
    <Link
      href={href}
      aria-current={current === key ? 'page' : undefined}
      className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
        current === key ? 'bg-theme-dark text-white dark:bg-neutral-100 dark:text-neutral-900' : 'text-theme-mid hover:bg-theme-subtle dark:text-neutral-300 dark:hover:bg-neutral-800'
      }`}
    >
      {text}
    </Link>
  )
  return (
    <header className="mb-5">
      <Link href={ADMIN_ROUTES.GBP} className="inline-flex items-center gap-1 text-sm text-theme-muted hover:text-theme-dark dark:text-neutral-400">
        <ArrowLeft className="h-4 w-4" />
        GBP Pages
      </Link>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{label}</h1>
      <p className="mt-1 text-sm text-theme-muted dark:text-neutral-400">
        /{slug} · {live ? 'Live (this app)' : 'Not live yet: still served by WordPress'}
      </p>
      <nav aria-label="Location screens" className="mt-3 flex gap-2">
        {tab('content', 'Content', ADMIN_ROUTES.GBP_CONTENT(slug))}
        {tab('seo', 'SEO, schema & scripts', ADMIN_ROUTES.GBP_SEO(slug))}
      </nav>
      <p className="mt-2 text-xs text-theme-muted dark:text-neutral-500">
        Content and SEO share one draft for this location: Publish on either screen publishes both.
      </p>
    </header>
  )
}
