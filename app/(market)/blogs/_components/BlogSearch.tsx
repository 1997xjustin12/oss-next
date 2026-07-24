'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { ROUTES } from '@/config/routes'

// Navigates to /blogs?search=… on submit (page resets to 1 by omission). Kept a
// client leaf so the rest of the list page stays a Server Component.
export function BlogSearch({ initial = '' }: { initial?: string }) {
  const router = useRouter()
  const [value, setValue] = useState(initial)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    router.push(q ? `${ROUTES.BLOGS}?search=${encodeURIComponent(q)}` : ROUTES.BLOGS)
  }

  return (
    <form onSubmit={submit} role="search" className="relative w-full max-w-sm">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search articles…"
        aria-label="Search articles"
        className="w-full rounded-md border border-theme-border bg-theme-bg py-2.5 pl-10 pr-3 text-sm text-theme-dark outline-none focus:border-theme-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-muted" />
    </form>
  )
}
