import type { ProductHit } from '@/types/product'
import { getCustomFieldValue } from '@/lib/pricing'

// Defined in containerSpecTerms alongside its label/slug/abbr. Imported for
// use below and re-exported so the many components that reach for it through
// this file keep working.
import type { ContainerVariantKey } from './containerSpecTerms'
export type { ContainerVariantKey }

export function resolveContainerVariant(product: ProductHit): ContainerVariantKey {
  const height = getCustomFieldValue(product, 'height').toLowerCase()
  const isHighCube = height.includes('high') || height.includes('hc')
  const sizeNum = getCustomFieldValue(product, 'length_width').match(/\d+/)?.[0]

  if (sizeNum === '40') return isHighCube ? '40H' : '40S'
  return '20S'
}
