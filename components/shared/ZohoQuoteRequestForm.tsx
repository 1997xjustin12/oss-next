'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { grecaptchaV2, loadRecaptchaV2 } from '@/lib/recaptchaV2'
import { identifySalesIqVisitor } from '@/lib/salesIqVisitor'
import {
  EMPTY_QUOTE_REQUEST,
  QUOTE_REQUEST_FIELDS,
  QUOTE_REQUEST_HONEYPOT,
  ZOHO_QUOTE_REQUEST,
  validateQuoteRequest,
  type QuoteRequestErrors,
  type QuoteRequestField,
  type QuoteRequestValues,
} from '@/lib/zohoQuoteRequest'

const CONTROL =
  'w-full rounded-md border bg-white px-4 text-base text-theme-dark outline-none transition-colors focus:ring-2 dark:bg-neutral-950 dark:text-white dark:scheme-dark ' +
  'aria-[invalid=true]:border-theme-primary dark:aria-[invalid=true]:border-red-400'
const OK_BORDER = 'border-neutral-300 focus:border-theme-primary focus:ring-theme-primary/15 dark:border-neutral-700 dark:focus:border-red-400 dark:focus:ring-red-400/20'
const LABEL = 'mb-1.5 block text-sm font-semibold text-theme-dark dark:text-neutral-200'
const ERROR = 'mt-1.5 text-sm font-semibold text-theme-primary dark:text-red-400'

/** Fields that share a row from `sm` up; the others take the full width. */
const HALF: readonly QuoteRequestField[] = ['firstName', 'lastName', 'email', 'phone', 'city', 'state', 'zip', 'size', 'condition', 'timing']

/**
 * The FAQ page's "Shipping Container Quote Requests" form, native: the same
 * fields and the same Zoho CRM form as WordPress, sent through
 * /api/zoho-quote-request (server to server), then on to the thank-you page as
 * WordPress's `returnURL` did. Checked here and again on the server.
 *
 * reCAPTCHA loads only when the form nears the viewport or a field is focused.
 */
