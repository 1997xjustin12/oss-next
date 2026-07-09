import type { Metadata } from 'next'
import { AccountView } from './_components/AccountView'

const TITLE = 'My Account'
const DESCRIPTION =
  'Log in to your On-Site Storage Solutions account or register for exclusive discounts, live inventory access, and dedicated support.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/my-account' },
  openGraph: { title: TITLE, description: DESCRIPTION, images: ['/images/logo/oss-logo.webp'] },
  robots: { index: false, follow: true },
}

export default function MyAccountPage() {
  return (
    <main className="bg-white px-[5%] py-10 sm:py-14 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-theme-dark mb-8 sm:mb-12 dark:text-white">
          My Account
        </h1>
        <AccountView />
      </div>
    </main>
  )
}
