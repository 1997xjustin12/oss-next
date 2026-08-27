import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { BASE_URL } from "@/lib/helpers";
import { AccentText } from "@/components/shared/AccentText";
import { HOME_HEADING_DEFAULTS } from "@/config/homeContent";
import { GoogleReviewsBadge } from "@/components/shared/GoogleReviewsBadge";
import { ZipLookup1 } from "@/app/(market)/(home)/_components/ZipLookup1";

const BANNER_IMAGE = "/images/home-banners/hero-image.webp";
const BANNER_MAP_IMAGE = "/images/home-banners/home-hero-map.webp";


type PayOption = { label: string; href: string };
type StatData = { stats: string; Desc: () => ReactNode };

function HubsStratStat() {
  return (
    <div className="text-[11px] sm:text-base lg:text-[20px] font-medium">
      <div>Hubs</div>
      <div>Strategically Located</div>
    </div>
  );
}

function LocationStat() {
  return (
    <div className="text-[11px] sm:text-base lg:text-[20px] font-medium">
      <div>Of The U.S. & Canada</div>
      <div>Population Served By</div>
      <div>Our Delivery Network</div>
    </div>
  );
}

function StatItem({ stats }: { stats: StatData }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center text-white text-shadow-lg lg:flex-row lg:items-center lg:gap-2 lg:text-left">
      <div className="text-4xl sm:text-6xl lg:text-[100px] font-extrabold leading-none">
        {stats.stats}
        <sup>+</sup>
      </div>
      <div className="self-center">
        <stats.Desc />
      </div>
    </div>
  );
}


const PAY_OPTIONS: PayOption[] = [
  {
    label: "Buy A Container",
    href: `${BASE_URL}/sale-shipping-containers?ptype=buy`,
  },
  {
    label: "Rent A Container",
    href: `${BASE_URL}/sale-shipping-containers?ptype=rental`,
  },
  {
    label: "Rent-To-Own A Container",
    href: `${BASE_URL}/sale-shipping-containers?ptype=rto`,
  },
];

const STATS: StatData[] = [
  { stats: "70", Desc: HubsStratStat },
  { stats: "85%", Desc: LocationStat },
];

