'use client'

import { useId, useState } from 'react'
import Image from 'next/image'
import { RotateCw } from 'lucide-react'
import { ZOHO_PRICING_FORM } from '@/lib/data/zohoForms'

const FORM = ZOHO_PRICING_FORM

type FieldName = (typeof FORM.fields)[number]['name']

/** Browser autofill hints, by Zoho field name. */
const AUTOCOMPLETE: Record<string, string> = {
  'First Name': 'given-name',
  'Last Name': 'family-name',
  Phone: 'tel',
  Email: 'email',
  CONTACTCF7: 'postal-code',
}

/** The look, from the page showing the form; the fields and their behaviour are the same everywhere. */
export type ZohoPricingFormClasses = {
  /** The <form>: its grid and gaps. */
  form: string
  /** Each field's wrapper, by Zoho field name (e.g. half or full width). */
  fieldWrap: (name: FieldName) => string
  label: string
  /** The asterisk after a required label. */
  required: string
  /** Inputs and selects. */
  field: string
  /** The captcha block's wrapper. */
  captchaWrap: string
  captchaInput: string
  captchaImage: string
  reload: string
  /** The row holding Reset (if shown) and Submit. */
  actions: string
  submit: string
  reset?: string
}

type Props = {
  classes: ZohoPricingFormClasses
  /** Placeholder text, by Zoho field name. */
  placeholders?: Partial<Record<FieldName | 'enterdigest', string>>
  /** Label overrides, by Zoho field name (the defaults are Zoho's labels). */
  labels?: Partial<Record<FieldName, string>>
  submitLabel?: string
  /** Show the form's Reset button, as the GBP pages do. */
  showReset?: boolean
  /** Text after the Submit button, e.g. a reassurance line. */
  footnote?: React.ReactNode
}

/**
 * Zoho CRM's web-to-contact pricing form ("Get the Best Pricing Now!", from
 * the WordPress GBP pages), wherever it is shown: the GBP pages and the
 * homepage. A plain form posting straight to Zoho, as Zoho's embed does, with
 * the same field names and hidden values (lib/data/zohoForms.ts), so a lead
 * lands in the same CRM fields from either page. Zoho answers in the browser:
 * its thank-you page, or "Invalid CAPTCHA code" and back to the form.
 *
 * Client only for the captcha's reload button and the sending state. Required
 * fields use the browser's own validation instead of WordPress's alert() boxes.
 */
export function ZohoPricingForm({ classes, placeholders = {}, labels = {}, submitLabel = 'Submit', showReset = false, footnote }: Props) {
  const id = useId()
  // Zoho's reload: the same URL with `&d<time>` so the browser fetches a new image.
  const [captchaKey, setCaptchaKey] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const captchaSrc = captchaKey === null ? FORM.captcha.imageUrl : `${FORM.captcha.imageUrl}&d${captchaKey}`

  return (
    <form action={FORM.action} method="POST" acceptCharset="UTF-8" onSubmit={() => setSending(true)} className={classes.form}>
      {Object.entries(FORM.hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      {FORM.fields.map((field) => {
        const fieldId = `${id}-${field.name.replace(/\s/g, '_')}`
        return (
          <div key={field.name} className={classes.fieldWrap(field.name)}>
            <label htmlFor={fieldId} className={classes.label}>
              {labels[field.name] ?? field.label}
              {field.required && <span className={classes.required}> *</span>}
            </label>
            {'options' in field ? (
              <select id={fieldId} name={field.name} required={field.required} defaultValue="" className={classes.field}>
                <option value="" disabled>
                  {placeholders[field.name] ?? '-None-'}
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
                placeholder={placeholders[field.name]}
                className={classes.field}
              />
            )}
          </div>
        )
      })}

      <div className={classes.captchaWrap}>
        <label htmlFor={`${id}-captcha`} className={classes.label}>
          Enter the Captcha<span className={classes.required}> *</span>
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            id={`${id}-captcha`}
            name={FORM.captcha.field}
            required
            maxLength={10}
            autoComplete="off"
            placeholder={placeholders.enterdigest}
            className={classes.captchaInput}
          />
          {/* Straight from Zoho, never through the image optimiser: Zoho checks
              the answer against the image this browser was served. */}
          <Image
            key={captchaSrc}
            src={captchaSrc}
            alt="Captcha: type the characters shown"
            width={150}
            height={50}
            unoptimized
            className={classes.captchaImage}
          />
          <button type="button" onClick={() => setCaptchaKey(Date.now())} className={classes.reload}>
            <RotateCw aria-hidden className="h-4 w-4" />
            Reload
          </button>
        </div>
      </div>

      <div className={classes.actions}>
        {showReset && <input type="reset" value="Reset" className={classes.reset} />}
        <button type="submit" disabled={sending} className={classes.submit}>
          {sending ? 'Sending…' : submitLabel}
        </button>
        {footnote}
      </div>
    </form>
  )
}
