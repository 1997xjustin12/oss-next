'use client'

import { useId, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'

/**
 * A form for any GBP record, built from the shape of its value: strings are
 * inputs (or textareas), numbers number inputs, booleans checkboxes, lists get
 * add / remove / move, objects become fieldsets, and an image object
 * (`{ src, alt, width, height }`) shows a thumbnail. Hints, keyed by path with
 * `*` for list indexes (`blogCards.*.excerpt`), give fields a label, help
 * text, a long-text box, a colour picker, a select, or a raw-JSON box.
 *
 * The record is validated on save (lib/gbpValidate.ts); this only edits.
 */

export type FieldHint = {
  label?: string
  help?: string
  multiline?: boolean
  kind?: 'color' | 'select' | 'json' | 'hidden' | 'readonly'
  options?: readonly { value: string; label: string }[]
  /** For a list: the item "Add" appends. Defaults to a blank copy of the first item. */
  newItem?: unknown
  /** For a list: what to call one item ("FAQ", "Card"). */
  itemLabel?: string
  /** For an optional object (e.g. an image): it can be removed, and `newItem` adds it back. */
  nullable?: boolean
  /** For a list with more than one kind of item: one Add button each, in place of `newItem`'s. */
  addOptions?: readonly { label: string; item: unknown }[]
  /** A field with its own editor, in place of the one built from its shape. */
  render?: (props: { value: unknown; onChange: (value: unknown) => void }) => ReactNode
}
export type FieldHints = Record<string, FieldHint>

export const INPUT =
  'w-full rounded-md border border-theme-border bg-theme-bg px-3 py-2 text-sm text-theme-dark placeholder:text-theme-muted/70 focus:border-theme-primary focus:ring-1 focus:ring-theme-primary focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100'
export const LABEL = 'block text-sm font-semibold text-theme-dark dark:text-neutral-200'
export const HELP = 'mt-1 text-xs text-theme-muted dark:text-neutral-500'
const ICON_BTN =
  'inline-flex h-8 w-8 items-center justify-center rounded-md border border-theme-border text-theme-mid hover:bg-theme-subtle disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'

type Path = (string | number)[]

function hintKey(path: Path): string {
  return path.map((part) => (typeof part === 'number' ? '*' : part)).join('.')
}

function humanize(key: string): string {
  const words = key.replace(/([a-z])([A-Z0-9])/g, '$1 $2').replace(/[_-]/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** A blank value of the same shape, for a new list item. */
export function blankLike(value: unknown): unknown {
  if (Array.isArray(value)) return []
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, blankLike(v)]))
  if (typeof value === 'number') return 0
  if (typeof value === 'boolean') return false
  return ''
}

function isImage(value: unknown): value is { src: string; alt: string } {
  return !!value && typeof value === 'object' && 'src' in value && 'alt' in value
}

type Props = {
  value: unknown
  onChange: (value: unknown) => void
  hints?: FieldHints
  path?: Path
  /** The field's label; omitted for the record itself. */
  label?: string
}

