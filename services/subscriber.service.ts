const BACKEND_URL = process.env.NEXT_OSS_BACKEND_URL
const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN

const SUBSCRIBE_URL = `${BACKEND_URL}api/subscribers/subscribe/`
const UNSUBSCRIBE_URL = `${BACKEND_URL}api/subscribers/unsubscribe/`

// TODO: confirm the real request/response contract against the OSS backend.
export async function subscribeToNewsletter(email: string): Promise<void> {
  const res = await fetch(SUBSCRIBE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
    },
    body: JSON.stringify({ email }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error ?? data?.detail ?? 'Could not subscribe. Please try again.')
  }
}

export async function unsubscribeFromNewsletter(email: string): Promise<void> {
  const res = await fetch(UNSUBSCRIBE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
    },
    body: JSON.stringify({ email }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error ?? data?.detail ?? 'Could not unsubscribe. Please try again.')
  }
}
