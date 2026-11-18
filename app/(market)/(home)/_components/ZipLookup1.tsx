"use client";

import { useState, useEffect, useMemo, useId, useRef } from "react";
import { useRouter } from "next/navigation";
import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";
import Image from "next/image";
import { ArrowRight, Loader2, MapPin } from "lucide-react";
import { useZipLookup } from "@/hooks/useGeoapify";
import type { GeoapifyResult } from "@/hooks/useGeoapify";
import type { FormattedContainerHit } from "@/types/product";
import { getCustomFieldValue } from "@/lib/pricing";
import { formatMoney } from "@/lib/formatters";
import { BASE_URL } from "@/lib/helpers";
import { getContainerImagesForStem } from "@/lib/containerImages";
import { ViewAllContainersLink } from "@/components/shared/ViewAllContainersLink";

type Props = {
  initialZip?: string;
  location?: string;
  ptype?: string;
  homeVersion?: 1 | 2 | 3;
};

type BannerParams = {
  ptype: string;
  size?: string;
  height?: string;
  grade?: string;
};

type BannerListItem = {
  /**
   * The row's photo: the first curated set (config/containerImages.ts) that has
   * files, in this order, never the search result's own image. A later entry
   * is the fallback until the first one's set exists.
   */
  imageStems: string[];
  title: string;
  price_starts: string;
  tags: string;
  availability: string;
  url: string;
  params: BannerParams;
};

const BANNER_LIST: BannerListItem[] = [
  {
    imageStems: ["used_20s_wwt"],
    title: "20ft Standard Container",
    price_starts: "$1,350",
    tags: "Used · Wind & Watertight · 160 Sq Ft",
    availability: "In Stock - Ready To Deliver",
    url: `${BASE_URL}/sale-shipping-containers?ptype=buy&size=20%27&height=8%27+6"+Standard&grade=Wind+and+Water+tight+(WWT)`,
    params: {
      ptype:"buy",
      size: "20'",
      height: `8' 6" Standard`,
      grade: "Wind and Water tight (WWT)",
    }
  },
  {
    // No curated 40 ft standard WWT set yet: the 40 ft high cube WWT stands in.
    imageStems: ["used_40s_wwt", "used_40h_wwt"],
    title: "40ft Standard Container",
    price_starts: "$2,000",
    tags: "Used · Wind & Watertight · 160 Sq Ft",
    availability: "In Stock - Ready To Deliver",
    url: `${BASE_URL}/sale-shipping-containers?ptype=buy&size=40%27&height=8%27+6"+Standard&grade=Wind+and+Water+tight+(WWT)`,
    params: {
      ptype:"buy",
      size: "40'",
      height: `8' 6" Standard`,
      grade: "Wind and Water tight (WWT)",
    }
  },
  {
    imageStems: ["used_20s_cw"],
    title: "Rental Containers",
    price_starts: "$95/mo",
    tags: "20ft & 40ft — Flexible Monthly Terms",
    availability: "Available Nationwide",
    url: `${BASE_URL}/sale-shipping-containers?ptype=rental`,
    params: {
      ptype:"rental",
    }
  },
  {
    imageStems: ["used_20s_asis"],
    title: "Rent-To-Own",
    price_starts: "$79.99/mo",
    tags: "20ft & 40ft — Flexible Monthly Terms",
    availability: "Flexible Payment Plans",
    url: `${BASE_URL}/sale-shipping-containers?ptype=rto`,
    params: {
      ptype:"rto",
    }
  },
];

// depotContainers arrives from /api/shipping-containers/by-location already
// formatted (sale_price computed server-side) and already scoped to a
// location by that fetch, but we still match on location here since a stale
// fetch can lag behind the currently-selected location for a render or two.
function getLowestPrice(
  containers: FormattedContainerHit[],
  params: BannerParams,
  location: string,
): number | null {
  const prices = containers
    .filter((hit) => {
      if (getCustomFieldValue(hit, "payment_type") !== params.ptype) return false;
      if (params.size && getCustomFieldValue(hit, "length_width") !== params.size) return false;
      if (params.height && getCustomFieldValue(hit, "height") !== params.height) return false;
      if (params.grade && getCustomFieldValue(hit, "grade") !== params.grade) return false;
      if (location && getCustomFieldValue(hit, "location") !== location) return false;
      return !Number.isNaN(hit.sale_price);
    })
    .map((hit) => hit.sale_price);

  return prices.length > 0 ? Math.min(...prices) : null;
}

function formatPrice(price: number, ptype: string): string {
  const suffix = ptype === "rental" || ptype === "rto" ? "/mo" : "";
  // "$1,350", not "$1,350.00" (as the design); real cents stay ("$61.36/mo").
  return `${formatMoney(price).replace(/\.00$/, "")}${suffix}`;
}

