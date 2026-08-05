import { ROUTES } from '@/config/routes'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { resolvePageMetadata } from '@/lib/seo'
import { AccountPageShell } from '../_components/AccountPageShell'
import { AccountDetailsForm } from './_components/AccountDetailsForm'
import { ChangePasswordForm } from './_components/ChangePasswordForm'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.ACCOUNT.EDIT_ACCOUNT)
}

export default function EditAccountPage() {
  return (
    <div className="bg-white px-[5%] py-10 sm:py-14 dark:bg-gray-900">
      <PageHeadScripts path={ROUTES.ACCOUNT.EDIT_ACCOUNT} />
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-theme-dark mb-8 sm:mb-12 dark:text-white">
          My Account
        </h1>

        <AccountPageShell title="Account details">
          <AccountDetailsForm />

          <div className="mt-10 max-w-xl border-t border-theme-border pt-8 dark:border-gray-700">
            <h2 className="mb-5 text-xl font-bold text-theme-dark dark:text-white">Change password</h2>
            <ChangePasswordForm />
          </div>
        </AccountPageShell>
      </div>
    </div>
  )
}
