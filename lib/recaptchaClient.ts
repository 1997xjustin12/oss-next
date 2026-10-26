/**
 * Browser half of reCAPTCHA v3.
 *
 * v3 has no checkbox. The script runs invisibly, scores the visitor, and hands
 * back a token when asked — so there is nothing to render and nothing for
 * anyone to tick. That is why this is a function rather than a component: the
 * old `<Recaptcha>` drew a v2 "I'm not a robot" box, which a v3 key refuses
 * with "ERROR for site owner: Invalid key type".
 *
 * **Call this at submit, not on mount.** A v3 token is valid for about two
 * minutes. Fetching one when a form appears and holding it means anyone who
 * takes longer than that to type submits an expired token and is told to try
 * again — with nothing on screen to explain why.
 */

declare global {
  interface Window {
    grecaptcha?: {
      ready?: (cb: () => void) => void
      execute?: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

/**
 * One load per page, however many forms ask for it.
 *
 * Module scope rather than a ref: checkout and registration are different
 * routes, but a client-side navigation between them keeps the module alive,
 * and loading Google's script twice is wasted bytes at best.
 */
let scriptPromise: Promise<void> | null = null

function loadScript(siteKey: string): Promise<void> {
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') return resolve()
    if (window.grecaptcha?.execute) return resolve()

    const script = document.createElement('script')
    // `render=<siteKey>` is what makes this v3: the API loads for that key and
    // exposes `execute`. The v2 spelling (`render=explicit`) exposes `render`
    // instead, which is the mismatch that produced the invalid-key-type error.
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      // Let the next attempt try again rather than caching the failure
      // forever — a blocked request now may succeed on the next submit.
      scriptPromise = null
      reject(new Error('reCAPTCHA script failed to load'))
    }
    document.head.appendChild(script)
  })

  return scriptPromise
}

/**
 * Start loading the script, without asking for a token.
 *
 * Call this when a protected form mounts. v3 scores a visitor on what it
 * observes them doing, so a script that only appears at the moment of submit
 * has seen nothing and has little to score on — and the customer waits for a
 * network round trip inside their own click. Loading early separates the two:
 * Google watches while the form is filled, and `getRecaptchaToken` is then
 * only an `execute`.
 *
 * Safe to call repeatedly; the load is shared.
 */
export function preloadRecaptcha(siteKey: string): void {
  if (!siteKey) return
  void loadScript(siteKey).catch(() => {
    // Swallowed: a failed preload is not worth surfacing, and the submit path
    // retries and reports for itself.
  })
}

/**
 * A fresh token for one action, or null if one could not be obtained.
 *
 * Null rather than a throw: the caller decides what a missing token means.
 * The server rejects a request without one when reCAPTCHA is configured, so a
 * blocked script fails closed — but that is the server's call to make, not
 * something this should decide by crashing a form.
 *
 * `action` is sent to Google and echoed back in the verification response, so
 * the server can check the token was minted for the thing being done rather
 * than lifted from another form.
 */
export async function getRecaptchaToken(siteKey: string, action: string): Promise<string | null> {
  if (!siteKey) return null

  try {
    await loadScript(siteKey)

    // `ready` resolves once the API has finished initialising. Wait for it
    // BEFORE looking for `execute`: right after api.js loads, `window.grecaptcha`
    // has `ready` but not yet `execute` (that arrives with the second script it
    // pulls in). Checking first returned null on every cold call, so a form
    // that had not preloaded (the newsletter signup) always sent no token and
    // was rejected; preloading forms only got away with it by being slow.
    await new Promise<void>((resolve) => {
      const ready = window.grecaptcha?.ready
      if (typeof ready === 'function') ready(resolve)
      else resolve()
    })

    const grecaptcha = window.grecaptcha
    if (typeof grecaptcha?.execute !== 'function') return null

    return await grecaptcha.execute(siteKey, { action })
  } catch (err) {
    console.error('[recaptcha] could not get a token for action:', action, err)
    return null
  }
}
