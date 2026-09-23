'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { getGuestLead } from '@/lib/guestCapture'

/**
 * Name, phone and email — the three the quote is sent to.
 *
 * A client component for one reason: the guest-lead modal on the product page
 * keeps what it collected in `localStorage`, which a server-rendered form
 * cannot see. Until 2026-09-23 this form read only the quote draft *cookie*, so
 * a visitor who had just given these three details in the modal arrived here to
 * three empty boxes and typed them again. Checkout never had that problem
 * because it is a client component and reads the lead directly.
 *
 * The draft still wins where it exists: it is what the visitor typed on this
 * form, and a failed submit must hand it back unchanged rather than quietly
 * replacing it with something older.
 */

export type ContactDefaults = {
  fullName?: string
  phone?: string
  email?: string
}

const FIELD =
  'h-12 w-full rounded-md border border-theme-border bg-theme-bg px-4 text-sm text-theme-dark outline-none transition-colors focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/25 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white'
const LABEL = 'mb-1.5 block text-xs font-semibold text-theme-dark dark:text-neutral-200'

export function ContactFields({ defaults }: { defaults: ContactDefaults }) {
  /**
   * Read once, on the first client render. The modal writes this before the
   * visitor can reach this page, so there is nothing to wait for — and a lazy
   * initialiser keeps the boxes right on the first paint rather than filling
   * them a frame later.
   */
  const lead = useState(() => getGuestLead())[0]

  const [fullName, setFullName] = useState(defaults.fullName || lead?.fullName || '')
  const [phone, setPhone] = useState(defaults.phone || lead?.phone || '')
  const [email, setEmail] = useState(defaults.email || lead?.email || '')

  return (
    <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
      <div>
        <label htmlFor="fullName" className={LABEL}>
          Full Name <span className="text-theme-primary">*</span>
        </label>
        <input
          id="fullName"
          name="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
          placeholder="Full Name"
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="phone" className={LABEL}>
          Phone Number <span className="text-theme-primary">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          autoComplete="tel"
          placeholder="Phone Number"
          className={FIELD}
        />
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-theme-success-dark dark:text-emerald-400">
          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
          We&rsquo;ll use this to send you your exact delivery quote.
        </p>
      </div>

      <div>
        <label htmlFor="email" className={LABEL}>
          Email Address <span className="text-theme-primary">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="Email Address"
          className={FIELD}
        />
      </div>
    </div>
  )
}
