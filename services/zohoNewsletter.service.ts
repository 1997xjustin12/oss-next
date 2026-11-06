import { ZOHO_FORMS } from '@/lib/data/zohoForms'
import { postZohoWebForm, zohoWebFormRefused, type ZohoWebFormAnswer, type ZohoWebFormOutcome } from '@/services/zohoWebForm.service'

const FORM = ZOHO_FORMS.newsletter

export type ZohoNewsletterOutcome = ZohoWebFormOutcome
export type ZohoNewsletterAnswer = ZohoWebFormAnswer

/** How a Zoho answer is read; shared by every Zoho web form (services/zohoWebForm.service.ts). */
export const zohoNewsletterRefused = zohoWebFormRefused

export type ZohoNewsletterSignup = {
  name: string
  email: string
  /** The reCAPTCHA v2 token from the form's checkbox, which Zoho verifies. */
  captchaToken: string
  userAgent?: string | null
  ip?: string | null
}

/**
 * Sends a newsletter signup to Zoho CRM's newsletter web form, server to
 * server, as the form on the WordPress pages did from the browser: the same
 * form keys, "Full Name" as Zoho's Last Name, and the visitor's captcha token.
 */
export async function sendZohoNewsletter(signup: ZohoNewsletterSignup): Promise<ZohoNewsletterAnswer> {
  const body = new URLSearchParams({ ...FORM.hidden, returnURL: 'null' })
  const [nameField, emailField] = FORM.fields
  body.set(nameField.name, signup.name.trim().slice(0, nameField.maxLength))
  body.set(emailField.name, signup.email.trim().slice(0, emailField.maxLength))
  body.set('g-recaptcha-response', signup.captchaToken)
  return postZohoWebForm({ action: FORM.action, body, tag: 'zoho-newsletter', userAgent: signup.userAgent, ip: signup.ip })
}
