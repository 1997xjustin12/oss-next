'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/config/routes'
import { AccountLayout } from './AccountLayout'

type Props = {
  title: string
  children: React.ReactNode
}

// Auth session lives in localStorage (client-only), so it isn't known during
// SSR. Wait for hydration before deciding to redirect, otherwise a logged-in
// user gets bounced for one frame on every load.
export function AccountPageShell({ title, children }: Props) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) router.replace(ROUTES.ACCOUNT.ROOT)
  }, [mounted, isAuthenticated, router])

  if (!mounted || !isAuthenticated) return null

  return (
    <AccountLayout>
      <h2 className="mb-5 text-xl font-bold text-theme-dark dark:text-white">{title}</h2>
      {children}
    </AccountLayout>
  )
}
