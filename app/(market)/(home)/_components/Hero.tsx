import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { BASE_URL } from "@/lib/helpers";

const BANNER_IMAGE = "/images/home-banners/hero-image.webp";
const GOOGLE_REVIEWS_IMAGE = "/images/google-reviews.webp";

type PayOption = { label: string; href: string };
type StatData = { stats: string; desc: ReactNode };

function HubsStratStat() {
  return (
    <div className="text-base sm:text-[20px] font-medium">
      <div>Hubs</div>
      <div>Strategically Located</div>
    </div>
  );
}

function LocationStat() {
  return (
    <div className="text-base sm:text-[20px] font-medium">
      <div>Of The U.S. & Canada</div>
      <div>Population Served By</div>
      <div>Our Delivery Network</div>
    </div>
  );
}

function StatItem({ stats }: { stats: StatData }) {
  return (
    <div className="flex items-center justify-center text-white text-shadow-lg gap-2">
      <div className="text-[64px] sm:text-[80px] lg:text-[100px] font-extrabold leading-none">
        {stats.stats}
        <sup>+</sup>
      </div>
      <div className="self-center">{stats.desc}</div>
    </div>
  );
}

function GoogleReviews() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src={GOOGLE_REVIEWS_IMAGE}
        alt="Google Reviews"
        width={100}
        height={34}
        className="sm:w-[120px] sm:h-[40px] w-[80px] h-[27px]"
      />
      <div className="text-white text-shadow-lg">
        <div className="flex items-center gap-1.5 text-base sm:text-lg font-bold">
          <span>4.8</span>
          <div className="flex items-center">
            {[...Array(4)].map((_, i) => (
              <svg key={i} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                  fill="#FBBC04"
                />
              </svg>
            ))}
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <defs>
                <linearGradient id="partial-star" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="80%" stopColor="#FBBC04" />
                  <stop offset="80%" stopColor="#9CA3AF" />
                </linearGradient>
              </defs>
              <path
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                fill="url(#partial-star)"
              />
            </svg>
          </div>
        </div>
        <div className="text-xs sm:text-sm">(151) reviews</div>
      </div>
    </div>
  );
}

const PAY_OPTIONS: PayOption[] = [
  { label: "Buy A Container", href: `${BASE_URL}/sale-shipping-containers?ptype=buy` },
  { label: "Rent A Container", href: `${BASE_URL}/sale-shipping-containers?ptype=rental` },
  { label: "Rent-To-Own A Container", href: `${BASE_URL}/sale-shipping-containers?ptype=rto` },
];

const STATS: StatData[] = [
  { stats: "70", desc: <HubsStratStat /> },
  { stats: "85%", desc: <LocationStat /> },
];

export function Hero() {
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
          <GoogleReviews />
        </div>

        <div className="flex justify-center">
          <div className="flex flex-col gap-5 sm:gap-7.5 w-full max-w-[1280px]">
            <div className="flex justify-center">
              <div className="shadow-lg bg-[#BD112A] text-sm sm:text-[20px] text-white py-1 px-3 rounded-sm font-semibold text-center">
                America&apos;s #1 Container Wholesaler &middot; Since 2002
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="text-shadow-lg text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-center text-white">
                Local Shipping Containers Delivered Nationwide &amp; Canada
              </h1>
              <h2 className="text-shadow-lg text-white text-lg sm:text-2xl lg:text-[28px] leading-relaxed font-medium text-center">
                Whether You Want to{" "}
                <span className="text-[#F4BF3C] font-extrabold">Buy</span>,{" "}
                <span className="text-[#F4BF3C] font-extrabold">Rent</span>, Or{" "}
                <span className="text-[#F4BF3C] font-extrabold">Rent-To-Own</span>
                , We Deliver From A Local Hub To Save You Money On Mileage.
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

            <div className="flex flex-col sm:flex-row items-center justify-evenly gap-6 sm:gap-0 pt-2">
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
