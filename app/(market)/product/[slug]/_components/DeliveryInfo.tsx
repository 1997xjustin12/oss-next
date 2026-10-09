import type { ContainerVariantKey } from '@/lib/containerVariant'
import { Delivery20S } from './delivery/Delivery20S'
import { DeliveryGeneric } from './delivery/DeliveryGeneric'

type Props = { variant: ContainerVariantKey }

/**
 * Picks the delivery panel for the size on screen.
 *
 * A component per size rather than one component full of branches, the same
 * way the overview tab works. The delivery story is expected to diverge — the
 * 20ft one is already a different layout with its own artwork, video and
 * guide — and a dispatcher keeps each size's markup somewhere a designer's
 * changes can land without touching the others.
 *
 * 40S and 40H share `DeliveryGeneric`, which is the copy this tab had for
 * every size before 20ft got its own. Give either one a component here when
 * its design arrives.
 */
export function DeliveryInfo({ variant }: Props) {
  if (variant === '20S') return <Delivery20S />

  return <DeliveryGeneric variant={variant} />
}
