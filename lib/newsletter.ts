// Client-safe utility functions for any future newsletter UI (footer widget,
// account dashboard toggle, unsubscribe page — none exist yet) to call
// without each one re-implementing the fetch/error-handling boilerplate.
// These call our own Next.js routes, not the Django backend directly — see
// services/subscriber.service.ts for that side, used only by the route
// handlers below.
export type NewsletterResult = { ok: true } | { ok: false; error: string }

export async function subscribeToNewsletter(email: string): Promise<NewsletterResult> {
  try {
    const res = await fetch('/api/subscribers/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return { ok: false, error: data?.error ?? 'Could not subscribe. Please try again.' }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not subscribe. Please try again.' }
  }
}

export async function unsubscribeFromNewsletter(email: string): Promise<NewsletterResult> {
  try {
    const res = await fetch('/api/subscribers/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return { ok: false, error: data?.error ?? 'Could not unsubscribe. Please try again.' }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not unsubscribe. Please try again.' }
  }
}
