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
}: {
  fullName: string
  email: string
  phone: string
  address: string
}) {
  useEffect(() => {
    // Guard on email: it is the field `getGuestLead` treats as making a lead
    // real, so writing without one would store a record that reads back as null
    // and leave the visitor a stranger anyway.
    if (!email) return
    setGuestLead({ fullName, email, phone, address })
  }, [fullName, email, phone, address])

  return null
}
