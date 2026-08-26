"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { isContainerHit } from "@/lib/pricing";
import { resolveContainerVariant } from "@/lib/containerVariant";
import { ROUTES } from "@/config/routes";
import type { ProductHit } from "@/types/product";
import { ProductVariantShell } from "./ProductVariantShell";
import { AccessoryDetail } from "./AccessoryDetail";
import { BodyTabsSection } from "./BodyTabsSection";
import { FaqAccordion } from "./FaqAccordion";
// WordPress-sourced reviews (previous PDP source) — kept in place, easy to
// restore by swapping the import + JSX below, if ReviewsCarousel needs to be
// rolled back before the OSS reviews table has enough approved data.
// import { CustomerReviews } from './CustomerReviews'
import { ReviewsCarousel } from "./ReviewsCarousel";
import { YouMayAlsoNeed } from "./YouMayAlsoNeed";
import { QuoteForm } from "@/components/shared/QuoteForm";
import { StatesSection } from "@/app/(market)/(home)/_components/StatesSection";
import { ReviewsSection } from "@/app/(market)/(home)/_components/ReviewsSection";

const fmt = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

type IdealForItem = {
  id: string;
  image: string;
  title: string;
};

/**
 * The uses shown in the "Ideal for" strip.
 *
 * Six entries to match the six-column grid. `title` doubles as the image's alt
 * text, so it has to read as a description of the picture and not just a label
 * — which it does, since each image is a photograph of the use it names.
 */
const IDEAL_FOR: IdealForItem[] = [
  {
    id: "residential-storage",
    image: "/images/pdp-ideal-for-section/residential-storage.webp",
    title: "Residential Storage",
  },
  {
    id: "construction-sites",
    image: "/images/pdp-ideal-for-section/construction-sites.webp",
    title: "Construction Sites",
  },
  {
    id: "disaster-relief",
    image: "/images/pdp-ideal-for-section/disaster-relief.webp",
    title: "Disaster Relief",
  },
  {
    id: "workshop-space",
    image: "/images/pdp-ideal-for-section/workshop-space.webp",
    title: "Workshop Space",
  },
  {
    id: "pop-up-retail",
    image: "/images/pdp-ideal-for-section/pop-up-retail.webp",
    title: "Pop-Up Retail",
  },
  {
    id: "farm-and-agri",
    image: "/images/pdp-ideal-for-section/farm-and-agri.webp",
    title: "Farm & Agriculture",
  },
];

type Props = { product: ProductHit; relatedProducts: ProductHit[] };

export function ProductDetail({ product, relatedProducts }: Props) {
  // Shared across ProductVariantShell, BodyTabsSection, and FaqAccordion so
  // they all react to whichever variant the shopper currently has selected.
  const [activeProduct, setActiveProduct] = useState(product);

  if (!isContainerHit(product)) {
    return <AccessoryDetail product={product} />;
  }

  const containerVariant = resolveContainerVariant(activeProduct);

  // Real ES-backed containers from the same location, excluding whichever
  // variant is currently on screen — was previously a hardcoded array with
  // fabricated prices and dead CTA buttons; this section is hidden entirely
  // rather than shown empty/fake when there's nothing real to display.
  const relatedToShow = relatedProducts
    .filter((p) => p.objectID !== activeProduct.objectID)
    .slice(0, 4);

  return (
    <div className="bg-theme-bg text-theme-dark">
      {/* Breadcrumb + product grid */}
      <ProductVariantShell
        product={product}
        relatedProducts={relatedProducts}
        activeProduct={activeProduct}
        onVariantChange={setActiveProduct}
      />

      {/* BODY TABS */}
      <BodyTabsSection variant={containerVariant} />

      <section className="px-4 sm:px-[5%] py-10 sm:py-16">
        <div className="flex flex-col gap-[10px]">
          <h2 className="text-[24px] font-bold">Ideal for:</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[10px]">
            {IDEAL_FOR.map((item) => (
              <li
                key={item.id}
                className="relative aspect-square overflow-hidden rounded-[10px] bg-stone-200"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  // Six across on desktop, three on tablet, two on mobile —
                  // tells the browser how small these actually render, so it
                  // doesn't fetch a full-width image for a thumbnail.
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover"
                />
                {/* Gradient sits behind the caption so white text stays legible
                    whatever the photograph underneath happens to be. */}
                <div className="absolute right-[10px] bottom-[10px] bg-[#E7EDF9] px-2 py-1 border-[0.5px] border-[#A3A3A3] rounded-[5px] text-[10px] font-semibold leading-tight text-[#00318C]">
                  <div>{item.title}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      {/* {relatedToShow.length > 0 && (
        <section className="px-4 sm:px-[5%] py-10 sm:py-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">You May Also Need</h2>
            <Link href={ROUTES.PLP} className="text-xs sm:text-sm font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors whitespace-nowrap">
              View All Containers →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedToShow.map((p) => (
              <Link
                key={p.objectID}
                href={ROUTES.PRODUCT(p.handle)}
                className="rounded-lg border border-theme-border bg-theme-bg overflow-hidden hover:border-theme-primary hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <div className="relative h-32 bg-theme-subtle">
                  {p.images?.[0]?.src ? (
                    <Image src={p.images[0].src} alt={p.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 25vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-theme-muted" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <div className="p-3.5">
                  <h4 className="font-extrabold text-sm mb-2 line-clamp-2 leading-snug">{p.title}</h4>
                  <div className="flex items-center justify-between pt-2.5 border-t border-theme-border">
                    <span className="font-extrabold text-base">{fmt(p.sale_price)}</span>
                    <span className="bg-theme-dark text-white text-xs font-bold px-3 py-1.5 rounded">View</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )} */}

      {/* NOTE: this renders four hardcoded containers with placeholder prices
          and "#" CTA links — see the TODO in YouMayAlsoNeed.tsx. The section
          directly above it lists the *real* related products for this depot,
          under the same "You May Also Need" title. Give this one its own
          heading, or wire it to relatedProducts, before it ships. */}
      <section className="px-4 sm:px-[5%] py-10 sm:py-16">
        <YouMayAlsoNeed />
      </section>

      {/* REVIEWS */}
      <ReviewsSection heading={"Customer Reviews"} />

      {/* <section id="reviews" className="px-4 sm:px-[5%] py-10 sm:py-16">
        No "Write a Review" entry point here on purpose — review submission
            is only exposed from Order History (delivered orders), per
            docs/reference/REVIEWS_FLOW.md's purchase-gating recommendation.
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6">Customer Reviews</h2>
        <CustomerReviews variant={containerVariant} />
        <ReviewsCarousel productId={activeProduct.product_id as string | number} />
      </section> */}

      {/* An explicit heading rather than the homepage's. The default comes from
          `quoteForm.h2` in the Content Editor, which is homepage copy — sharing
          it would mean editing the homepage silently rewrote this section too.
          This component is a Client Component, so it cannot resolve admin copy
          itself; if this heading should become editable, add its own key and
          pass it down from product/[slug]/page.tsx. */}
      <QuoteForm heading="Get a Free Quote on This Container" />

      {/* FAQ */}
      <section className="px-4 sm:px-[5%] py-10 sm:py-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-[32px] font-bold sm:text-3xl tracking-tight text-[#474747] uppercase">
            Frequently Asked Questions
          </h2>
          <Link
            href="/shipping-container-faqs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors whitespace-nowrap"
          >
            View All FAQs →
          </Link>
        </div>
        <FaqAccordion variant={containerVariant} />
      </section>
      <StatesSection heading={"Delivering Across All 50 States"} />
    </div>
  );
}
