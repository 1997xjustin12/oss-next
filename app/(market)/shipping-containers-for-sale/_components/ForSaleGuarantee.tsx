import Image from 'next/image'
import { SATISFACTION } from '@/lib/data/containerLandingContent'
import { FOR_SALE_GUARANTEE } from '@/lib/data/forSaleContent'

/** "Customer Satisfaction & Money Back Guarantee", on WordPress's grey band. */
export function ForSaleGuarantee() {
  const { heading, body } = FOR_SALE_GUARANTEE
  const { seal } = SATISFACTION

  return (
    <section aria-labelledby="for-sale-guarantee" className="bg-[#E7E7E7] px-[5%] py-12 sm:py-14 dark:bg-neutral-900">
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Image src={seal.src} alt={seal.alt} width={seal.width} height={seal.height} className="h-16 w-auto" />
        <h2 id="for-sale-guarantee" className="text-center font-anton text-3xl leading-tight tracking-wide text-theme-primary sm:text-4xl dark:text-red-400">
          {heading}
        </h2>
      </div>
      <p className="mx-auto mt-5 max-w-5xl text-center text-base leading-relaxed text-theme-dark sm:text-lg dark:text-neutral-300">{body}</p>
    </section>
  )
}
