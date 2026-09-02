import Image from "next/image";
import Link from "next/link";
import { BASE_URL } from "@/lib/helpers";
import { CardCarousel } from "./CardCarousel";

type Product = {
  image: string;
  type: string;
  desc: string;
  price_label: string;
  cta: { label: string; url: string };
};

// TODO: placeholder data carried over from the homepage component. The prices
// and the "#" CTA links are not real — see the note in ProductDetail.tsx. The
// section above it on the PDP already lists genuine related products from
// Elasticsearch; this one should be wired to the same source before launch.
const PRODUCTS: Product[] = [
  {
    image: "/images/containers/used-20ft-standard.webp",
    type: "Used 20ft Standard",
    desc: "Perfect for residential, small business, and construction site storage. Fits most driveways.",
    price_label: "Starts at $1,350",
    cta: { label: "Get Free Quote", url: "#" },
  },
  {
    image: "/images/containers/used-40ft-standard.webp",
    type: "Used 40ft Standard",
    desc: "Double capacity for farms, retail, contractors, and industrial storage needs nationwide.",
    price_label: "Starts at $2,000",
    cta: { label: "Get Free Quote", url: "#" },
  },
  {
    image: "/images/containers/used-40ft-hc.webp",
    type: "Used 40ft High Cube",
    desc: "Extra headroom for tall equipment, workshop setups, and high-volume inventory storage.",
    price_label: "Starts at $2,800",
    cta: { label: "Get Free Quote", url: "#" },
  },
  {
    image: "/images/containers/new-40ft-hc.webp",
    type: "New 40ft High Cube",
    desc: "Brand-new one-trip containers for maximum longevity, custom builds, and premium storage.",
    price_label: "Starts at $3,000",
    cta: { label: "Inquire", url: "#" },
  },
];

function Card({ item }: { item: Product }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square bg-stone-200 dark:bg-stone-700 overflow-hidden rounded-sm">
        <Image
          src={item.image}
          alt={item.type}
          fill
          sizes="(max-width: 640px) 75vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
      </div>
      <div className="text-xl sm:text-[24px] font-semibold dark:text-white">
        {item.type}
      </div>
      <div className="text-xs sm:text-[12px] font-light line-clamp-3 min-h-[54px] text-gray-600 dark:text-gray-400">
        {item.desc}
      </div>
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-lg sm:text-[18px] font-bold dark:text-white">
            {item.price_label}
          </div>
          <div className="text-xs text-[#04B761] font-bold">
            Buy &middot; Rent &middot; Rent-To-Own
          </div>
        </div>
        <Link
          prefetch={false}
          href={item.cta.url}
          className="shrink-0 bg-theme-primary text-center text-white py-2 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap hover:bg-[#a00f24] transition-colors"
        >
          {item.cta.label}
        </Link>
      </div>
    </div>
  );
}

/**
 * Adapted from (home)/_components/RightContainer.tsx for the product page.
 *
 * The heading defaults to its own copy rather than the homepage's
 * `rightContainer.h2`. Sharing that key would mean editing homepage copy in the
 * Content Editor silently rewrote a section of every product page — and this is
 * a Client Component, so it cannot resolve admin copy itself. If this heading
 * should become editable, give it its own key and pass it down from
 * product/[slug]/page.tsx.
 */
export function YouMayAlsoNeed({
  heading = "You may also need:",
}: {
  heading?: string;
}) {
  return (
    <div className="flex flex-col gap-[10px]">
      <h2 className="text-[24px] font-bold">{heading}</h2>
      <CardCarousel label="Containers you may also need">
        {PRODUCTS.map((item, index) => (
          <Card key={`product-card-${index}`} item={item} />
        ))}
      </CardCarousel>
      <div className="mt-[30px] text-center hidden md:block">
        <Link
          prefetch={false}
          href={`${BASE_URL}/sale-shipping-containers/?ptype=buy`}
          className="font-semibold text-lg sm:text-[20px] py-2 px-8 border transition-colors bg-theme-primary text-white border-theme-primary hover:bg-[#a00f24] sm:bg-transparent sm:text-inherit sm:border-stone-700 sm:hover:bg-stone-100 sm:dark:border-gray-400 sm:dark:text-white sm:dark:hover:bg-gray-800"
        >
          View All Containers &amp; Pricing
        </Link>
      </div>
    </div>
  );
}
