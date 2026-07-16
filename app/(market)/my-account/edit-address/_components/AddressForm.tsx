'use client'

import { useState, FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { UserProfile } from '@/types/user'

type AddressKey = 'billing' | 'shipping'

const ADDRESS_FIELDS: Record<AddressKey, { address: string; city: string; state: string; zip: string; country: string }> = {
  billing: { address: 'billingAddress', city: 'billingCity', state: 'billingState', zip: 'billingZip', country: 'billingCountry' },
  shipping: { address: 'shippingAddress', city: 'shippingCity', state: 'shippingState', zip: 'shippingZip', country: 'shippingCountry' },
}

const ADDRESS_TYPES: { key: AddressKey; label: string; hint: string }[] = [
  { key: 'billing', label: 'Billing address', hint: 'The address used on your invoices and payment receipts.' },
  { key: 'shipping', label: 'Shipping address', hint: 'The default delivery address for your container orders.' },
]

export function AddressForm() {
  const { user, token, login } = useAuth()
  const [profile, setProfile] = useState<UserProfile>(user?.profile ?? {})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const update = (key: keyof UserProfile, value: string) => setProfile((p) => ({ ...p, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!token || !user) {
      setError('You must be logged in to update your addresses.')
      return
    }

    try {
      setIsSubmitting(true)
      // Full-object PUT under the hood — must resend the user's current name/
      // email unchanged alongside the address fields this form edits, or
      // saving here would wipe out whatever /my-account/edit-account set.
      const res = await fetch('/api/auth/account-details', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          email: user.email,
          profile,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Could not update addresses.')

      login({ user: { ...user, ...data.user }, token })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update addresses. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-md border border-theme-border bg-theme-subtle px-3.5 py-2.5 text-sm text-theme-dark ' +
    'placeholder:text-theme-muted outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 transition-colors ' +
    'dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500'

  const labelClass = 'block text-xs font-semibold text-theme-dark-2 mb-1 dark:text-gray-300'

  return (
    <div>
      {success && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400">
          Addresses updated.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md border border-theme-primary/30 bg-theme-primary-light px-4 py-3 text-sm text-theme-primary dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="addr-phone" className={labelClass}>
            Phone number
          </label>
          <input
            id="addr-phone"
            type="tel"
            autoComplete="tel"
            value={profile.phone ?? ''}
            onChange={(e) => update('phone', e.target.value)}
            className={`${inputClass} mb-5 max-w-xs`}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {ADDRESS_TYPES.map(({ key, label, hint }) => {
            const fields = ADDRESS_FIELDS[key]
            return (
              <div
                key={key}
                className="rounded-md border border-theme-border bg-theme-subtle p-5 dark:border-gray-700 dark:bg-gray-800"
              >
                <p className="font-semibold text-theme-dark dark:text-white">{label}</p>
                <p className="mb-4 text-xs text-theme-muted dark:text-gray-400">{hint}</p>

                <div className="flex flex-col gap-3">
                  <div>
                    <label htmlFor={`${key}-address`} className={labelClass}>
                      Street address
                    </label>
                    <input
                      id={`${key}-address`}
                      type="text"
                      autoComplete={`${key} street-address`}
                      value={profile[fields.address as keyof UserProfile] ?? ''}
                      onChange={(e) => update(fields.address as keyof UserProfile, e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`${key}-city`} className={labelClass}>
                        City
                      </label>
                      <input
                        id={`${key}-city`}
                        type="text"
                        autoComplete={`${key} address-level2`}
                        value={profile[fields.city as keyof UserProfile] ?? ''}
                        onChange={(e) => update(fields.city as keyof UserProfile, e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor={`${key}-state`} className={labelClass}>
                        State
                      </label>
                      <input
                        id={`${key}-state`}
                        type="text"
                        autoComplete={`${key} address-level1`}
                        value={profile[fields.state as keyof UserProfile] ?? ''}
                        onChange={(e) => update(fields.state as keyof UserProfile, e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`${key}-zip`} className={labelClass}>
                        ZIP code
                      </label>
                      <input
                        id={`${key}-zip`}
                        type="text"
                        autoComplete={`${key} postal-code`}
                        value={profile[fields.zip as keyof UserProfile] ?? ''}
                        onChange={(e) => update(fields.zip as keyof UserProfile, e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor={`${key}-country`} className={labelClass}>
                        Country
                      </label>
                      <input
                        id={`${key}-country`}
                        type="text"
                        autoComplete={`${key} country-name`}
                        value={profile[fields.country as keyof UserProfile] ?? ''}
                        onChange={(e) => update(fields.country as keyof UserProfile, e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-semibold px-6 py-2.5 text-sm
                     transition-colors disabled:cursor-not-allowed disabled:opacity-60
                     focus:outline-none focus:ring-2 focus:ring-theme-primary/40 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          {isSubmitting ? 'Saving…' : 'Save addresses'}
        </button>
      </form>
    </div>
  )
}
