import { ROUTES } from '@/config/routes'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { resolvePageMetadata } from '@/lib/seo'
import { LogoutHandler } from './_components/LogoutHandler'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.ACCOUNT.LOGOUT)
}

export default function LogoutPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-white px-[5%] py-10 dark:bg-gray-900">
      <PageHeadScripts path={ROUTES.ACCOUNT.LOGOUT} />
      <LogoutHandler />
    </div>
  )
}