export function ValueEditor({ value, onChange, hints = {}, path = [], label }: Props) {
  const id = useId()
  const hint = hints[hintKey(path)] ?? {}
  if (hint.kind === 'hidden') return null
  if (hint.render) return hint.render({ value, onChange })
  const title = hint.label ?? label

  if (hint.kind === 'json') return <JsonField value={value} onChange={onChange} label={title} help={hint.help} />

  // An optional object that is absent: offer to add it.
  if (value === null && hint.nullable && hint.newItem !== undefined) {
    return (
      <div>
        {title && <p className={LABEL}>{title}</p>}
        <button
          type="button"
          onClick={() => onChange(structuredClone(hint.newItem))}
          className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-dashed border-theme-border px-3 py-1.5 text-sm font-semibold text-theme-mid hover:bg-theme-subtle dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" />
          Add {title?.toLowerCase() ?? 'value'}
        </button>
      </div>
    )
  }

  if (Array.isArray(value)) {
    const newItem = hint.newItem ?? (value.length ? blankLike(value[0]) : '')
    const move = (from: number, to: number) => {
      const next = [...value]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      onChange(next)
    }
    return (
      <fieldset className="rounded-md border border-theme-border p-3 dark:border-neutral-800">
        {title && <legend className="px-1 text-sm font-semibold text-theme-dark dark:text-neutral-200">{title}</legend>}
        {hint.help && <p className={HELP}>{hint.help}</p>}
        <ol className="mt-2 space-y-3">
          {value.map((item, i) => (
            <li key={i} className="rounded-md bg-theme-subtle p-3 dark:bg-neutral-950">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-theme-muted uppercase dark:text-neutral-500">
                  {hint.itemLabel ?? 'Item'} {i + 1}
                </span>
                <span className="flex gap-1">
                  <button type="button" className={ICON_BTN} onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move ${hint.itemLabel ?? 'item'} ${i + 1} up`}>
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" className={ICON_BTN} onClick={() => move(i, i + 1)} disabled={i === value.length - 1} aria-label={`Move ${hint.itemLabel ?? 'item'} ${i + 1} down`}>
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className={`${ICON_BTN} text-red-700 dark:text-red-400`}
                    onClick={() => onChange(value.filter((_, j) => j !== i))}
                    aria-label={`Remove ${hint.itemLabel ?? 'item'} ${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </div>
              <ValueEditor value={item} onChange={(next) => onChange(value.map((v, j) => (j === i ? next : v)))} hints={hints} path={[...path, i]} />
            </li>
          ))}
        </ol>
        <div className="mt-3 flex flex-wrap gap-2">
          {(hint.addOptions ?? [{ label: `Add ${hint.itemLabel ?? 'item'}`, item: newItem }]).map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => onChange([...value, structuredClone(option.item)])}
              className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-theme-border px-3 py-1.5 text-sm font-semibold text-theme-mid hover:bg-theme-subtle dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <Plus className="h-4 w-4" />
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>
    )
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    const body = (
      <div className={`grid gap-3 ${entries.length > 2 ? 'sm:grid-cols-2' : ''}`}>
        {isImage(value) && value.src && (
          // A thumbnail of the image being edited; an admin preview, not page content.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.src} alt="" className="h-20 w-auto rounded border border-theme-border bg-white object-contain sm:col-span-2 dark:border-neutral-700" />
        )}
        {entries.map(([key, child]) => {
          const childHint = hints[hintKey([...path, key])] ?? {}
          const wide = Array.isArray(child) || (child && typeof child === 'object') || childHint.multiline || childHint.kind === 'json'
          return (
            <div key={key} className={wide ? 'sm:col-span-2' : undefined}>
              <ValueEditor
                value={child}
                onChange={(next) => onChange({ ...(value as Record<string, unknown>), [key]: next })}
                hints={hints}
                path={[...path, key]}
                label={humanize(key)}
              />
            </div>
          )
        })}
      </div>
    )
    if (path.length === 0 || !title) return body
    return (
      <fieldset className="rounded-md border border-theme-border p-3 dark:border-neutral-800">
        <legend className="px-1 text-sm font-semibold text-theme-dark dark:text-neutral-200">{title}</legend>
        {hint.help && <p className={`${HELP} mb-2`}>{hint.help}</p>}
        {body}
        {hint.nullable && (
          <button type="button" onClick={() => onChange(null)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 hover:underline dark:text-red-400">
            <Trash2 className="h-4 w-4" />
            Remove {title.toLowerCase()}
          </button>
        )}
      </fieldset>
    )
  }

  if (typeof value === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm text-theme-mid dark:text-neutral-300">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-theme-primary" />
        {title}
        {hint.help && <span className="text-xs text-theme-muted">({hint.help})</span>}
      </label>
    )
  }

  const str = value === null || value === undefined ? '' : String(value)
  const field = (() => {
    if (hint.kind === 'select' && hint.options) {
      return (
        <select id={id} value={str} onChange={(e) => onChange(e.target.value)} className={INPUT}>
          {hint.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    }
    if (hint.kind === 'color') {
      return (
        <span className="flex items-center gap-2">
          <input
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(str) ? str : '#000000'}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="h-9 w-12 cursor-pointer rounded border border-theme-border bg-transparent dark:border-neutral-700"
            aria-label={`${title} colour picker`}
          />
          <input id={id} value={str} onChange={(e) => onChange(e.target.value)} placeholder="#RRGGBB" className={`${INPUT} font-mono`} />
        </span>
      )
    }
    if (typeof value === 'number') {
      return <input id={id} type="number" value={str} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} className={INPUT} />
    }
    const multiline = hint.multiline ?? str.length > 90
    return multiline ? (
      <textarea id={id} value={str} rows={Math.min(8, Math.max(3, Math.ceil(str.length / 90)))} onChange={(e) => onChange(e.target.value)} readOnly={hint.kind === 'readonly'} className={INPUT} />
    ) : (
      <input id={id} value={str} onChange={(e) => onChange(value === null && e.target.value === '' ? null : e.target.value)} readOnly={hint.kind === 'readonly'} className={INPUT} />
    )
  })()

  return (
    <div>
      {title && (
        <label htmlFor={id} className={LABEL}>
          {title}
        </label>
      )}
      <div className={title ? 'mt-1' : undefined}>{field}</div>
      {hint.help && <p className={HELP}>{hint.help}</p>}
    </div>
  )
}

/** Raw JSON for values with no fixed shape (extra JSON-LD nodes). Applied only when it parses. */
function JsonField({ value, onChange, label, help }: { value: unknown; onChange: (v: unknown) => void; label?: string; help?: string }) {
  const id = useId()
  const [draft, setDraft] = useState(() => JSON.stringify(value ?? [], null, 2))
  const [error, setError] = useState<string | null>(null)
  return (
    <div>
      {label && (
        <label htmlFor={id} className={LABEL}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        value={draft}
        rows={8}
        spellCheck={false}
        onChange={(e) => {
          setDraft(e.target.value)
          try {
            onChange(JSON.parse(e.target.value))
            setError(null)
          } catch {
            setError('Not valid JSON yet: the last valid value is kept.')
          }
        }}
        className={`mt-1 font-mono text-xs ${INPUT}`}
      />
      {(error || help) && <p className={`${HELP} ${error ? 'text-red-700 dark:text-red-400' : ''}`}>{error ?? help}</p>}
    </div>
  )
}
