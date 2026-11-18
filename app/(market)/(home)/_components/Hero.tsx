import { PlpLink } from "@/components/shared/PlpLink";
import Image from "next/image";
import type { ReactNode } from "react";
import { BASE_URL } from "@/lib/helpers";
import { AccentText } from "@/components/shared/AccentText";
import { HOME_HEADING_DEFAULTS } from "@/config/homeContent";
import { GoogleReviewsBadge } from "@/components/shared/GoogleReviewsBadge";
import { ZipLookup1 } from "@/app/(market)/(home)/_components/ZipLookup1";
import { BANNER_IMAGE } from "./heroBanner";

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

/** Version 3's two figures, side by side with a red rule between them (its own wording). */
const V3_STATS = [
  { figure: "60", label: "Locations across the US and Canada", width: "max-w-[6.5rem] sm:max-w-[12rem] lg:max-w-[10rem] 2xl:max-w-[13rem]" },
  { figure: "85%", label: "Of The U.S. And Canadian Population Within Our Delivery Network", width: "max-w-[8.5rem] sm:max-w-[16rem] lg:max-w-[14rem] xl:max-w-[16rem] 2xl:max-w-[19rem]" },
] as const;

function V3Stats() {
  return (
    <ul className="flex items-center justify-center gap-3 sm:gap-6 lg:justify-start">
      {V3_STATS.map((stat, i) => (
        <li key={stat.figure} className="flex items-center gap-3 sm:gap-6">
          {i > 0 && <span aria-hidden className="h-12 w-0.5 bg-theme-primary sm:h-20 lg:h-24" />}
          <span className="flex items-center gap-1.5 text-white text-shadow-lg sm:gap-3">
            <span className="text-[44px] leading-none font-extrabold sm:text-6xl lg:text-[64px] xl:text-[76px] 2xl:text-[88px]">
              {stat.figure}
              <sup className="text-[0.4em]">+</sup>
            </span>
            <span className={`${stat.width} text-[10px] leading-tight font-medium sm:text-base lg:text-[16px] xl:text-[19px] 2xl:text-[22px]`}>{stat.label}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

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
    // Redesigned 2026-11-18 (desktop and mobile mockups): the photo with the
    // badge, headline, prices and two stats on the left; the black panel with
    // the Google rating, the ZIP box and the container list on the right. On a
    // phone the panel stacks under the photo, and the rating moves onto it.
    return (
      <section data-home-variant="3" className="relative flex flex-col bg-black lg:flex-row">
        {/* 58/42 on small desktops, so the panel's ZIP box keeps room for a whole place name; 64/36 from xl, as the mockup. */}
        <div className="relative w-full lg:w-[58%] xl:w-[64%]">
          <Image
            src={BANNER_IMAGE}
            alt="Hero banner — shipping containers delivered nationwide"
            fill
            preload
            sizes="(min-width: 1280px) 64vw, (min-width: 1024px) 58vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/45 dark:bg-black/60" />

          <div className="relative z-10 flex h-full flex-col justify-center gap-3 px-[5%] py-6 sm:gap-6 sm:py-10 lg:gap-8 lg:py-12">
            <div className="flex items-start justify-between gap-3 lg:justify-start">
              {/* Wraps on the narrowest phones, where it and the rating cannot share one line. */}
              <p className="min-w-0 bg-theme-primary px-2 py-1.5 text-[11px] text-white shadow-lg sm:px-5 sm:py-2 sm:text-base lg:text-[18px] xl:text-[20px] 2xl:text-[22px]">
                America&apos;s #1 Container Wholesaler &middot; Since 2002
              </p>
              <div className="shrink-0 lg:hidden">
                <GoogleReviewsBadge tone="onDark" showRating size="sm" />
              </div>
            </div>

            <div className="flex flex-col gap-2 text-center sm:gap-4 lg:text-left">
              <h1 className="text-[25px] leading-[1.1] font-extrabold text-white text-shadow-lg sm:text-5xl lg:text-[38px] xl:text-[52px] 2xl:text-[60px]">{h1}</h1>
              <h2 className="text-base leading-snug font-medium text-white text-shadow-lg sm:text-2xl lg:text-[24px] lg:leading-[1.2] xl:text-[29px] 2xl:text-[34px]">
                <AccentText text={h2} accentClassName="text-[#F4BF3C]" />
              </h2>
            </div>

            <V3Stats />
          </div>
        </div>

        <div className="w-full bg-black px-[5%] py-8 lg:w-[42%] lg:px-[3%] lg:py-8 xl:w-[36%]">
          <div className="mb-6 hidden justify-end lg:flex">
            <GoogleReviewsBadge tone="onDark" showRating />
          </div>
          <ZipLookup1 homeVersion={3} />
        </div>
      </section>
    );
  }

  if (version === 2) {
    return (
      <section data-home-variant="2" className="relative flex flex-col lg:flex-row min-h-120 sm:min-h-150">
        <div className="relative w-full lg:w-[60%] min-h-120 sm:min-h-150">
          <Image
            src={BANNER_IMAGE}
            alt="Hero banner — shipping containers delivered nationwide"
            fill
            preload
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
    <section data-home-variant="1" className="p-5 sm:p-10 relative min-h-[480px] sm:min-h-[600px]">
      <div className="absolute left-0 top-0 w-full h-full">
        <Image
          src={BANNER_IMAGE}
          alt="Hero banner — shipping containers delivered nationwide"
          fill
          preload
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
                <PlpLink
                  key={item.label}
                  prefetch={false}
                  href={item.href}
                  className="shadow-lg text-lg sm:text-[22px] lg:text-[24px] bg-[#F2B824] border-[2px] border-white font-extrabold px-5 py-2 text-center"
                >
                  {item.label}
                </PlpLink>
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
