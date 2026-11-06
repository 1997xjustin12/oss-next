'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { ZOHO_FORMS } from '@/lib/data/zohoForms'
import { subscribeToNewsletter } from '@/lib/newsletter'
import { grecaptchaV2, loadRecaptchaV2 } from '@/lib/recaptchaV2'

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'done' } | { kind: 'error'; message: string }

type Props = {
  /** 'dark': on a dark or brand-coloured band (white labels). 'light': on a light section. */
  tone?: 'dark' | 'light'
}

const SITE_KEY = ZOHO_FORMS.newsletter.recaptchaSiteKey

/**
 * The newsletter form for every newsletter section: Full Name, Email and the
 * "I'm not a robot" box Zoho requires, sent through `subscribeToNewsletter` to
 * Zoho CRM and the Django backend. The page around it stays a Server Component.
 *
 * reCAPTCHA loads only when the form nears the viewport or a field is focused:
 * it is about 400 KB of Google script most visitors never need.
 */
export function NewsletterForm({ tone = 'light' }: Props) {
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<number | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  function mountCaptcha() {
    loadRecaptchaV2(() => {
      const grecaptcha = grecaptchaV2()
      if (widgetRef.current !== null || !boxRef.current || !grecaptcha) return
      widgetRef.current = grecaptcha.render(boxRef.current, { sitekey: SITE_KEY, theme: 'light' })
    })
  }

  useEffect(() => {
    const form = formRef.current
    if (!form) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          mountCaptcha()
          observer.disconnect()
        }
      },
      { rootMargin: '300px' },
    )
    observer.observe(form)
    return () => observer.disconnect()
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const grecaptcha = grecaptchaV2()
    const token = widgetRef.current !== null ? grecaptcha?.getResponse(widgetRef.current) : ''
    if (!token) {
      setStatus({ kind: 'error', message: 'Please confirm you’re not a robot.' })
      return
    }
    setStatus({ kind: 'sending' })
    const result = await subscribeToNewsletter({ email: email.trim(), name: name.trim(), zohoCaptchaToken: token })
    // A token is good for one check, so the box is cleared either way.
    if (widgetRef.current !== null) grecaptcha?.reset(widgetRef.current)
    if (result.ok) {
      setStatus({ kind: 'done' })
      setName('')
      setEmail('')
    } else {
      setStatus({ kind: 'error', message: result.error })
    }
  }

  const dark = tone === 'dark'
  const label = `mb-1.5 block text-sm font-semibold ${dark ? 'text-white' : 'text-theme-dark dark:text-neutral-200'}`
  const field =
    'h-12 w-full rounded-md border border-neutral-300 bg-white px-4 text-base text-theme-dark outline-none transition-colors placeholder:text-neutral-500 ' +
    'focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-400'
  const statusId = `${id}-status`

  return (
    <form ref={formRef} onSubmit={onSubmit} onFocus={mountCaptcha} noValidate aria-describedby={statusId} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className={label}>Full Name</label>
          <input
            id={`${id}-name`}
            type="text"
            required
            autoComplete="name"
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={label}>Email</label>
          <input
            id={`${id}-email`}
            type="email"
            required
            autoComplete="email"
            maxLength={100}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Holds the widget once loaded; sized so it doesn't shift the button. */}
        <div ref={boxRef} className="min-h-19.5" />
        <button
          type="submit"
          disabled={status.kind === 'sending'}
          className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-8 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-70
                      focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        dark
                          ? 'bg-white text-theme-primary hover:bg-neutral-100 focus-visible:outline-white'
                          : 'bg-theme-primary text-white hover:bg-theme-primary-dark focus-visible:outline-theme-primary'
                      }`}
        >
          {status.kind === 'sending' && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
          {status.kind === 'sending' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>

      <p
        id={statusId}
        role="status"
        className={`min-h-6 text-sm font-semibold ${
          status.kind === 'error' ? (dark ? 'text-white' : 'text-theme-primary dark:text-red-400') : dark ? 'text-white' : 'text-theme-dark dark:text-neutral-200'
        }`}
      >
        {status.kind === 'done' && 'Thanks! You’re subscribed.'}
        {status.kind === 'error' && status.message}
      </p>
    </form>
  )
}