export function ZohoQuoteRequestForm() {
  const id = useId()
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<number | null>(null)
  const [values, setValues] = useState<QuoteRequestValues>(EMPTY_QUOTE_REQUEST)
  const [privacy, setPrivacy] = useState(false)
  const [errors, setErrors] = useState<QuoteRequestErrors>({})
  const [notice, setNotice] = useState('')
  const [sending, setSending] = useState(false)

  function mountCaptcha() {
    loadRecaptchaV2(() => {
      const grecaptcha = grecaptchaV2()
      if (widgetRef.current !== null || !boxRef.current || !grecaptcha) return
      widgetRef.current = grecaptcha.render(boxRef.current, { sitekey: ZOHO_QUOTE_REQUEST.recaptchaSiteKey, theme: 'light' })
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

  function set(key: QuoteRequestField, value: string) {
    setValues((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNotice('')
    const found = validateQuoteRequest(values, privacy)
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      setNotice('Please check the highlighted fields.')
      formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus()
      return
    }
    const grecaptcha = grecaptchaV2()
    const captchaToken = widgetRef.current !== null ? grecaptcha?.getResponse(widgetRef.current) : ''
    if (!captchaToken) {
      setNotice('Please confirm you’re not a robot.')
      return
    }

    setSending(true)
    const honeypot = (formRef.current?.elements.namedItem(QUOTE_REQUEST_HONEYPOT) as HTMLInputElement | null)?.value ?? ''
    const result = await fetch('/api/zoho-quote-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, privacy, captchaToken, [QUOTE_REQUEST_HONEYPOT]: honeypot }),
    })
      .then((res) => res.json() as Promise<{ ok: boolean; error?: string; errors?: QuoteRequestErrors }>)
      .catch(() => ({ ok: false, error: 'We couldn’t send your request just now. Please try again.' }) as { ok: boolean; error?: string; errors?: QuoteRequestErrors })

    // A token is good for one check, so the box is cleared either way.
    if (widgetRef.current !== null) grecaptcha?.reset(widgetRef.current)
    if (result.ok) {
      identifySalesIqVisitor(values.firstName.trim(), values.lastName.trim(), values.email.trim())
      router.push(ZOHO_QUOTE_REQUEST.thankYouPath)
      return
    }
    setSending(false)
    if (result.errors) setErrors(result.errors)
    setNotice(result.error ?? 'We couldn’t send your request just now. Please try again.')
  }

  const fieldId = (key: string) => `${id}-${key}`

  return (
    <form ref={formRef} onSubmit={onSubmit} onFocus={mountCaptcha} noValidate aria-describedby={`${id}-notice`}>
      <h2 className="text-xl font-extrabold text-theme-dark sm:text-2xl dark:text-white">{ZOHO_QUOTE_REQUEST.title}</h2>
      <p className="mt-1 text-sm text-theme-mid dark:text-neutral-400">
        Fields marked <span className="font-bold text-theme-primary dark:text-red-400">*</span> are required.
      </p>

      {/* Off-screen, not display:none: some bots skip hidden inputs. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={fieldId(QUOTE_REQUEST_HONEYPOT)}>Website</label>
        <input id={fieldId(QUOTE_REQUEST_HONEYPOT)} name={QUOTE_REQUEST_HONEYPOT} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {(Object.keys(QUOTE_REQUEST_FIELDS) as QuoteRequestField[]).map((key) => {
          const field = QUOTE_REQUEST_FIELDS[key]
          const kind = 'kind' in field ? field.kind : 'text'
          const error = errors[key]
          const describedBy = [error ? `${fieldId(key)}-error` : '', key === 'phone' ? `${id}-sms` : ''].filter(Boolean).join(' ') || undefined
          const common = {
            id: fieldId(key),
            'data-field': key,
            value: values[key],
            required: field.required,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': describedBy,
          }
          return (
            <div key={key} className={HALF.includes(key) ? undefined : 'sm:col-span-2'}>
              <label htmlFor={fieldId(key)} className={LABEL}>
                {field.label}
                {field.required && <span className="text-theme-primary dark:text-red-400"> *</span>}
              </label>
              {kind === 'select' && 'options' in field ? (
                <select {...common} onChange={(e) => set(key, e.target.value)} className={`h-12 ${CONTROL} ${OK_BORDER}`}>
                  <option value="">Select an option</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : kind === 'textarea' ? (
                <textarea {...common} rows={4} maxLength={'maxLength' in field ? field.maxLength : undefined} onChange={(e) => set(key, e.target.value)} className={`py-3 ${CONTROL} ${OK_BORDER}`} />
              ) : (
                <input
                  {...common}
                  type={kind}
                  maxLength={'maxLength' in field ? field.maxLength : undefined}
                  autoComplete={'autoComplete' in field ? field.autoComplete : undefined}
                  onChange={(e) => set(key, e.target.value)}
                  className={`h-12 ${CONTROL} ${OK_BORDER}`}
                />
              )}
              {error && <p id={`${fieldId(key)}-error`} className={ERROR}>{error}</p>}
            </div>
          )
        })}
      </div>

      <p id={`${id}-sms`} className="mt-6 text-xs leading-relaxed text-theme-mid dark:text-neutral-400">{ZOHO_QUOTE_REQUEST.smsConsent}</p>

      <div className="mt-4">
        <label className="flex items-start gap-3 text-sm text-theme-dark dark:text-neutral-200">
          <input
            type="checkbox"
            data-field="privacy"
            checked={privacy}
            onChange={(e) => {
              setPrivacy(e.target.checked)
              if (errors.privacy) setErrors((current) => ({ ...current, privacy: undefined }))
            }}
            aria-invalid={errors.privacy ? true : undefined}
            aria-describedby={errors.privacy ? `${id}-privacy-error` : undefined}
            className="mt-0.5 h-5 w-5 shrink-0 accent-theme-primary"
          />
          <span>
            I agree to the{' '}
            <Link href="/privacy-policy" className="font-semibold text-theme-primary underline underline-offset-2 dark:text-red-400">Privacy Policy</Link>{' '}
            and{' '}
            <Link href="/terms-and-conditions" className="font-semibold text-theme-primary underline underline-offset-2 dark:text-red-400">Terms of Service</Link>.
          </span>
        </label>
        {errors.privacy && <p id={`${id}-privacy-error`} className={ERROR}>{errors.privacy}</p>}
      </div>

      {/* Holds the widget once loaded; sized so it doesn't shift the button. */}
      <div ref={boxRef} className="mt-5 min-h-19.5" />

      <p id={`${id}-notice`} role="status" className={`min-h-6 ${notice ? ERROR : ''}`}>{notice}</p>

      <button
        type="submit"
        disabled={sending}
        className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-theme-primary px-8 text-base font-bold text-white shadow-sm transition-colors
                   hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {sending ? <Loader2 aria-hidden className="h-5 w-5 animate-spin" /> : null}
        {sending ? 'Sending…' : 'Submit'}
        {!sending && <ArrowRight aria-hidden className="h-5 w-5" />}
      </button>
    </form>
  )
}
