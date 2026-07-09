'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export function LogoutHandler() {
  const { logout } = useAuth()
  const router = useRouter()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    logout()
    router.replace('/my-account')
  }, [logout, router])

  return <p className="text-sm text-theme-muted dark:text-gray-400">Logging out…</p>
}
