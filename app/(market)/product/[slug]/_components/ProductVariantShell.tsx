"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  getCustomFieldValue,
  isContainerHit,
  isInStockHit,
} from "@/lib/pricing";
import { getQuickSpecs } from "@/lib/data/pdpShippingContainers";
import type { ProductHit } from "@/types/product";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductInfoPanel } from "./ProductInfoPanel";
import type { LocationChangeStrategy } from "./DeliveryZipCheck";
import { BASE_URL } from "@/lib/helpers";
import { ROUTES } from "@/config/routes";
import { capitalizeWords } from "@/lib/utils";
import { videoSizeKey } from "@/lib/productVideos";
import { videosForSize } from "@/config/productVideos";
import { YouTubeEmbed } from "@/components/product/YouTubeEmbed";
import { InfoCard } from "@/components/ui/InfoCard";

const base = BASE_URL.replace(/\/$/, "");

// The two ways to pay, as shown under the videos. Kept here rather than inline
// so both cards are edited in one place and can't drift apart in shape.
//
// InfoCard works out for itself whether an href is on our own domain (client
// navigation) or off-site (new tab with rel="noopener"), so these can stay in
// whatever form they were given in.
const PAYMENT_OPTIONS: { items: string[]; href: string }[] = [
  {
    items: [
      "Option 1 Rent-To-Own (RTO)",
      "Everyone Qualifies No Credit Check Required",
    ],
    // NOTE: this currently 301s to the homepage — every `?page_id=` on
    // onsitestorage.com does, including page_id=1, so the query form no longer
    // resolves to a page. Swap it for a real path such as
    // /rent-to-own-containers before relying on it.
    href: "https://onsitestorage.com/?page_id=288960",
  },
  {
    items: [
      "Option 2 Purchase Financing",
      "Lower monthly rate available Requires FICA score above 550",
    ],
    // TimePayment's application form — third-party, so it opens in a new tab.
    href: "https://apply.timepayment.com/about-financing/?module=easyapply&version=1.0.0&dealercode=06DJF&id=&apptype=C%2CB&ref=&pv=&officecode=&applicationurl=https%3A%2F%2Fapply.timepayment.com%2Fldaweb%2Fdefault.aspx&x=266&y=76",
  },
];

function getListingCrumb(product: ProductHit) {
  if (!isContainerHit(product)) {
    // Was `ptype=accesories` (missing an "s") — silently fell through to the
    // default (buy) PLP view instead of the accessories-filtered one, since
    // the PLP only special-cases the correctly-spelled value.
    return {
      label: "Shipping Containers Accessories For Sale",
      href: ROUTES.PLP_ACCESSORIES,
    };
  }
  const paymentType = getCustomFieldValue(product, "payment_type");
  if (paymentType === "rental")
    return {
      label: "Shipping Containers For Rent",
      href: `${base}/sale-shipping-containers/?ptype=rental`,
    };
  if (paymentType === "rto")
    return {
      label: "Shipping Containers For Rent-To-Own",
      href: `${base}/sale-shipping-containers/?ptype=rto`,
    };
  return {
    label: "Shipping Containers For Sale",
    href: `${base}/sale-shipping-containers/?ptype=buy`,
  };
}

function deriveQuickSpecs(product: ProductHit) {
  const sizeNum =
    getCustomFieldValue(product, "length_width").match(/\d+/)?.[0] ?? "—";
  const specs = getQuickSpecs(product);
  return [
    { label: "Length", value: sizeNum !== "—" ? `${sizeNum} ft` : "—" },
    { label: "Width", value: "8 ft" },
    {
      label: "Height",
      value: getCustomFieldValue(product, "height") || "8'6\"",
    },
    { label: "Cu Ft", value: specs.cuFt, accent: true },
    { label: "Sq Ft", value: specs.sqFt, accent: true },
    { label: "Lbs Tare", value: specs.lbsTare, accent: true },
  ];
}

type Props = {
  product: ProductHit;
  relatedProducts: ProductHit[];
  activeProduct: ProductHit;
  onVariantChange: (product: ProductHit) => void;
  /** Forwarded to ProductInfoPanel's ZIP field — see LocationChangeStrategy. */
  locationChange?: LocationChangeStrategy;
};

