'use client'

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Eye, RotateCcw } from 'lucide-react'
import { HELP, ValueEditor, type FieldHints } from '@/components/admin/ValueEditor'

export type SettingsPath = (string | number)[]

/** One row of the list, and what its drawer edits. */
export type DrawerSection<T> = {
  id: string
  label: string
  /** Under the row's name, and at the top of its drawer. */
  help?: string
  /** Where its settings live in the record; several for a section whose settings are spread out (a location's text and image). */
  parts: { path: SettingsPath; title?: string }[]
  /** The row's On/Off switch. Absent: the section has none. */
  shown?: { get: (value: T) => boolean; set: (value: T, on: boolean) => T; /** The switch's own field, kept out of the drawer. */ path?: SettingsPath }
  /** An element id on the previewed page: "Show in preview" scrolls there. */
  anchor?: string
  /** The drawer's own content, in place of the form built from `parts` (GBP's sortable sections). */
  render?: (value: T, onChange: (value: T) => void) => ReactNode
}

type Props<T> = {
  value: T
  onChange: (value: T) => void
  sections: readonly DrawerSection<T>[]
  hints: FieldHints
  /** What visitors see now: a section whose settings differ is marked "Changed". */
  published?: T
  /** The code default: "Reset to default" puts a section's settings back to it. */
  defaults?: T
  /** Moves a section in the page (the location template). */
  onMove?: (value: T, id: string, direction: -1 | 1) => T
  /** Scrolls the draft preview to an element id (EditorShell's split layout). */
  showInPreview?: (anchor: string) => void
  /** Over the list. */
  title?: string
  intro?: ReactNode
  /** Under the list (the location template's "Add a section"). */
  footer?: ReactNode
  /** The draft orders the sections differently from the live pages (a reorderable list). */
  orderChanged?: boolean
}

function hintKey(path: SettingsPath): string {
  return path.map((part) => (typeof part === 'number' ? '*' : part)).join('.')
}

export function getAt(value: unknown, path: SettingsPath): unknown {
  return path.reduce<unknown>((node, key) => (node && typeof node === 'object' ? (node as Record<string | number, unknown>)[key] : undefined), value)
}

export function setAt<T>(value: T, path: SettingsPath, next: unknown): T {
  if (path.length === 0) return next as T
  const [head, ...rest] = path
  const node = (value ?? {}) as Record<string | number, unknown>
  const child = setAt(node[head], rest, next)
  if (Array.isArray(node)) return node.map((item, i) => (i === head ? child : item)) as T
  return { ...node, [head]: child } as T
}

export const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

const SWITCH =
  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-neutral-300 transition-colors has-[:checked]:bg-emerald-600 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-theme-primary dark:bg-neutral-700 dark:has-[:checked]:bg-emerald-500'

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <label className={SWITCH} title={checked ? 'Shown on the pages' : 'Hidden on the pages'}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" aria-label={label} />
      <span aria-hidden className="ml-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
    </label>
  )
}

type DrawerPanelProps = {
  id?: string
  title: string
  headingRef?: RefObject<HTMLHeadingElement | null>
  /** Back to the list ("All sections"); Escape does the same. */
  onBack: () => void
  /** The section's On/Off switch, in the header. */
  shown?: { checked: boolean; onChange: (on: boolean) => void }
  onPreview?: () => void
  /** Puts the section back to its default (after a confirmation). */
  onReset?: () => void
  help?: string
  backLabel?: string
  children: ReactNode
}

/**
 * The drawer itself: a sticky header (back, title, switch, "Show in
 * preview", "Reset to default") over one section's settings. SectionDrawers
 * uses it; the GBP template's sortable list opens it too.
 */
