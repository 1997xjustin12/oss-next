'use client'

import { createContext, useEffect, useState } from 'react'
import type { AuthSession, User } from '@/types/user'

export interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (session: AuthSession) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'oss-auth'

function loadSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthSession) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)

  useEffect(() => {
    // Runs only on the client after hydration — avoids SSR/client mismatch
    const stored = loadSession()
    if (stored) setSession(stored)
  }, [])

  const value: AuthContextValue = {
    user: session?.user ?? null,
    token: session?.token ?? null,
    isAuthenticated: !!session?.token,
    login: (newSession) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession))
      setSession(newSession)
    },
    logout: () => {
      localStorage.removeItem(STORAGE_KEY)
      document.cookie = 'isLoggedIn=; Max-Age=0; path=/'
      setSession(null)
    },
  }

  return <AuthContext value={value}>{children}</AuthContext>
}
