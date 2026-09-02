import { ROUTES } from '@/config/routes'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { resolvePageMetadata } from '@/lib/seo'
import { SavedQuotesList } from './_components/SavedQuotesList'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.SAVED_QUOTES)
}

export default function SavedQuotesPage() {
  return (
    <>
      <PageHeadScripts path={ROUTES.SAVED_QUOTES} />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-theme-dark dark:text-white sm:text-3xl">
            Saved quotes
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-theme-muted">
            Every quote you have saved, with the price and delivery it had at the
            time.
          </p>
        </header>
        <SavedQuotesList />
      </main>
    </>
  )
}
