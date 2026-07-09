import { NextRequest, NextResponse } from 'next/server'
import { updateAccountDetails } from '@/services/user.service'
import type { AccountDetailsPayload } from '@/types/user'

export async function PATCH(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const payload = (await request.json()) as Partial<AccountDetailsPayload>
  const { firstName, lastName, email } = payload

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  if (!firstName || !lastName || !email) {
    return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 })
  }

  try {
    const user = await updateAccountDetails(token, payload as AccountDetailsPayload)
    return NextResponse.json({ user })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not update account details. Please try again.'
    console.error('[/api/auth/account-details]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
