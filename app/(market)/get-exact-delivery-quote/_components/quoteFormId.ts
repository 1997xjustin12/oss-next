/**
 * The contact form's DOM id.
 *
 * Its own module because two components need it and they sit on opposite sides
 * of the server/client boundary: `QuoteForm` is server-rendered and sets it,
 * and `QuoteProceedButton` is a client component in the summary panel that
 * submits the form by name from outside its React tree.
 */
export const QUOTE_FORM_ID = 'quote-details-form'