function buildBannerUrl(item: BannerListItem, zipcode: string, location: string): string {
  const params = new URLSearchParams(item.params);
  if (zipcode) params.set("zipcode", zipcode);
  if (location) params.set("location", location);
  return `${BASE_URL}/sale-shipping-containers?${params}`;
}

type BannerItemProps = { item: BannerListItem };

/** The first curated photo of the first stem that has any (see BannerListItem.imageStems). */
function bannerImage(item: BannerListItem): string | null {
  for (const stem of item.imageStems) {
    const [first] = getContainerImagesForStem(stem);
    if (first) return first;
  }
  return null;
}

function BannerItem({ item }: BannerItemProps) {
  const image = bannerImage(item);
  return (
    <Link
      prefetch={false}
      href={item.url}
      className="group flex items-stretch gap-3 border-b border-white/25 py-4 text-white last:border-b-0"
    >
      {/* The photo is the desktop panel's; the phone layout lists text only, as its mockup. */}
      {image && (
        <Image
          src={image}
          alt=""
          width={82}
          height={70}
          sizes="82px"
          className="hidden h-17.5 w-20.5 shrink-0 object-cover lg:block"
        />
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[17px] font-bold leading-tight sm:text-[20px] lg:text-[17px] xl:text-[19px] 2xl:text-[20px]">{item.title}</span>
        <span className="mt-0.5 text-[12px] font-light text-[#a3a3a3] sm:text-[13px]">{item.tags}</span>
        <span className="mt-1.5 flex items-center gap-2 text-[12px] font-bold text-[#04B761]">
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#04B761]" />
          {item.availability}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end justify-between">
        <span className="whitespace-nowrap text-[20px] font-bold sm:text-[24px] lg:text-[20px] xl:text-[22px] 2xl:text-[24px]">{item.price_starts}</span>
        <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}


export function ZipLookup1({
  initialZip = "",
  location = "",
  ptype = "buy",
  homeVersion = 1,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedZipcode, setSelectedZipcode] = useState(initialZip);
  const [selectedLocation, setSelectedLocation] = useState(location);

  // Prefill (URL ZIP, else the saved / detected location) and typed-only
  // suggestions come from the shared hook.
  const {
    value: zip,
    setValue: setZip,
    showResult,
    edited,
    results,
    loading,
    error,
    clear,
    selectResult,
    resolveValue,
    depotContainers,
  } = useZipLookup({
    initialZip,
    type: "postcode",
    countries: "us,ca",
    debounceMs: 300,
    limit: 5,
    // Only variant 3 shows the depot's starting prices.
    loadDepotContainers: homeVersion === 3,
  });

  // The banner prices (variant 3) follow the saved location. The box itself is
  // prefilled by useZipLookup.
  useEffect(() => {
    const stored = localStorage.getItem("zipcode");
    const storedDepot = localStorage.getItem("zipcode_depot");

    // localStorage only exists after hydration, so the stored ZIP arrives here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedZipcode(stored ?? initialZip);
    setSelectedLocation(storedDepot ?? location);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialZip]);

  // Auto-select when the dropdown narrows to exactly one match. Whether this
  // redirects depends on homeVersion — see handleSelect below. Only as the
  // suggestions arrive for typed text, with the list open, once per place:
  // triggered by `results` only, so focusing the box never picks anything.
  const autoSelected = useRef<string | null>(null);
  useEffect(() => {
    if (!edited || !open || results.length !== 1) return;
    if (autoSelected.current === results[0].placeId) return;
    autoSelected.current = results[0].placeId;
    handleSelect(results[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  function navigate(zipcode: string, loc: string) {
    const params = new URLSearchParams({ zipcode, location: loc, ptype });
    router.push(`/sale-shipping-containers?${params}`);
  }

  // homeVersion 1/2 keep the original behavior: selecting a suggestion
  // redirects straight to the PLP. homeVersion 3 has its own BANNER_LIST
  // below driven by sale_price, so selecting a suggestion there only narrows
  // depotContainers to that location instead of navigating away.
  function handleSelect(result: GeoapifyResult) {
    // Refused when the cart holds a container from another depot — the prompt
    // is already up, and navigating to the new location would contradict it.
    if (!selectResult(result, () => handleSelect(result))) return;
    showResult(result);
    setOpen(false);
    setSelectedZipcode(result.postcode || zip);
    setSelectedLocation(result.nearestLocation ?? location);

    if (homeVersion !== 3) {
      navigate(
        result.postcode || zip,
        result.nearestLocation ?? result.formatted,
      );
    }
  }

  async function handleSeePrices() {
    const trimmed = zip.trim();
    if (!trimmed) return;
    setOpen(false);

    // Typed and submitted without picking a suggestion. This used to navigate
    // and save nothing, so the ZIP they had just given us steered one page
    // load and was then forgotten — every link afterwards still carried the
    // old one. Resolved and saved like a picked suggestion instead. Navigates
    // here rather than through handleSelect because version 3 of the homepage
    // deliberately does not navigate on select, and this button always should.
    const match = await resolveValue();
    if (match) {
      if (!selectResult(match, () => void handleSeePrices())) return;
      navigate(match.postcode || trimmed, match.nearestLocation ?? match.formatted);
      return;
    }
    navigate(trimmed, location ?? trimmed);
  }

  const banners = useMemo(
    () =>
      BANNER_LIST.map((item) => {
        const lowest = getLowestPrice(depotContainers, item.params, selectedLocation);
        return {
          ...item,
          price_starts: lowest !== null ? formatPrice(lowest, item.params.ptype) : item.price_starts,
          url: buildBannerUrl(item, selectedZipcode, selectedLocation),
        };
      }),
    [depotContainers, selectedZipcode, selectedLocation],
  );

  const listboxId = useId();
  const showDropdown = open && (results.length > 0 || loading || !!error);

  const v3 = homeVersion === 3;

  return (
    <div>
      {/*
        Version 3: one row on every screen, 20px between the box and the
        button, and the box takes the rest of the width: once a place is
        picked it shows the whole of it ("60601, Chicago, IL, United States").
      */}
      <div className={v3 ? "flex w-full items-stretch gap-5" : "flex w-full max-w-xl mx-auto flex-col gap-3 sm:flex-row"}>
        {/* Input + dropdown */}
        <div className={v3 ? "relative min-w-0 flex-1" : "relative flex-1"}>
          <input
            value={zip}
            onChange={(e) => {
              setZip(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setOpen(false);
                handleSeePrices();
              }
              if (e.key === "Escape") {
                setOpen(false);
                clear();
              }
            }}
            type="text"
            inputMode="numeric"
            maxLength={10}
            placeholder="Enter Zipcode"
            className={
              v3
                ? // Room on the right for the spinner only while it shows, so a picked place name fits the box.
                  `h-full w-full bg-white py-2.5 pl-3 text-sm text-theme-dark placeholder-theme-dark/80 outline-none sm:py-3 sm:text-lg lg:text-base ${loading ? "pr-8" : "pr-3"}`
                : "w-full bg-white text-theme-dark placeholder-theme-dark/70 px-4 py-3 sm:py-4 text-base sm:text-lg outline-none"
            }
            aria-label="ZIP or postal code"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted animate-spin pointer-events-none" />
          )}

          {showDropdown && (
            <ul
              id={listboxId}
              role="listbox"
              className="absolute z-50 left-0 right-0 top-full mt-1 border border-theme-border bg-white shadow-lg overflow-hidden"
            >
              {loading && results.length === 0 && (
                <li className="px-3 py-2.5 text-sm text-theme-muted">
                  Searching…
                </li>
              )}
              {error && !loading && (
                <li className="px-3 py-2.5 text-sm text-theme-primary">
                  {error}
                </li>
              )}
              {results.map((r) => (
                <li key={r.placeId} role="option" aria-selected={false}>
                  <button
                    onMouseDown={() => handleSelect(r)}
                    className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-theme-subtle transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-theme-primary shrink-0 mt-0.5" />
                    <span>
                      <span className="font-semibold text-theme-dark">
                        {r.formatted}
                      </span>
                      <span className="block text-[11px] text-theme-muted">
                        {r.country}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={handleSeePrices}
          className={
            v3
              ? "flex shrink-0 items-center justify-center bg-theme-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark sm:px-7 sm:py-3 sm:text-lg lg:px-4 lg:text-base 2xl:px-7 2xl:text-lg"
              : "flex items-center justify-center bg-theme-primary px-6 py-3 sm:py-4 text-base sm:text-lg font-bold text-white transition-colors hover:bg-theme-primary-dark sm:shrink-0"
          }
        >
          Find Local Pricing
        </button>
      </div>

      {homeVersion === 3 && (
        <>
          {/* The depot the prices are for, once there is one (no placeholder line: the mockups have none). */}
          {selectedLocation && (
            <p className="mt-6 flex items-center gap-2 text-lg text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden className="h-6 w-6 shrink-0 text-theme-primary">
                <path d="M0 0h24v24H0z" fill="none" />
                <path
                  fill="currentColor"
                  d="M18.364 17.364L12 23.728l-6.364-6.364a9 9 0 1 1 12.728 0M12 15a4 4 0 1 0 0-8a4 4 0 0 0 0 8m0-2a2 2 0 1 1 0-4a2 2 0 0 1 0 4"
                />
              </svg>
              <span>{selectedLocation}</span>
            </p>
          )}
          <div className="mt-2 flex flex-col">
            {banners.map((item) => (
              <BannerItem key={item.title} item={item} />
            ))}
          </div>
          <ViewAllContainersLink fill className="mt-4" />
        </>
      )}
    </div>
  );
}
