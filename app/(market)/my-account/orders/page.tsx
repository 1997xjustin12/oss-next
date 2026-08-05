import { ROUTES } from '@/config/routes'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { resolvePageMetadata } from '@/lib/seo'
import { AccountPageShell } from '../_components/AccountPageShell'
import { OrdersList } from './_components/OrdersList'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.ACCOUNT.ORDERS)
}

export default function OrdersPage() {
  return (
    <div className="bg-white px-[5%] py-10 sm:py-14 dark:bg-gray-900">
      <PageHeadScripts path={ROUTES.ACCOUNT.ORDERS} />
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-theme-dark mb-8 sm:mb-12 dark:text-white">
          My Account
        </h1>

        <AccountPageShell title="Orders">
          <OrdersList />
        </AccountPageShell>
      </div>
    </div>
  )
}
