import { FileDown } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { resolvePageMetadata } from '@/lib/seo'
import { AccountPageShell } from '../_components/AccountPageShell'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.ACCOUNT.DOWNLOADS)
}

export default function DownloadsPage() {
  return (
    <div className="bg-white px-[5%] py-10 sm:py-14 dark:bg-gray-900">
      <PageHeadScripts path={ROUTES.ACCOUNT.DOWNLOADS} />
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-theme-dark mb-8 sm:mb-12 dark:text-white">
          My Account
        </h1>

        <AccountPageShell title="Downloads">
          <div
            className="flex flex-col items-center gap-3 rounded-md border border-theme-border bg-theme-subtle px-6 py-12 text-center
                       dark:border-gray-700 dark:bg-gray-800"
          >
            <FileDown className="h-8 w-8 text-theme-muted dark:text-gray-500" />
            <p className="text-sm text-theme-muted dark:text-gray-400">No downloads available yet.</p>
          </div>
        </AccountPageShell>
      </div>
    </div>
  )
}
