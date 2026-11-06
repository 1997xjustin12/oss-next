import Image from "next/image";
import { AccentText } from "@/components/shared/AccentText";
import { HOME_HEADING_DEFAULTS } from "@/config/homeContent";

// Deliberately alt="" on every logo below (not a placeholder) — the CDN
// filenames carry no real company names to attribute, and the carousel's own
// aria-label already conveys the group's meaning ("trusted by several
// organizations"). Empty alt on repeated decorative images in an already-
// labeled group is the correct WCAG pattern, not an oversight.
export type TrustedLogo = { src: string; alt: string };
type Logo = TrustedLogo;

const LOGOS: Logo[] = [
  {
    src: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2025/08/21054023/download-1-150x150-1.webp",
    alt: "",
  },
  {
    src: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2025/08/21054024/download-3-1-150x150-1.webp",
    alt: "",
  },
  {
    src: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2025/08/21054024/download-2-1-150x150-1.webp",
    alt: "",
  },
  {
    src: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2025/08/21054025/download-7-150x150-1.webp",
    alt: "",
  },
  {
    src: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2025/08/21054026/download-8-150x150-1.webp",
    alt: "",
  },
  {
    src: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2025/08/21054027/download-1-1-150x150-1.webp",
    alt: "",
  },
  {
    src: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2025/08/21054027/download-6-150x150-1.webp",
    alt: "",
  },
  {
    src: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2025/08/21054028/download-9-150x150-1.webp",
    alt: "",
  },
  {
    src: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2025/08/21054029/download-10-150x150-1.webp",
    alt: "",
  },
];

/**
 * `logos`: another page's own set (the for-sale and rental pages show
 * WordPress's 31, named, at 1000 px, so those go through the optimizer and sit
 * on a white tile in dark mode). `heading={null}`: no heading, for a page
 * whose band above already says it.
 */
export function TrustedBySection({
  heading = HOME_HEADING_DEFAULTS['trustedBy.h2'],
  logos,
}: {
  heading?: string | null;
  logos?: readonly TrustedLogo[];
}) {
  const list = logos ?? LOGOS;
  const custom = logos !== undefined;
  return (
    <section className="py-8 sm:py-10 overflow-hidden dark:bg-gray-950">
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .logo-track {
          animation: marquee 25s linear infinite;
        }
        .logo-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {heading !== null && (
        <div className="max-w-[1280px] mx-auto px-5 sm:px-10 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-[20px] font-bold dark:text-white">
            <AccentText text={heading} accentClassName="text-theme-primary dark:text-red-400" />
          </h2>
        </div>
      )}

      <div className="overflow-hidden">
        <div className="logo-track flex w-max" role="group" aria-label="Trusted organizations carousel">
          {[...list, ...list].map((logo, i) => (
            <div key={i} className={`flex items-center justify-center mx-4.75 w-34.75 h-25 ${custom ? 'rounded-md dark:bg-white' : ''}`}>
              <Image
                src={logo.src}
                // The second copy only makes the loop seamless: named once, not twice.
                alt={i < list.length ? logo.alt : ""}
                width={120}
                height={80}
                // The default set is already 150x150 on the CDN: the optimizer had nothing to gain.
                unoptimized={!custom}
                className="object-contain grayscale hover:grayscale-0 dark:grayscale-0 transition-[filter] duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
