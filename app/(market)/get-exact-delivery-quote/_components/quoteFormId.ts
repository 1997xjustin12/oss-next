/**
 * The contact form's DOM id.
 *
 * Its own module because two components need it and they sit in separate
 * React trees: `DeliveryQuoteForm` sets it, and `QuoteProceedButton`, in the
 * summary panel, submits the form by name from outside its tree.
 */
export const QUOTE_FORM_ID = 'quote-details-form'

/**
 * Fired on `document` by DeliveryQuoteForm when a send to Zoho starts
 * (`detail: true`) and ends (`detail: false`), so the button can show the wait
 * and come back after a refusal. On `document`, not the form: the two stream in
 * separately, and the button may be listening before the form exists.
 */
export const QUOTE_SENDING_EVENT = 'oss:quote-form-sending'
