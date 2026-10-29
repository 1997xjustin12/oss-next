import { ZOHO_QUOTE_FORM } from '@/lib/zohoQuoteForm'

type Props = {
  /** `frameName` from useZohoQuoteForm; the form's `target` must be the same. */
  frameName: string
}

/**
 * What every copy of the Zoho quote form carries besides its fields: Zoho's
 * hidden values, and the hidden frame the form posts into, so Zoho's
 * thank-you page loads there instead of replacing the page the visitor is on.
 * Goes inside the `<form>`.
 */
export function ZohoQuotePost({ frameName }: Props) {
  return (
    <>
      {Object.entries(ZOHO_QUOTE_FORM.hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <iframe name={frameName} title="Quote request" hidden tabIndex={-1} />
    </>
  )
}
