import { ArrowRight } from 'lucide-react'
import {
  TAX_EXEMPTION_CERTIFICATE_FIELDS,
  TAX_EXEMPTION_CONTACT_FIELDS,
  TAX_EXEMPTION_FORM,
  TAX_EXEMPTION_REGIONS,
  type TaxExemptionField,
} from '@/lib/data/taxExemptionContent'
import { CertificateUpload } from './CertificateUpload'

const CONTROL =
  'w-full rounded-md border border-neutral-300 bg-white px-4 text-base text-theme-dark outline-none transition-colors ' +
  'focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/15 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white ' +
  'dark:scheme-dark dark:focus:border-red-400 dark:focus:ring-red-400/20'

const LEGEND = 'mb-4 text-lg font-extrabold text-theme-dark dark:text-white'

function fieldId(name: string) {
  return `tax-${name.toLowerCase().replace(/\s+/g, '-')}`
}

function Control({ field, id, hintId }: { field: TaxExemptionField; id: string; hintId?: string }) {
  if (field.kind === 'state') {
    return (
      <select id={id} name={field.name} defaultValue="" className={`h-12 ${CONTROL}`}>
        <option value="">Select a state or province</option>
        {TAX_EXEMPTION_REGIONS.map((region) => (
          <optgroup key={region.label} label={region.label}>
            {region.options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </optgroup>
        ))}
      </select>
    )
  }
  return (
    <input
      id={id}
      name={field.name}
      type={field.kind ?? 'text'}
      required={field.required}
      maxLength={field.maxLength}
      autoComplete={field.autoComplete}
      aria-describedby={hintId}
      className={`h-12 ${CONTROL}`}
    />
  )
}

function Field({ field }: { field: TaxExemptionField }) {
  const id = fieldId(field.name)
  const hintId = field.hint ? `${id}-hint` : undefined
  return (
    <div className={field.wide ? 'sm:col-span-2' : undefined}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-theme-dark dark:text-neutral-200">
        {field.label}
        {field.required && <span className="text-theme-primary dark:text-red-400"> *</span>}
      </label>
      <Control field={field} id={id} hintId={hintId} />
      {field.hint && (
        <p id={hintId} className="mt-1.5 text-sm text-theme-mid dark:text-neutral-400">{field.hint}</p>
      )}
    </div>
  )
}

/**
 * The request form. A Server Component and a plain multipart POST, so it submits
 * without JavaScript and the browser's own validation covers the required fields.
 * Zoho takes the post and sends the visitor on to `returnURL`, the thank-you page.
 */
export function TaxExemptionForm() {
  const { id, action, hidden, fileField, notesField } = TAX_EXEMPTION_FORM

  return (
    <form
      id={id}
      action={action}
      method="POST"
      encType="multipart/form-data"
      acceptCharset="UTF-8"
      className="scroll-mt-28 min-w-0 rounded-xl border border-theme-border bg-white p-5 shadow-sm sm:p-8 dark:border-neutral-800 dark:bg-neutral-900"
    >
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <p className="mb-6 text-sm text-theme-mid dark:text-neutral-400">
        Fields marked <span className="font-bold text-theme-primary dark:text-red-400">*</span> are required.
      </p>

      <fieldset>
        <legend className={LEGEND}>Your Details</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          {TAX_EXEMPTION_CONTACT_FIELDS.map((field) => (
            <Field key={field.name} field={field} />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-8 border-t border-theme-border pt-8 dark:border-neutral-800">
        <legend className={`float-left w-full ${LEGEND}`}>Your Certificate</legend>
        <div className="clear-both grid gap-5 sm:grid-cols-2">
          {TAX_EXEMPTION_CERTIFICATE_FIELDS.map((field) => (
            <Field key={field.name} field={field} />
          ))}
          <div className="sm:col-span-2">
            <CertificateUpload name={fileField} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="tax-notes" className="mb-1.5 block text-sm font-semibold text-theme-dark dark:text-neutral-200">
              {notesField.label}
            </label>
            <textarea id="tax-notes" name={notesField.name} rows={4} className={`py-3 ${CONTROL}`} />
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-theme-primary px-8 text-base font-bold text-white shadow-sm transition-colors
                   hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary sm:w-auto"
      >
        Submit Request
        <ArrowRight aria-hidden className="h-5 w-5" />
      </button>
    </form>
  )
}
