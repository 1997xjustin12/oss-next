'use client'

import { useId, useState } from 'react'
import Image from 'next/image'
import { RotateCw } from 'lucide-react'
import { GBP_ZOHO_FORMS } from '@/lib/data/gbpShared'

const FORM = GBP_ZOHO_FORMS.quote

/** Browser autofill hints, by Zoho field name. */
const AUTOCOMPLETE: Record<string, string> = {
  'First Name': 'given-name',
  'Last Name': 'family-name',
  Phone: 'tel',
  Email: 'email',
  CONTACTCF7: 'postal-code',
}

const FIELD =
  'h-11 w-full rounded-sm border border-neutral-300 bg-white px-3 text-[15px] text-black outline-none transition-colors ' +
  'focus:border-[var(--gbp-brand,#C60C29)] focus:ring-2 focus:ring-[var(--gbp-brand,#C60C29)]/15 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white'

/**
 * "Get the Best Pricing Now!": the Zoho CRM web-to-contact form every GBP page
 * shares. A plain form posting straight to Zoho, as on WordPress, with the same
 * field names and hidden values, so a lead lands in the same CRM fields.
 *
 * Client only for the captcha's reload button. Required fields use the
 * browser's own validation instead of WordPress's alert() boxes.
 */
export function ZohoQuoteForm() {
  const id = useId()
  // Zoho's reload: the same URL with `&d<time>` so the browser fetches a new image.
  const [captchaKey, setCaptchaKey] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const captchaSrc = captchaKey === null ? FORM.captcha.imageUrl : `${FORM.captcha.imageUrl}&d${captchaKey}`

  return (
    <form
      action={FORM.action}
      method="POST"
      acceptCharset="UTF-8"
      onSubmit={() => setSending(true)}
      className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2"
    >
      {Object.entries(FORM.hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      {FORM.fields.map((field) => {
        const fieldId = `${id}-${field.name.replace(/\s/g, '_')}`
        const wide = field.name === 'CONTACTCF30'
        return (
          <div key={field.name} className={wide ? 'sm:col-span-2' : undefined}>
            <label htmlFor={fieldId} className="mb-1.5 block text-base font-normal leading-none text-black dark:text-neutral-200">
              {field.label}
              {field.required && <span className="text-[var(--gbp-brand,#C60C29)] dark:text-red-400"> *</span>}
            </label>
            {'options' in field ? (
              <select id={fieldId} name={field.name} required={field.required} defaultValue="" className={FIELD}>
                <option value="" disabled>
                  -None-
                </option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={fieldId}
                name={field.name}
                type={'type' in field ? field.type : field.name === 'Phone' ? 'tel' : 'text'}
                required={field.required}
                maxLength={field.maxLength}
                autoComplete={AUTOCOMPLETE[field.name] ?? 'off'}
                inputMode={field.name === 'CONTACTCF7' ? 'numeric' : undefined}
                className={FIELD}
              />
            )}
          </div>
        )
      })}

      <div className="sm:col-span-2">
        <label htmlFor={`${id}-captcha`} className="mb-1.5 block text-base font-normal leading-none text-black dark:text-neutral-200">
          Enter the Captcha<span className="text-[var(--gbp-brand,#C60C29)] dark:text-red-400"> *</span>
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <input id={`${id}-captcha`} name={FORM.captcha.field} required maxLength={10} autoComplete="off" className={`${FIELD} max-w-56`} />
          {/* Straight from Zoho, never through the image optimiser: Zoho checks
              the answer against the image this browser was served. */}
          <Image
            key={captchaSrc}
            src={captchaSrc}
            alt="Captcha: type the characters shown"
            width={150}
            height={50}
            unoptimized
            className="h-12 w-auto rounded-sm bg-white"
          />
          <button
            type="button"
            onClick={() => setCaptchaKey(Date.now())}
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--gbp-brand,#C60C29)] hover:underline dark:text-red-400"
          >
            <RotateCw aria-hidden className="h-4 w-4" />
            Reload
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:col-span-2">
        <input
          type="reset"
          value="Reset"
          className="cursor-pointer rounded-sm border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-sm bg-[var(--gbp-brand,#C60C29)] px-8 py-3 text-base font-medium text-white transition-colors hover:brightness-90 disabled:opacity-60
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gbp-brand,#C60C29)]"
        >
          {sending ? 'Sending…' : 'Submit'}
        </button>
      </div>
    </form>
  )
}
