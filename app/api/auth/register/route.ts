import { NextRequest, NextResponse } from 'next/server'
import { registerUser } from '@/services/user.service'
import type { RegisterPayload } from '@/types/user'

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Partial<RegisterPayload>
  const { firstName, lastName, contactNumber, email, password } = payload

  if (!firstName || !lastName || !contactNumber || !email || !password) {
    return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 })
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
