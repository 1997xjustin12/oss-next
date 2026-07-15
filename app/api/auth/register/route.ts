import { NextRequest, NextResponse } from 'next/server'
import { registerUser } from '@/services/user.service'
import { isRecaptchaConfigured, verifyRecaptcha } from '@/lib/recaptcha'
import type { RegisterPayload } from '@/types/user'

export async function POST(request: NextRequest) {
  const { recaptchaToken, ...payload } = (await request.json()) as Partial<RegisterPayload> & {
    recaptchaToken?: string
  }
  const { firstName, lastName, contactNumber, email, password } = payload

  if (!firstName || !lastName || !contactNumber || !email || !password) {
    return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 })
  }

  if (isRecaptchaConfigured()) {
    const recaptchaOk = await verifyRecaptcha(recaptchaToken ?? '')
    if (!recaptchaOk) {
      return NextResponse.json({ error: 'reCAPTCHA verification failed.' }, { status: 400 })
    }
  }

  try {
    const session = await registerUser(payload as RegisterPayload)
    return NextResponse.json(session)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed. Please try again.'
    console.error('[/api/auth/register]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
