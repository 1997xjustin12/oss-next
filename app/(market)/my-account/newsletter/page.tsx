import { ROUTES } from '@/config/routes'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { resolvePageMetadata } from '@/lib/seo'
import { AccountPageShell } from '../_components/AccountPageShell'
import { NewsletterPanel } from './_components/NewsletterPanel'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.ACCOUNT.NEWSLETTER)
}

export default function NewsletterPage() {
  return (
    <div className="bg-white px-[5%] py-10 sm:py-14 dark:bg-gray-900">
      <PageHeadScripts path={ROUTES.ACCOUNT.NEWSLETTER} />
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-theme-dark sm:mb-12 sm:text-4xl dark:text-white">
          My Account
        </h1>

        <AccountPageShell title="Newsletter">
          <NewsletterPanel />
        </AccountPageShell>
      </div>
    </div>
  )
}
