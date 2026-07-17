'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/config/routes'

export function LogoutHandler() {
  const { logout } = useAuth()
  const router = useRouter()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    logout()
    router.replace(ROUTES.ACCOUNT.ROOT)
  }, [logout, router])

  return <p className="text-sm text-theme-muted dark:text-gray-400">Logging out…</p>
}
