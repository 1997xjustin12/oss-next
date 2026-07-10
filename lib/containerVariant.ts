import type { ProductHit } from '@/types/product'
import { getCustomFieldValue } from '@/lib/pricing'

// The three physical container variants this catalog carries — [Size][Height]:
// 20S = 20' Standard, 40S = 40' Standard, 40H = 40' High Cube.
// Shared across every component whose content depends on which one is active
// (quick specs, PDP tabs, FAQ) so they all agree on the same classification.
export type ContainerVariantKey = '20S' | '40S' | '40H'

export function resolveContainerVariant(product: ProductHit): ContainerVariantKey {
  const height = getCustomFieldValue(product, 'height').toLowerCase()
  const isHighCube = height.includes('high') || height.includes('hc')
  const sizeNum = getCustomFieldValue(product, 'length_width').match(/\d+/)?.[0]

  if (sizeNum === '40') return isHighCube ? '40H' : '40S'
  return '20S'
}
