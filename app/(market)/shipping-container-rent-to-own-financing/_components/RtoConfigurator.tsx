import { RTO_CONFIGURATOR } from '@/lib/data/rentToOwnContent'
import { ContainerConfigurator } from './ContainerConfigurator'
import type { ConfiguratorData } from '@/hooks/useConfiguratorProducts'

type Props = {
  /** The generic listing's rent-to-own products; null if the search failed. */
  initial: ConfiguratorData | null
}

/**
 * The section under the hero: pick a rent-to-own container and add it to the
 * cart. The server renders it with the generic listing's prices, so a first
 * visit shows prices with no fetch; the configurator moves to the visitor's
 * depot once it knows it.
 */
export function RtoConfigurator({ initial }: Props) {
  return (
    <section
      id="rto-configurator"
      aria-label="Choose your rent-to-own container"
      className="scroll-mt-24 bg-white px-[5%] py-10 sm:py-12 dark:bg-neutral-950"
    >
      <ContainerConfigurator setup={RTO_CONFIGURATOR} initial={initial} />
    </section>
  )
}
