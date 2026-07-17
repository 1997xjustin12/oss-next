import type { Metadata } from 'next'
import { ROUTES } from '@/config/routes'
import { LogoutHandler } from './_components/LogoutHandler'

const TITLE = 'Logout'
const DESCRIPTION = 'Log out of your On-Site Storage Solutions account.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: ROUTES.ACCOUNT.LOGOUT },
  openGraph: { title: TITLE, description: DESCRIPTION, images: ['/images/logo/oss-logo.webp'] },
  robots: { index: false, follow: true },
}

export default function LogoutPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-white px-[5%] py-10 dark:bg-gray-900">
      <LogoutHandler />
    </div>
  )
}
