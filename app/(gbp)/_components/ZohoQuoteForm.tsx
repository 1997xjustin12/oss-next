'use client'

import { ZohoPricingForm, type ZohoPricingFormClasses } from '@/components/shared/ZohoPricingForm'

const FIELD =
  'h-11 w-full rounded-sm border border-neutral-300 bg-white px-3 text-[15px] text-black outline-none transition-colors ' +
  'focus:border-[var(--gbp-brand,#C60C29)] focus:ring-2 focus:ring-[var(--gbp-brand,#C60C29)]/15 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white'

const LABEL = 'mb-1.5 block text-base font-normal leading-none text-black dark:text-neutral-200'

/** The GBP pages' look, as it was before the form was shared with the homepage. */
const GBP_CLASSES: ZohoPricingFormClasses = {
  form: 'grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2',
  fieldWrap: (name) => (name === 'CONTACTCF30' ? 'sm:col-span-2' : ''),
  label: LABEL,
  required: 'text-[var(--gbp-brand,#C60C29)] dark:text-red-400',
  field: FIELD,
  captchaWrap: 'sm:col-span-2',
  captchaInput: `${FIELD} max-w-56`,
  captchaImage: 'h-12 w-auto rounded-sm bg-white',
  reload: 'inline-flex items-center gap-1 text-sm font-medium text-[var(--gbp-brand,#C60C29)] hover:underline dark:text-red-400',
  actions: 'flex items-center justify-between gap-3 sm:col-span-2',
  reset:
    'cursor-pointer rounded-sm border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800',
  submit:
    'rounded-md bg-[var(--gbp-brand,#C60C29)] px-8 py-3 text-base font-medium text-white transition-colors hover:brightness-90 disabled:opacity-60 ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gbp-brand,#C60C29)]',
}

/**
 * "Get the Best Pricing Now!": the Zoho CRM pricing form every GBP page
 * shares, in the GBP pages' look. The form itself (fields, captcha, posting to
 * Zoho) is components/shared/ZohoPricingForm.tsx, shared with the homepage.
 */
export function ZohoQuoteForm() {
  return <ZohoPricingForm classes={GBP_CLASSES} showReset />
}