// All three layout variants render the same two headings — the A/B test is on
// layout, not wording — so one h1/h2 pair feeds every branch below.
export function Hero({
  version = 1,
  h1 = HOME_HEADING_DEFAULTS["hero.h1"],
  h2 = HOME_HEADING_DEFAULTS["hero.h2"],
}: {
  version?: number;
  h1?: string;
  h2?: string;
}) {
  if (version === 3) {
    return (
      <section className="relative flex flex-col lg:flex-row min-h-120 sm:min-h-150">
        <div className="relative w-full lg:w-[60%] min-h-120 sm:min-h-150">
          <Image
            src={BANNER_IMAGE}
            alt="Hero banner — shipping containers delivered nationwide"
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />

          <div className="relative z-10 flex h-full flex-col justify-center gap-5 sm:gap-7.5 p-5 sm:p-10">
            <div className="flex justify-center lg:justify-start">
              <div className="shadow-lg bg-theme-primary text-sm sm:text-[20px] text-white py-1 px-3 rounded-sm font-semibold text-center">
                America&apos;s #1 Container Wholesaler &middot; Since 2002
              </div>
            </div>

            <div className="flex flex-col gap-4 text-center lg:text-left">
              <h1 className="text-shadow-lg text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
                {h1}
              </h1>
              <h2 className="text-shadow-lg text-white text-lg sm:text-2xl lg:text-[28px] leading-relaxed font-medium">
                <AccentText text={h2} accentClassName="text-[#F4BF3C] font-extrabold" />
              </h2>
            </div>

            <div className="flex flex-row items-start lg:items-center justify-evenly gap-4 lg:gap-0 pt-2">
              {STATS.map((item) => (
                <StatItem key={String(item.stats)} stats={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="relative w-full lg:w-[40%] min-h-150 bg-black">
          <div className="relative z-10 flex h-full flex-col gap-5 sm:gap-7.5 p-5 sm:p-10">
            <div className="flex justify-end">
              <GoogleReviewsBadge tone="onDark" showRating />
            </div>

            <div className="flex flex-1 flex-col items-stretch justify-center gap-6">
              <ZipLookup1 homeVersion={3} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (version === 2) {
    return (
      <section className="relative flex flex-col lg:flex-row min-h-120 sm:min-h-150">
        <div className="relative w-full lg:w-[60%] min-h-120 sm:min-h-150">
          <Image
            src={BANNER_IMAGE}
            alt="Hero banner — shipping containers delivered nationwide"
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />

          <div className="relative z-10 flex h-full flex-col justify-center gap-5 sm:gap-7.5 p-5 sm:p-10">
            <div className="flex justify-center lg:justify-start">
              <div className="shadow-lg bg-theme-primary text-sm sm:text-[20px] text-white py-1 px-3 rounded-sm font-semibold text-center">
                America&apos;s #1 Container Wholesaler &middot; Since 2002
              </div>
            </div>

            <div className="flex flex-col gap-4 text-center lg:text-left">
              <h1 className="text-shadow-lg text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
                {h1}
              </h1>
              <h2 className="text-shadow-lg text-white text-lg sm:text-2xl lg:text-[28px] leading-relaxed font-medium">
                <AccentText text={h2} accentClassName="text-[#F4BF3C] font-extrabold" />
              </h2>
            </div>

            <div className="flex flex-row items-start lg:items-center justify-evenly gap-4 lg:gap-0 pt-2">
              {STATS.map((item) => (
                <StatItem key={String(item.stats)} stats={item} />
              ))}
            </div>

            <div className="lg:hidden">
              <ZipLookup1 homeVersion={2} />
            </div>
          </div>
        </div>

        <div className="hidden lg:block relative w-full lg:w-[40%] min-h-150 bg-[#2d2d2d]">
          <Image
            src={BANNER_MAP_IMAGE}
            alt="Delivery network map"
            fill
            sizes="40vw"
            className="object-cover"
          />

          <div className="relative z-10 flex h-full flex-col gap-5 sm:gap-7.5 p-5 sm:p-10">
            <div className="flex justify-end">
              <GoogleReviewsBadge tone="onDark" showRating />
            </div>

            <div className="flex flex-1 items-center justify-center">
              <ZipLookup1 homeVersion={2} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="p-5 sm:p-10 relative min-h-[480px] sm:min-h-[600px]">
      <div className="absolute left-0 top-0 w-full h-full">
        <Image
          src={BANNER_IMAGE}
          alt="Hero banner — shipping containers delivered nationwide"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
      </div>

      <div className="relative z-10 flex flex-col gap-5 sm:gap-7.5">
        <div className="flex justify-end">
          <GoogleReviewsBadge tone="onDark" showRating />
        </div>

        <div className="flex justify-center">
          <div className="flex flex-col gap-5 sm:gap-7.5 w-full max-w-[1280px]">
            <div className="flex justify-center">
              <div className="shadow-lg bg-theme-primary text-sm sm:text-[20px] text-white py-1 px-3 rounded-sm font-semibold text-center">
                America&apos;s #1 Container Wholesaler &middot; Since 2002
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="text-shadow-lg text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-center text-white">
                {h1}
              </h1>
              <h2 className="text-shadow-lg text-white text-lg sm:text-2xl lg:text-[28px] leading-relaxed font-medium text-center">
                <AccentText text={h2} accentClassName="text-[#F4BF3C] font-extrabold" />
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row justify-evenly gap-3 sm:gap-2">
              {PAY_OPTIONS.map((item) => (
                <Link
                  key={item.label}
                  prefetch={false}
                  href={item.href}
                  className="shadow-lg text-lg sm:text-[22px] lg:text-[24px] bg-[#F2B824] border-[2px] border-white font-extrabold px-5 py-2 text-center"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-row items-start lg:items-center justify-evenly gap-4 lg:gap-0 pt-2">
              {STATS.map((item) => (
                <StatItem key={String(item.stats)} stats={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
