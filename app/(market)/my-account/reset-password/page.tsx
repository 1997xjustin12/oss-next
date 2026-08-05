import { Suspense } from 'react'
import { ROUTES } from '@/config/routes'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { resolvePageMetadata } from '@/lib/seo'
import { ResetPasswordForm } from './_components/ResetPasswordForm'
import { ResetPasswordFormSkeleton } from './_components/ResetPasswordFormSkeleton'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.ACCOUNT.RESET_PASSWORD)
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-white px-[5%] py-10 sm:py-14 dark:bg-gray-900">
      <PageHeadScripts path={ROUTES.ACCOUNT.RESET_PASSWORD} />
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
