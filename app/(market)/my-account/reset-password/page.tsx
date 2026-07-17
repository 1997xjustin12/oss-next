import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ROUTES } from '@/config/routes'
import { ResetPasswordForm } from './_components/ResetPasswordForm'
import { ResetPasswordFormSkeleton } from './_components/ResetPasswordFormSkeleton'

const TITLE = 'Reset Password'
const DESCRIPTION = 'Create a new password for your On-Site Storage Solutions account.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: ROUTES.ACCOUNT.RESET_PASSWORD },
  openGraph: { title: TITLE, description: DESCRIPTION, images: ['/images/logo/oss-logo.webp'] },
  robots: { index: false, follow: true },
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-white px-[5%] py-10 sm:py-14 dark:bg-gray-900">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-theme-dark mb-8 sm:mb-12 dark:text-white">
          My Account
        </h1>
        <Suspense fallback={<ResetPasswordFormSkeleton />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
