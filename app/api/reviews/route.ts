import { NextRequest, NextResponse } from 'next/server'
import { getReviewsByVariant } from '@/services/review.service'
import type { ContainerVariantKey } from '@/lib/containerVariant'

const VALID_VARIANTS: ContainerVariantKey[] = ['20S', '40S', '40H']

function isContainerVariantKey(value: string | null): value is ContainerVariantKey {
  return VALID_VARIANTS.includes(value as ContainerVariantKey)
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const variant = searchParams.get('variant')
  const limit = Number(searchParams.get('limit') ?? '15')

  if (!isContainerVariantKey(variant)) {
    return NextResponse.json({ error: 'variant must be one of 20S, 40S, 40H' }, { status: 400 })
  }

  const result = await getReviewsByVariant([variant], limit)
  return NextResponse.json(result)
}
