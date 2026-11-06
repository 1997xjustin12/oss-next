import Image from 'next/image'
import { LandingRichText } from '@/components/shared/LandingRichText'
import { PillLink } from '@/components/shared/PillLink'
import { RENTAL_LISTING, RENTAL_PRODUCTS } from '@/lib/data/rentalContent'
import type { LandingInline } from '@/lib/data/containerLandingContent'

type Block = {
  heading: string
  paragraphs: readonly (readonly LandingInline[])[]
  images: readonly { src: string; alt: string; width: number; height: number }[]
}

const BODY = 'text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300'

function ProductsRow({ block, id }: { block: Block; id: string }) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[2fr_3fr] lg:gap-10">
      <div>
        <h2 id={id} className="font-anton text-3xl leading-tight tracking-wide text-theme-primary sm:text-4xl dark:text-red-400">
          {block.heading}
        </h2>
        {block.paragraphs.map((paragraph, i) => (
          <p key={i} className={`mt-4 ${BODY}`}>
            <LandingRichText content={paragraph} />
          </p>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {block.images.map((image) => (
          <div key={image.src} className="relative aspect-3/4 overflow-hidden">
            <Image src={image.src} alt={image.alt} fill sizes="(max-width: 1024px) 45vw, 28vw" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** "Our Products" and "We Provide Modifications", each beside two photos, on WordPress's light grey. */
export function RentalProducts() {
  const { products, modifications, cta } = RENTAL_PRODUCTS

  return (
    <section aria-labelledby="rental-products" className="bg-[#F5F5F5] px-[5%] py-12 sm:py-16 dark:bg-neutral-900">
      <ProductsRow id="rental-products" block={{ heading: products.heading, paragraphs: [products.body], images: products.images }} />
      <div className="mt-12">
        <ProductsRow id="rental-modifications" block={modifications} />
      </div>
      <div className="mt-8 text-center">
        <PillLink href={RENTAL_LISTING}>{cta}</PillLink>
      </div>
    </section>
  )
}
