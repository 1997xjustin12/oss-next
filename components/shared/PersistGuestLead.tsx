'use client'

import { useEffect } from 'react'
import { setGuestLead } from '@/lib/guestCapture'

/**
 * Writes the details this flow captured into the store `GuestLeadModal` reads.
 *
 * Without it the two capture points would not know about each other: someone
 * could complete this whole form and still be treated as a stranger on the next
 * product page, sent back here to type the same four fields again.
 *
 * It has to happen in the browser — the form is a Server Action and the store
 * is `localStorage`, so the server cannot write it. It therefore belongs on
 * whichever page the visitor lands on after submitting, which is why it is
 * rendered from two of them: the quote review page, and checkout. Both read the
 * same httpOnly draft cookie on the server and hand the values down.
 *
 * Renders nothing. `setGuestLead` also stamps the email into the key the
 * exit-intent prompt reads, so finishing this form stops that prompt asking the
 * same person for the same thing on their way out.
 */
export function PersistGuestLead({
  fullName,
  email,
  phone,
  address,
  address1 = '',
  address2 = '',
  city = '',
  state = '',
  zip = '',
  country = '',
}: {
  fullName: string
  email: string
  phone: string
  address: string
  /**
   * The address in parts, when the flow collected them. Optional because the
   * product page's picker has only ever had a place label — a lead stored
   * without them is still a lead, it just leaves checkout more to fill in.
   */
  address1?: string
  address2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}) {
  useEffect(() => {
    // Guard on email: it is the field `getGuestLead` treats as making a lead
    // real, so writing without one would store a record that reads back as null
    // and leave the visitor a stranger anyway.
    if (!email) return
    setGuestLead({ fullName, email, phone, address, address1, address2, city, state, zip, country })
  }, [fullName, email, phone, address, address1, address2, city, state, zip, country])

  return null
}
