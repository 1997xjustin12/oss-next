'use client'

import { useCallback, useState } from 'react'
import { Loader2, Wrench, CheckCircle2, AlertCircle } from 'lucide-react'

// Browser control for the maintenance wall. The token is typed into a field
// (never placed in the URL, so it can't leak into history or server logs) and
// sent as the x-revalidate-token header on each call, exactly as a curl to
// /api/maintenance would. It's kept only in component state — a refresh clears
// it, by design.

type State = { maintenance: boolean; source?: { envForcedOn: boolean; redisFlag: boolean } }

const STORAGE_KEY = 'oss-maintenance-token'

export function MaintenanceControl() {
  // Lazy initial value from sessionStorage (cleared when the tab closes), so a
  // status refresh doesn't force re-entering the token mid-session. Guarded for
  // SSR, and read once at mount rather than via an effect.
  const [token, setToken] = useState(() =>
    typeof window === 'undefined' ? '' : (sessionStorage.getItem(STORAGE_KEY) ?? ''),
  )
  const [state, setState] = useState<State | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  const call = useCallback(
    async (method: 'GET' | 'POST', on?: boolean) => {
      if (!token) {
        setError('Enter the token first.')
        return
      }
      setBusy(true)
      setError(null)
      setNote(null)
      try {
        const res = await fetch('/api/maintenance', {
          method,
          headers: {
            'x-revalidate-token': token,
            ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
          },
          ...(method === 'POST' ? { body: JSON.stringify({ on }) } : {}),
        })
        const data = await res.json().catch(() => null)
        if (!res.ok) {
          throw new Error(data?.error ?? (res.status === 401 ? 'Wrong token.' : `Request failed (${res.status}).`))
        }
        sessionStorage.setItem(STORAGE_KEY, token)
        setState({ maintenance: data.maintenance, source: data.source })
        if (data.note) setNote(data.note)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Request failed.')
      } finally {
        setBusy(false)
      }
    },
    [token],
  )

  const on = state?.maintenance === true
  const envForced = state?.source?.envForcedOn === true

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-lg border border-theme-border bg-theme-bg p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-theme-subtle dark:bg-neutral-800">
            <Wrench className="h-5 w-5 text-theme-muted dark:text-neutral-400" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
              Maintenance Control
            </h1>
            <p className="text-xs text-theme-muted dark:text-neutral-500">
              Flip the site maintenance wall on or off.
            </p>
          </div>
        </div>

        {/* Current state */}
        {state && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-md p-3 text-sm font-semibold ${
              on
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                : 'bg-theme-success-light text-theme-success dark:bg-green-950/40 dark:text-green-400'
            }`}
          >
            {on ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
            {on ? 'Maintenance is ON — visitors see the wall.' : 'Site is LIVE — no wall.'}
          </div>
        )}

        {envForced && (
          <div className="mb-4 rounded-md bg-theme-subtle p-3 text-xs text-theme-muted dark:bg-neutral-800/50 dark:text-neutral-400">
            The <code>MAINTENANCE_MODE</code> env kill-switch is on, so the wall stays up regardless
            of the toggle below until that var is removed and redeployed.
          </div>
        )}

        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-theme-muted dark:text-neutral-500">
          Token
        </label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="REVALIDATE_SECRET"
          autoComplete="off"
          className="mb-4 w-full rounded-md border border-theme-border bg-theme-bg px-3 py-2 text-sm text-theme-dark outline-none focus:border-theme-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => call('POST', true)}
            className="flex items-center justify-center gap-2 rounded-md bg-theme-primary py-2.5 text-sm font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-theme-primary-dark disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Turn On
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => call('POST', false)}
            className="flex items-center justify-center gap-2 rounded-md border border-theme-border bg-theme-bg py-2.5 text-sm font-extrabold uppercase tracking-wide text-theme-dark transition-colors hover:bg-theme-subtle disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Turn Off
          </button>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => call('GET')}
          className="mt-3 w-full text-center text-xs font-semibold text-theme-primary hover:underline disabled:opacity-60 dark:text-red-400"
        >
          Refresh status
        </button>

        {error && (
          <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-theme-primary dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
          </p>
        )}
        {note && <p className="mt-3 text-xs text-theme-muted dark:text-neutral-400">{note}</p>}

        <p className="mt-5 text-[11px] leading-relaxed text-theme-muted dark:text-neutral-500">
          Changes take up to ~20s to reach every visitor (the wall is cached briefly). The token is
          sent as a header and kept only for this browser tab.
        </p>
      </div>
    </main>
  )
}
