import type { Metadata } from 'next'
import { AccountPageShell } from '../_components/AccountPageShell'
import { AccountDetailsForm } from './_components/AccountDetailsForm'

const TITLE = 'Account Details'
const DESCRIPTION = 'Edit your profile and password on On-Site Storage Solutions.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/my-account/edit-account' },
  openGraph: { title: TITLE, description: DESCRIPTION, images: ['/images/logo/oss-logo.webp'] },
  robots: { index: false, follow: true },
}

export default function EditAccountPage() {
  return (
    <main className="bg-white px-[5%] py-10 sm:py-14 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-theme-dark mb-8 sm:mb-12 dark:text-white">
          My Account
        </h1>

        <AccountPageShell title="Account details">
          <AccountDetailsForm />
        </AccountPageShell>
      </div>
    </main>
  )
}
