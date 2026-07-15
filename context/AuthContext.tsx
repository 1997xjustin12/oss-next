'use client'

import { createContext, useCallback, useEffect, useRef, useState } from 'react'
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
const REFRESH_INTERVAL_MS = 10 * 60 * 1000 // 10 minutes

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
  // Mirrors `session` for the refresh interval below, which reads this ref
  // instead of `session` directly so it always sees the latest value without
  // needing to be torn down and rebuilt every time the token rotates.
  const sessionRef = useRef<AuthSession | null>(null)
  useEffect(() => {
    sessionRef.current = session
  }, [session])

  const persistSession = useCallback((next: AuthSession | null) => {
    if (next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setSession(next)
  }, [])

  const clearSession = useCallback(() => {
    fetch('/api/logout', { method: 'POST' }).catch(() => {})
    document.cookie = 'isLoggedIn=; Max-Age=0; path=/'
    persistSession(null)
  }, [persistSession])

  useEffect(() => {
    // Runs only on the client after hydration — avoids SSR/client mismatch
    const stored = loadSession()
    if (stored) setSession(stored)
    if (!stored) return

    // Optimistically shows the stored session immediately, then verifies it
    // against the backend — a token sitting in localStorage may already be
    // expired or revoked server-side even though it looks valid locally.
    fetch('/api/auth/profile', {
      headers: { Authorization: `Bearer ${stored.token}` },
    })
      .then((res) => {
        if (!res.ok) clearSession()
      })
      .catch(() => {
        // Network error, not necessarily an invalid session — leave the
        // optimistic session in place rather than logging the user out.
      })
  }, [clearSession])

  useEffect(() => {
    // Rotates the access token before it expires so the user isn't logged
    // out mid-session. Reads sessionRef (not `session`) so this interval
    // never needs to be cleared/recreated as the token changes.
    const interval = setInterval(() => {
      const current = sessionRef.current
      if (!current?.refreshToken) return

      fetch('/api/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error('refresh failed'))))
        .then((data: { access: string }) => {
          persistSession({ ...current, token: data.access })
        })
        .catch(() => {
          // Refresh token itself is expired/invalid — nothing left to do but
          // sign the user out.
          clearSession()
        })
    }, REFRESH_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [persistSession, clearSession])

  const value: AuthContextValue = {
    user: session?.user ?? null,
    token: session?.token ?? null,
    isAuthenticated: !!session?.token,
    // Merged (not replaced) — callers like AccountDetailsForm rebuild only
    // `{ user, token }` after a profile edit, omitting `refreshToken`
    // entirely. A full replace would silently drop it from the persisted
    // session; merging keeps it unless the caller explicitly provides a new one.
    login: (newSession) => persistSession({ ...session, ...newSession }),
    logout: clearSession,
  }

  return <AuthContext value={value}>{children}</AuthContext>
}