export function DrawerPanel({ id, title, headingRef, onBack, shown, onPreview, onReset, help, backLabel = 'All sections', children }: DrawerPanelProps) {
  const ownId = useId()
  const panelId = id ?? ownId
  const ownRef = useRef<HTMLHeadingElement>(null)
  const ref = headingRef ?? ownRef
  // The latest onBack, without re-running the effect below on every render (it would pull focus while typing).
  const back = useRef(onBack)
  useEffect(() => {
    back.current = onBack
  })
  // Opened: focus the title, and Escape goes back. Once per opening.
  useEffect(() => {
    ref.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') back.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ref])

  return (
    <section
      id={panelId}
      aria-labelledby={`${panelId}-title`}
      className="animate-[drawer-in_160ms_ease-out] rounded-lg border border-theme-border bg-theme-bg motion-reduce:animate-none dark:border-neutral-800 dark:bg-neutral-900"
    >
      <style>{'@keyframes drawer-in{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:none}}'}</style>
      <div className="sticky top-19 z-5 flex flex-wrap items-center gap-2 rounded-t-lg border-b border-theme-border bg-theme-bg/95 p-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-semibold text-theme-mid hover:bg-theme-subtle dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </button>
        <h2 id={`${panelId}-title`} ref={ref} tabIndex={-1} className="mr-auto text-base font-extrabold tracking-tight outline-none">
          {title}
        </h2>
        {shown && <Switch checked={shown.checked} onChange={shown.onChange} label={`Show ${title}`} />}
        {onPreview && (
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-1 rounded-md border border-theme-border px-2 py-1.5 text-sm font-semibold hover:bg-theme-subtle dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <Eye className="h-4 w-4" />
            Show in preview
          </button>
        )}
        {onReset && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Put “${title}” back to its default settings? (Nothing is saved until Save draft.)`)) onReset()
            }}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-semibold text-theme-mid hover:bg-theme-subtle dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to default
          </button>
        )}
      </div>
      <div className="space-y-5 p-4 sm:p-5">
        {help && <p className={HELP}>{help}</p>}
        {children}
      </div>
    </section>
  )
}

/**
 * A long template as a list of its sections, each opening a drawer with only
 * that section's settings: the list keeps its place, the draft preview beside
 * it stays in view (EditorShell's split layout), and each row says at a glance
 * whether the section is shown and whether the draft changed it.
 *
 * The drawer's form is ValueEditor at the section's own path, so every label,
 * help text and select the template's hints give still applies.
 */
export function SectionDrawers<T>({ value, onChange, sections, hints, published, defaults, onMove, showInPreview, title = 'Sections', intro, footer, orderChanged = false }: Props<T>) {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = sections.find((section) => section.id === openId) ?? null
  const headingRef = useRef<HTMLHeadingElement>(null)
  const rowRefs = useRef(new Map<string, HTMLButtonElement>())
  const lastOpened = useRef<string | null>(null)
  const panelId = useId()

  // Closed: back to the row it came from (DrawerPanel focuses its title when it opens).
  useEffect(() => {
    if (!open && lastOpened.current) rowRefs.current.get(lastOpened.current)?.focus()
  }, [open])

  // Its settings, or its switch (which may live outside them: a location's section list), differ from what is live.
  const changed = (section: DrawerSection<T>) =>
    published !== undefined &&
    (section.parts.some(({ path }) => !same(getAt(value, path), getAt(published, path))) ||
      (section.shown !== undefined && section.shown.get(value) !== section.shown.get(published)))

  function openSection(id: string) {
    lastOpened.current = id
    setOpenId(id)
  }

  if (open) {
    // The drawer: this section's settings only. Its switch sits in the header, so its own field is hidden here.
    const drawerHints: FieldHints = { ...hints }
    // A group of fields loses its frame and title (the drawer's title says it); a single field keeps its label.
    for (const { path } of open.parts) {
      const node = getAt(value, path)
      if (node && typeof node === 'object' && !Array.isArray(node)) drawerHints[hintKey(path)] = { ...hints[hintKey(path)], label: undefined }
    }
    if (open.shown?.path) drawerHints[hintKey(open.shown.path)] = { kind: 'hidden' }

    return (
      <DrawerPanel
        id={panelId}
        title={open.label}
        headingRef={headingRef}
        onBack={() => setOpenId(null)}
        shown={open.shown ? { checked: open.shown.get(value), onChange: (on) => onChange(open.shown!.set(value, on)) } : undefined}
        onPreview={open.anchor && showInPreview ? () => showInPreview(open.anchor!) : undefined}
        onReset={
          defaults !== undefined
            ? () => onChange(open.parts.reduce((next, { path }) => setAt(next, path, structuredClone(getAt(defaults, path))), value))
            : undefined
        }
        help={open.help}
      >

        {open.render
          ? open.render(value, onChange)
            : open.parts.map(({ path, title }) => (
                <div key={hintKey(path)}>
                  {(title || (open.parts.length > 1 && hints[hintKey(path)]?.label)) && (
                    <h3 className="mb-2 text-xs font-bold tracking-wide text-theme-muted uppercase dark:text-neutral-500">{title ?? hints[hintKey(path)]?.label}</h3>
                  )}
                  {hints[hintKey(path)]?.help && <p className={`${HELP} mb-3`}>{hints[hintKey(path)]?.help}</p>}
                  <ValueEditor value={getAt(value, path)} onChange={(next) => onChange(setAt(value, path, next))} hints={drawerHints} path={path} />
                </div>
              ))}
      </DrawerPanel>
    )
  }

  return (
    <section aria-label={title} className="rounded-lg border border-theme-border bg-theme-bg p-3 sm:p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="px-1 text-sm font-extrabold tracking-tight">
        {title}
        {orderChanged && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">Order changed</span>}
      </h2>
      {intro && <div className={`${HELP} px-1`}>{intro}</div>}
      <ol className="mt-3 divide-y divide-theme-border overflow-hidden rounded-md border border-theme-border dark:divide-neutral-800 dark:border-neutral-800">
        {sections.map((section, i) => {
          const on = section.shown ? section.shown.get(value) : true
          return (
            <li key={section.id} className={`flex items-center gap-2 bg-theme-bg pr-2 dark:bg-neutral-900 ${on ? '' : 'opacity-70'}`}>
              <button
                type="button"
                ref={(el) => {
                  if (el) rowRefs.current.set(section.id, el)
                  else rowRefs.current.delete(section.id)
                }}
                onClick={() => openSection(section.id)}
                aria-controls={panelId}
                className="flex min-h-12 min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left hover:bg-theme-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-theme-primary dark:hover:bg-neutral-800"
              >
                <span className="w-5 shrink-0 text-right text-xs font-bold text-theme-muted tabular-nums">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-theme-dark dark:text-neutral-100">{section.label}</span>
                  {section.shown && !on && <span className="block text-xs text-theme-muted">Hidden on the pages</span>}
                </span>
                {changed(section) && (
                  <span title="The draft changes this section; publish to put it live." className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">
                    Changed
                  </span>
                )}
                <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-theme-muted" />
              </button>
              {onMove && (
                <span className="flex shrink-0 gap-0.5">
                  <button type="button" onClick={() => onChange(onMove(value, section.id, -1))} disabled={i === 0} aria-label={`Move ${section.label} up`} className="rounded p-1 text-theme-muted hover:bg-theme-subtle disabled:opacity-30 dark:hover:bg-neutral-800">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onChange(onMove(value, section.id, 1))} disabled={i === sections.length - 1} aria-label={`Move ${section.label} down`} className="rounded p-1 text-theme-muted hover:bg-theme-subtle disabled:opacity-30 dark:hover:bg-neutral-800">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </span>
              )}
              {section.shown && <Switch checked={on} onChange={(next) => onChange(section.shown!.set(value, next))} label={`Show ${section.label}`} />}
            </li>
          )
        })}
      </ol>
      {footer}
    </section>
  )
}
