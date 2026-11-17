'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { INPUT, LABEL, HELP } from '@/components/admin/ValueEditor'
import type { AdminActionResult } from '@/components/admin/EditorShell'
import type { AllCityState, AllCityVariant } from '@/types/allCity'

type Input = { slug: string; city: string; state: AllCityState; depotKey: string; variant: AllCityVariant; h1: string; title: string }

type Props = {
  stateOptions: readonly { value: string; label: string }[]
  depotOptions: readonly { value: string; label: string; state: string }[]
  create: (input: Input) => Promise<AdminActionResult>
  /** The page editor's path; the new slug is appended (functions cannot cross to a Client Component). */
  editorBase: string
}

const toSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** A page WordPress never had: the essentials, then the page's own screen for the rest. */
export function AllCityNewPageForm({ stateOptions, depotOptions, create, editorBase }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState<Input>({ slug: '', city: '', state: 'TX', depotKey: 'houston-tx', variant: 'city', h1: '', title: '' })
  const [slugEdited, setSlugEdited] = useState(false)
  const set = <K extends keyof Input>(key: K, value: Input[K]) => setInput((prev) => ({ ...prev, [key]: value }))

  const field = (key: keyof Input, label: string, help?: string, placeholder?: string) => (
    <label className="block">
      <span className={LABEL}>{label}</span>
      <input
        value={input[key]}
        placeholder={placeholder}
        onChange={(e) => {
          const value = e.target.value
          if (key === 'slug') setSlugEdited(true)
          setInput((prev) => {
            const next = { ...prev, [key]: value }
            // Suggest the URL, heading and title from the city until they are typed.
            if (key === 'city') {
              const st = prev.state
              if (!slugEdited) next.slug = toSlug(`storage-units-${value}-${st}`)
              if (!prev.h1 || prev.h1 === `Storage Units ${prev.city} ${st}`) next.h1 = `Storage Units ${value} ${st}`
              if (!prev.title || prev.title === `Storage Units ${prev.city} ${st} | Lowest Price Shipping Containers`) {
                next.title = `Storage Units ${value} ${st} | Lowest Price Shipping Containers`
              }
            }
            return next
          })
        }}
        className={`mt-1 ${INPUT}`}
      />
      {help && <span className={HELP}>{help}</span>}
    </label>
  )

  return (
    <form
      className="max-w-xl space-y-4 rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900"
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          const result = await create(input)
          if (!result.ok) return setError(result.error)
          router.push(`${editorBase}/${input.slug.trim().toLowerCase()}`)
        })
      }}
    >
      {field('city', 'City', 'As it reads in the sentences and the city lists.', 'Springfield')}
      <label className="block">
        <span className={LABEL}>State</span>
        <select value={input.state} onChange={(e) => set('state', e.target.value as AllCityState)} className={`mt-1 ${INPUT}`}>
          {stateOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={LABEL}>Depot</span>
        <select value={input.depotKey} onChange={(e) => set('depotKey', e.target.value)} className={`mt-1 ${INPUT}`}>
          {depotOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      {field('slug', 'URL', 'The page will be /all-city/<this>. Lower-case letters, digits and hyphens; it cannot change later.')}
      {field('h1', 'Main heading (h1)')}
      {field('title', 'SEO title', 'Used whole, ending included.')}
      <label className="block">
        <span className={LABEL}>Template</span>
        <select value={input.variant} onChange={(e) => set('variant', e.target.value as AllCityVariant)} className={`mt-1 ${INPUT}`}>
          <option value="city">City (the usual page)</option>
          <option value="depotCity">Depot city</option>
        </select>
      </label>
      <p className={HELP}>It is saved as a draft in “View all cities”: preview it, fill in the description, then publish it on its screen.</p>
      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="rounded-md bg-theme-dark px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900">
        Create draft
      </button>
    </form>
  )
}
