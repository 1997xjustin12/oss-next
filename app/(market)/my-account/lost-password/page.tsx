import type { Metadata } from 'next'
import { ROUTES } from '@/config/routes'
import { LostPasswordForm } from './_components/LostPasswordForm'

const TITLE = 'Lost Password'
const DESCRIPTION =
  'Reset your On-Site Storage Solutions account password. Enter your username or email address and we will send you a link to create a new password.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: ROUTES.ACCOUNT.LOST_PASSWORD },
  openGraph: { title: TITLE, description: DESCRIPTION, images: ['/images/logo/oss-logo.webp'] },
  robots: { index: false, follow: true },
}

export default function LostPasswordPage() {
  return (
    <div className="bg-white px-[5%] py-10 sm:py-14 dark:bg-gray-900">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-theme-dark mb-8 sm:mb-12 dark:text-white">
          My Account
        </h1>
        <LostPasswordForm />
      </div>
    </div>
  )
}
