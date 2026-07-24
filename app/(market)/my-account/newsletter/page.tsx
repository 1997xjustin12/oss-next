import type { Metadata } from 'next'
import { ROUTES } from '@/config/routes'
import { AccountPageShell } from '../_components/AccountPageShell'
import { NewsletterPanel } from './_components/NewsletterPanel'

const TITLE = 'Newsletter'
const DESCRIPTION = 'Manage your newsletter subscription with On-Site Storage Solutions.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: ROUTES.ACCOUNT.NEWSLETTER },
  openGraph: { title: TITLE, description: DESCRIPTION, images: ['/images/logo/oss-logo.webp'] },
  robots: { index: false, follow: true },
}

export default function NewsletterPage() {
  return (
    <div className="bg-white px-[5%] py-10 sm:py-14 dark:bg-gray-900">
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
