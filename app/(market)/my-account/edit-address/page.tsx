import { ROUTES } from '@/config/routes'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { resolvePageMetadata } from '@/lib/seo'
import { AccountPageShell } from '../_components/AccountPageShell'
import { AddressForm } from './_components/AddressForm'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.ACCOUNT.EDIT_ADDRESS)
}

export default function EditAddressPage() {
  return (
    <div className="bg-white px-[5%] py-10 sm:py-14 dark:bg-gray-900">
      <PageHeadScripts path={ROUTES.ACCOUNT.EDIT_ADDRESS} />
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-theme-dark mb-8 sm:mb-12 dark:text-white">
          My Account
        </h1>

        <AccountPageShell title="Addresses">
          <p className="mb-5 max-w-2xl text-sm text-theme-muted dark:text-gray-400">
            The following addresses will be used on the checkout page by default.
          </p>
          <AddressForm />
        </AccountPageShell>
      </div>
    </div>
  )
}
