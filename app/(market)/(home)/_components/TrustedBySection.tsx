import Image from "next/image";

// Deliberately alt="" on every logo below (not a placeholder) — the CDN
// filenames carry no real company names to attribute, and the carousel's own
// aria-label already conveys the group's meaning ("trusted by several
// organizations"). Empty alt on repeated decorative images in an already-
// labeled group is the correct WCAG pattern, not an oversight.
type Logo = { src: string; alt: string };

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

export function TrustedBySection() {
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

      <div className="max-w-[1280px] mx-auto px-5 sm:px-10 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-[20px] font-bold dark:text-white">
          <span className="text-theme-primary">Trusted By </span>Organizations Like
        </h2>
      </div>

      <div className="overflow-hidden">
        <div className="logo-track flex w-max" aria-label="Trusted organizations carousel">
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <div key={i} className="flex items-center justify-center mx-4.75 w-34.75 h-25">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={120}
                height={80}
                className="object-contain grayscale hover:grayscale-0 dark:grayscale-0 transition-[filter] duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