export function ProductVariantShell({
  product,
  relatedProducts,
  activeProduct,
  onVariantChange,
  locationChange,
}: Props) {
  /**
   * Keep the URL pointing at whichever variant is on screen, without
   * navigating — so the address bar, a copied link and a reload all agree with
   * what the shopper is actually looking at.
   *
   * `replaceState`, not `pushState`. This was `pushState`, which gave every
   * option toggle its own history entry while nothing listened for `popstate`
   * to put the state back: pressing Back returned the URL to the previous
   * variant but left the current one rendered, so the address bar said 40ft
   * while the page showed 20ft. Adding a `popstate` handler would fix the
   * desync, but it would also mean four size clicks cost four Back presses to
   * leave the page.
   *
   * Replacing instead treats a variant the way the depot picker already treats
   * a location — a selection within one page rather than a journey between
   * pages — so Back returns to wherever the shopper came in from, which is
   * what they meant by it.
   */
  useEffect(() => {
    if (activeProduct === product) return;
    if (!activeProduct.handle) return;
    window.history.replaceState(null, "", ROUTES.PRODUCT(activeProduct.handle));
  }, [activeProduct, product]);

  const crumb = getListingCrumb(activeProduct);

  // Keyed off the active product, so the size-specific slot follows the size
  // picker. Cheap enough to recompute on render — two object lookups.
  const videos = videosForSize(videoSizeKey(activeProduct));
  const allImages = (activeProduct.images ?? [])
    .map((img) => img.src)
    .filter(Boolean);
  const quickSpecs = deriveQuickSpecs(activeProduct);
  const promoTag = activeProduct.tags?.find((t) => !/stock/i.test(t));

  return (
    <>
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 flex-wrap px-4 sm:px-[5%] py-3 text-xs sm:text-sm text-theme-muted bg-theme-subtle border-b border-theme-border">
        <Link
          href={ROUTES.HOME}
          className="hover:text-theme-primary transition-colors"
        >
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
        <Link
          href={crumb.href}
          className="hover:text-theme-primary transition-colors"
        >
          {crumb.label}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
        <span className="text-theme-dark font-semibold">
          {activeProduct.title}
        </span>
      </div>

      {/* PRODUCT GRID */}
      <section className="px-4 sm:px-[5%] py-8 sm:py-10">
        <div className="my-4 sm:my-5">
          {/* 42px was unconditional, so on a phone this ran to seven lines and
              pushed the gallery below the fold. Scaled for the viewport it
              carries the same weight in two. */}
          <h1 className="text-[22px] font-bold leading-[27px] sm:text-[42px] sm:leading-[42px]">
            {activeProduct?.seo?.focus_keyphrase && (
              <>
                <span className="text-theme-primary">
                  {capitalizeWords(activeProduct?.seo?.focus_keyphrase)}:
                </span>
                &nbsp;{activeProduct?.desc_title}
              </>
            )}
            {!activeProduct?.seo?.focus_keyphrase && (
              <>{activeProduct?.title}</>
            )}
          </h1>
        </div>
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-10">
          {/* Gallery + quick specs */}
          <div className="lg:sticky lg:top-6 self-start w-full">
            {/* Keyed on the product so the gallery remounts when the variant
                or depot changes. It holds the selected image index in its own
                state and never resets it on an `images` change — harmless back
                when a location change was a full navigation, but a swap keeps
                the component alive, so a visitor on image 4 of a six-image
                container would land on images[4] of a two-image one. */}
            <ProductImageGallery
              key={String(activeProduct.objectID)}
              images={allImages}
              title={activeProduct.title}
              tag={promoTag}
              inStock={isInStockHit(activeProduct)}
            />
            {/* <div className="grid grid-cols-3 gap-3 mt-5 bg-theme-dark rounded-lg p-4 sm:p-5 text-center">
            {quickSpecs.map((s, index) => (
              <div key={`quick-specs-${s.label}-${index}`}>
                <div
                  className={`text-lg sm:text-2xl font-extrabold tracking-tight ${s.accent ? "text-theme-primary" : "text-white"}`}
                >
                  {s.value}
                </div>
                <div className="text-[10px] sm:text-[11px] text-white/45 uppercase tracking-wide mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div> */}
            <div className="hidden lg:block">
              {/* Videos for the size currently selected. Re-derived from
              activeProduct, so switching size in the picker swaps the
              size-specific video without any state of its own. */}
              {videos.length > 0 && (
                <div className="grid grid-cols-3 gap-[20px] mt-5">
                  {videos.map((video) => (
                    <YouTubeEmbed key={video.id} video={video} />
                  ))}
                </div>
              )}

              <h2 className="mt-6 text-center text-[16px] font-medium">
                Containers for Every Budget -{" "}
                <span className="text-theme-primary">Low Monthly Payments</span>
              </h2>

              <div className="grid grid-cols-2 gap-[20px] mt-5">
                {PAYMENT_OPTIONS.map((option) => (
                  <InfoCard
                    key={option.items[0]}
                    items={option.items}
                    href={option.href}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Product info */}
          <ProductInfoPanel
            product={activeProduct}
            relatedProducts={relatedProducts}
            categoryLabel={crumb.label}
            onVariantChange={onVariantChange}
            locationChange={locationChange}
          />
        </section>
      </section>
    </>
  );
}
