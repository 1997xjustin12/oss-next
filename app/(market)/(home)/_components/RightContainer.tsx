import Image from "next/image";
import Link from "next/link";

type Product = {
  image: string;
  type: string;
  desc: string;
  price_label: string;
  cta: { label: string; url: string };
};

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
      <div className="text-xl sm:text-[24px] font-semibold dark:text-white">{item.type}</div>
      <div className="text-xs sm:text-[12px] font-light line-clamp-3 min-h-[54px] text-gray-600 dark:text-gray-400">
        {item.desc}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-lg sm:text-[22px] font-bold dark:text-white">{item.price_label}</div>
          <div className="text-xs text-[#04B761] font-bold">
            Buy &middot; Rent &middot; Rent-To-Own
          </div>
        </div>
        <Link
          prefetch={false}
          href={item.cta.url}
          className="shrink-0 bg-[#BD112A] text-center text-white py-2 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap hover:bg-[#a00f24] transition-colors"
        >
          {item.cta.label}
        </Link>
      </div>
    </div>
  );
}

export function RightContainer() {
  return (
    <section className="p-5 sm:p-10 dark:bg-gray-950">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-5 items-center">
        <h2 className="font-extrabold text-3xl sm:text-[40px] lg:text-[46px] leading-tight text-center dark:text-white">
          Find The Right Container For Your Needs
        </h2>
        <p className="font-light text-lg sm:text-[22px] leading-relaxed text-center text-gray-700 dark:text-gray-300">
          From compact 20ft units to oversized high cubes and temperature-controlled reefers — we
          stock every size and configuration.
        </p>
        <div className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 -mx-5 px-5 pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-8 sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible sm:snap-none py-8 sm:py-10 w-full">
          {PRODUCTS.map((item, index) => (
            <div key={`product-card-${index}`} className="w-[75%] shrink-0 snap-start sm:w-auto sm:shrink">
              <Card item={item} />
            </div>
          ))}
        </div>
        <button className="font-semibold text-lg sm:text-[20px] py-2 px-8 border transition-colors bg-[#BD112A] text-white border-[#BD112A] hover:bg-[#a00f24] sm:bg-transparent sm:text-inherit sm:border-stone-700 sm:hover:bg-stone-100 sm:dark:border-gray-400 sm:dark:text-white sm:dark:hover:bg-gray-800">
          View All Containers &amp; Pricing
        </button>
      </div>
    </section>
  );
}
