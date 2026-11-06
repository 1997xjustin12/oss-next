/**
 * Google reCAPTCHA v2 (the "I'm not a robot" checkbox), which Zoho's newsletter
 * form requires: Zoho checks the token itself. The app's own forms use v3
 * (lib/recaptchaClient.ts), which loads a different script.
 */

/** v2's API. The app declares `window.grecaptcha` for v3 elsewhere, so it is read through this type. */
export type GrecaptchaV2 = {
  render: (el: HTMLElement, opts: { sitekey: string; theme?: 'light' | 'dark'; callback?: () => void; 'expired-callback'?: () => void }) => number
  getResponse: (id?: number) => string
  reset: (id?: number) => void
}

type RecaptchaWindow = Window & { __gbpRecaptchaReady?: () => void }

const SCRIPT_ID = 'gbp-recaptcha'

export function grecaptchaV2(): GrecaptchaV2 | undefined {
  const g = (window as { grecaptcha?: unknown }).grecaptcha as Partial<GrecaptchaV2> | undefined
  return g?.render && g.getResponse ? (g as GrecaptchaV2) : undefined
}

/** One script tag for the page, however many forms ask. */
export function loadRecaptchaV2(onReady: () => void) {
  if (grecaptchaV2()) return onReady()
  const win = window as RecaptchaWindow
  const previous = win.__gbpRecaptchaReady
  win.__gbpRecaptchaReady = () => {
    previous?.()
    onReady()
  }
  if (document.getElementById(SCRIPT_ID)) return
  const script = document.createElement('script')
  script.id = SCRIPT_ID
  script.src = 'https://www.google.com/recaptcha/api.js?onload=__gbpRecaptchaReady&render=explicit'
  script.async = true
  document.head.appendChild(script)
}
