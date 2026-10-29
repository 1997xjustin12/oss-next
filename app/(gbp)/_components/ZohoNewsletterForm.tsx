'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { GBP_ZOHO_FORMS } from '@/lib/data/gbpShared'

const FORM = GBP_ZOHO_FORMS.newsletter

/**
 * reCAPTCHA v2's API. The app declares `window.grecaptcha` for v3 (execute)
 * elsewhere; this form uses v2's checkbox (render, getResponse), so it reads
 * the global through this type rather than redeclaring it.
 */
type GrecaptchaV2 = {
  render: (el: HTMLElement, opts: { sitekey: string; theme?: 'light' | 'dark'; callback?: () => void }) => number
  getResponse: (id?: number) => string
}
type RecaptchaWindow = Window & { __gbpRecaptchaReady?: () => void }

function grecaptchaV2(): GrecaptchaV2 | undefined {
  const g = (window as { grecaptcha?: unknown }).grecaptcha as Partial<GrecaptchaV2> | undefined
  return g?.render && g.getResponse ? (g as GrecaptchaV2) : undefined
}

const FIELD =
  'h-11 w-full rounded-sm border border-neutral-300 bg-white px-3 text-[15px] text-black outline-none transition-colors ' +
  'focus:border-[#C60C29] focus:ring-2 focus:ring-[#C60C29]/15 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white'

/** One script tag for the page, however many forms ask. */
function loadRecaptcha(onReady: () => void) {
  if (grecaptchaV2()) return onReady()
  ;(window as RecaptchaWindow).__gbpRecaptchaReady = onReady
  if (document.getElementById('gbp-recaptcha')) return
  const script = document.createElement('script')
  script.id = 'gbp-recaptcha'
  script.src = 'https://www.google.com/recaptcha/api.js?onload=__gbpRecaptchaReady&render=explicit'
  script.async = true
  document.head.appendChild(script)
}

/**
 * The newsletter sign-up: Zoho CRM web-to-contact with Google reCAPTCHA v2,
 * as on WordPress (same fields, hidden values and thank-you page).
 *
 * reCAPTCHA loads only when the form comes near the viewport or a field is
 * focused: it is about 400 KB of Google script that most visitors never need.
 * The widget writes its token into the form as `g-recaptcha-response`, which
 * Zoho checks.
 */
export function ZohoNewsletterForm() {
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<number | null>(null)
  const [captchaError, setCaptchaError] = useState(false)

  function mountCaptcha() {
    loadRecaptcha(() => {
      const grecaptcha = grecaptchaV2()
      if (widgetRef.current !== null || !boxRef.current || !grecaptcha) return
      widgetRef.current = grecaptcha.render(boxRef.current, {
        sitekey: FORM.recaptchaSiteKey,
        theme: 'light',
        callback: () => setCaptchaError(false),
      })
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

  return (
    <form
      ref={formRef}
      action={FORM.action}
      method="POST"
      acceptCharset="UTF-8"
      onFocus={mountCaptcha}
      onSubmit={(e) => {
        const token = widgetRef.current !== null ? grecaptchaV2()?.getResponse(widgetRef.current) : ''
        if (!token) {
          e.preventDefault()
          setCaptchaError(true)
        }
      }}
      className="space-y-3"
    >
      {Object.entries(FORM.hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {FORM.fields.map((field) => {
        const fieldId = `${id}-${field.name.replace(/\s/g, '_')}`
        return (
          <div key={field.name}>
            <label htmlFor={fieldId} className="mb-1.5 block text-base font-normal leading-none text-black dark:text-neutral-200">
              {field.label}
              <span className="text-[#C60C29] dark:text-red-400"> *</span>
            </label>
            <input
              id={fieldId}
              name={field.name}
              type={'type' in field ? field.type : 'text'}
              required
              maxLength={field.maxLength}
              autoComplete={field.name === 'Email' ? 'email' : 'name'}
              className={FIELD}
            />
          </div>
        )
      })}

      {/* Holds the widget once loaded; sized so it doesn't shift the buttons. */}
      <div ref={boxRef} className="min-h-19.5" />
      {captchaError && (
        <p role="alert" className="text-sm text-[#C60C29] dark:text-red-400">
          Please confirm you&apos;re not a robot.
        </p>
      )}

      <div className="flex items-center gap-4">
        <input
          type="reset"
          value="Reset"
          className="cursor-pointer rounded-sm border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
        />
        <button
          type="submit"
          className="rounded-sm bg-[#C60C29] px-8 py-3 text-base font-medium text-white transition-colors hover:bg-[#a30a22]
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C60C29]"
        >
          Submit
        </button>
      </div>
    </form>
  )
}
