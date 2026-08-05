import { ROUTES } from '@/config/routes'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { resolvePageMetadata } from '@/lib/seo'
import { LostPasswordForm } from './_components/LostPasswordForm'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.ACCOUNT.LOST_PASSWORD)
}

export default function LostPasswordPage() {
  return (
    <div className="bg-white px-[5%] py-10 sm:py-14 dark:bg-gray-900">
      <PageHeadScripts path={ROUTES.ACCOUNT.LOST_PASSWORD} />
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-theme-dark mb-8 sm:mb-12 dark:text-white">
          My Account
        </h1>
        <LostPasswordForm />
      </div>
    </div>
  )
}
