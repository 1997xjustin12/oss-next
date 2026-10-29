'use client'

import { useEffect, useState, useTransition, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, Eye, Monitor, RotateCcw, Save, Send, Smartphone } from 'lucide-react'
import type { GbpActionResult } from '@/actions/gbp'

type Props<T> = {
  initialValue: T
  hasDraft: boolean
  /** "Draft saved Oct 29 by …", "Published …". */
  status: { draft?: string; published?: string }
  save: (value: T) => Promise<GbpActionResult>
  publish: () => Promise<GbpActionResult>
  discard: () => Promise<GbpActionResult>
  /** The draft preview, for one location (the template and shared screens let you pick which). */
  preview?: { href: string; locations?: readonly { slug: string; label: string }[] }
  /** What Publish affects, for the confirmation: "every GBP page", "San Diego, CA". */
  scope: string
  children: (value: T, setValue: (value: T) => void) => ReactNode
}

const BTN =
  'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50'

/**
 * The frame every GBP editor shares: the working copy, Save draft / Publish /
 * Discard, the record's status, and the live draft preview.
 *
 * Draft → preview → publish: saving writes the draft only; the preview (the
 * real page, drafts and all, admin-only) reloads after each save; Publish puts
 * the draft live. Publishing with unsaved edits saves them first.
 */
export function EditorShell<T>({ initialValue, hasDraft: initialHasDraft, status, save, publish, discard, preview, scope, children }: Props<T>) {
  const router = useRouter()
  const [value, setValue] = useState<T>(initialValue)
  const [saved, setSaved] = useState(() => JSON.stringify(initialValue))
  const [hasDraft, setHasDraft] = useState(initialHasDraft)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const [previewKey, setPreviewKey] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(true)
  const [width, setWidth] = useState<'desktop' | 'mobile'>('desktop')
  const [location, setLocation] = useState(preview?.locations?.[0]?.slug)
  const dirty = JSON.stringify(value) !== saved

  // The server sent a fresh record (after discard/publish → refresh).
  const [lastInitial, setLastInitial] = useState(initialValue)
  if (lastInitial !== initialValue) {
    setLastInitial(initialValue)
    setValue(initialValue)
    setSaved(JSON.stringify(initialValue))
    setHasDraft(initialHasDraft)
  }

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  async function doSave(): Promise<boolean> {
    const result = await save(value)
    if (!result.ok) {
      setMessage({ tone: 'error', text: result.error })
      return false
    }
    setSaved(JSON.stringify(value))
    setHasDraft(true)
    setPreviewKey((k) => k + 1)
    setMessage({ tone: 'ok', text: 'Draft saved. Check the preview, then publish.' })
    return true
  }

  const run = (fn: () => Promise<void>) => startTransition(fn)

  const previewHref = preview
    ? location && preview.locations
      ? preview.href.replace(/[^/]+$/, location)
      : preview.href
    : undefined

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-center gap-2 rounded-lg border border-theme-border bg-theme-bg/95 p-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
        <button type="button" disabled={!dirty || pending} onClick={() => run(async () => void (await doSave()))} className={`${BTN} bg-theme-dark text-white hover:bg-black dark:bg-neutral-100 dark:text-neutral-900`}>
          <Save className="h-4 w-4" />
          Save draft
        </button>
        <button
          type="button"
          disabled={(!hasDraft && !dirty) || pending}
          onClick={() =>
            run(async () => {
              if (!window.confirm(`Publish to ${scope}? Visitors will see it right away.`)) return
              if (dirty && !(await doSave())) return
              const result = await publish()
              if (!result.ok) return setMessage({ tone: 'error', text: result.error })
              setHasDraft(false)
              setMessage({ tone: 'ok', text: `Published to ${scope}.` })
              router.refresh()
            })
          }
          className={`${BTN} bg-[#C60C29] text-white hover:brightness-90`}
        >
          <Send className="h-4 w-4" />
          Publish
        </button>
        <button
          type="button"
          disabled={(!hasDraft && !dirty) || pending}
          onClick={() =>
            run(async () => {
              if (!window.confirm('Discard the draft and any unsaved edits? The published version stays.')) return
              const result = await discard()
              if (!result.ok) return setMessage({ tone: 'error', text: result.error })
              setMessage({ tone: 'ok', text: 'Draft discarded.' })
              router.refresh()
            })
          }
          className={`${BTN} border border-theme-border text-theme-mid hover:bg-theme-subtle dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800`}
        >
          <RotateCcw className="h-4 w-4" />
          Discard draft
        </button>
        <span className="ml-auto text-xs text-theme-muted dark:text-neutral-400">
          {dirty ? 'Unsaved changes' : hasDraft ? `Draft${status.draft ? ` · ${status.draft}` : ''}` : 'No draft'}
          {status.published && <> · Published {status.published}</>}
        </span>
        {message && (
          <p role={message.tone === 'error' ? 'alert' : 'status'} className={`w-full text-sm ${message.tone === 'error' ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
            {message.text}
          </p>
        )}
      </div>

      {children(value, setValue)}

      {previewHref && (
        <section aria-label="Draft preview" className="rounded-lg border border-theme-border bg-theme-bg p-3 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setPreviewOpen((o) => !o)} className={`${BTN} border border-theme-border dark:border-neutral-700`}>
              <Eye className="h-4 w-4" />
              {previewOpen ? 'Hide preview' : 'Show preview'}
            </button>
            {preview?.locations && (
              <select value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-md border border-theme-border bg-theme-bg px-2 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950" aria-label="Preview location">
                {preview.locations.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.label}
                  </option>
                ))}
              </select>
            )}
            <button type="button" onClick={() => setWidth('desktop')} aria-pressed={width === 'desktop'} className={`${BTN} border border-theme-border dark:border-neutral-700 ${width === 'desktop' ? 'bg-theme-subtle dark:bg-neutral-800' : ''}`}>
              <Monitor className="h-4 w-4" />
              Desktop
            </button>
            <button type="button" onClick={() => setWidth('mobile')} aria-pressed={width === 'mobile'} className={`${BTN} border border-theme-border dark:border-neutral-700 ${width === 'mobile' ? 'bg-theme-subtle dark:bg-neutral-800' : ''}`}>
              <Smartphone className="h-4 w-4" />
              Phone
            </button>
            <a href={previewHref} target="_blank" rel="noreferrer" className={`${BTN} ml-auto text-theme-mid dark:text-neutral-300`}>
              Open in a new tab
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-2 text-xs text-theme-muted dark:text-neutral-500">
            The saved draft (content, shared content and template), as visitors would see it after publishing. Unsaved edits show after Save draft.
          </p>
          {previewOpen && (
            <div className="mt-3 overflow-auto rounded border border-theme-border bg-white dark:border-neutral-800">
              <iframe
                key={`${previewKey}-${location}`}
                src={previewHref}
                title="Draft preview"
                className="mx-auto block h-[80vh] border-0"
                style={{ width: width === 'mobile' ? 390 : '100%', minWidth: width === 'mobile' ? 390 : 1024 }}
              />
            </div>
          )}
        </section>
      )}
    </div>
  )
}
