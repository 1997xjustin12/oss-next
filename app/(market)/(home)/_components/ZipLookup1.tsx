"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MapPin } from "lucide-react";
import { useGeoapify } from "@/hooks/useGeoapify";
import type { GeoapifyResult } from "@/hooks/useGeoapify";
import type { FormattedContainerHit } from "@/types/product";
import { getCustomFieldValue } from "@/lib/pricing";
import { BASE_URL } from "@/lib/helpers";

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
  title: string;
  price_starts: string;
  tags: string;
  availability: string;
  url: string;
  params: BannerParams;
};

const BANNER_LIST: BannerListItem[] = [
  {
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
  const hasCents = price % 1 !== 0;
  const amount = price.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  });
  return `$${amount}${suffix}`;
}

function buildBannerUrl(item: BannerListItem, zipcode: string, location: string): string {
  const params = new URLSearchParams(item.params);
  if (zipcode) params.set("zipcode", zipcode);
  if (location) params.set("location", location);
  return `${BASE_URL}/sale-shipping-containers?${params}`;
}

type BannerItemProps = { item: BannerListItem };

function BannerItem({ item }: BannerItemProps) {
  return (
    <Link
      prefetch={false}
      href={item.url}
      className="flex flex-col gap-3 border-b border-white/20 py-4 text-white last:border-b-0"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-bold text-white text-[20px]">{item.title}</div>
          <div className="text-[13px] text-[#a3a3a3] font-light">{item.tags}</div>
        </div>
        <div className="font-bold whitespace-nowrap text-[24px]">{item.price_starts}</div>
      </div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <div className="text-[12px] font-bold text-[#04B761]">{item.availability}</div>
        <div aria-hidden="true">&rarr;</div>
      </div>
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
  const [zip, setZip] = useState(initialZip);
  const [open, setOpen] = useState(false);
  const [selectedZipcode, setSelectedZipcode] = useState(initialZip);
  const [selectedLocation, setSelectedLocation] = useState(location);

  const { results, loading, error, clear, selectResult, depotContainers } = useGeoapify(zip, {
    type: "postcode",
    countries: "us,ca",
    debounceMs: 300,
    limit: 5,
  });

  // Sync input with URL when a zipcode param is present; otherwise fall back
  // to the last zip the user picked (there's no URL param to sync from on
  // the homepage, so this is what actually populates the field here).
  useEffect(() => {
    const label = localStorage.getItem("zipcode_label");
    const stored = localStorage.getItem("zipcode");
    const storedDepot = localStorage.getItem("zipcode_depot");

    if (!initialZip) {
      setZip(label ?? "");
    } else if (stored === initialZip && label) {
      setZip(label);
    } else {
      setZip(initialZip);
    }

    setSelectedZipcode(stored ?? initialZip);
    setSelectedLocation(storedDepot ?? location);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialZip]);

  // Auto-select when the dropdown narrows to exactly one match. Whether this
  // redirects depends on homeVersion — see handleSelect below.
  useEffect(() => {
    if (open && results.length === 1) {
      handleSelect(results[0]);
    }
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
    setZip(result.formatted);
    selectResult(result);
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

  function handleSeePrices() {
    const trimmed = zip.trim();
    if (!trimmed) return;
    setOpen(false);
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

  const showDropdown = open && (results.length > 0 || loading || !!error);

  return (
    <div>
      <div className="flex w-full max-w-xl mx-auto flex-col gap-3 sm:flex-row">
        {/* Input + dropdown */}
        <div className="relative flex-1">
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
            className="w-full bg-white text-theme-dark placeholder-theme-dark/70 px-4 py-3 sm:py-4 text-base sm:text-lg font-bold outline-none"
            aria-label="ZIP or postal code"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted animate-spin pointer-events-none" />
          )}

          {showDropdown && (
            <ul
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
                <li key={r.placeId} role="option">
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
          className="flex items-center justify-center bg-theme-primary px-6 py-3 sm:py-4 text-base sm:text-lg font-bold text-white transition-colors hover:bg-theme-primary-dark sm:shrink-0"
        >
          Find Local Pricing
        </button>
      </div>

      {homeVersion === 3 && (
        <>
          <div className="flex flex-col">
            {banners.map((item) => (
              <BannerItem key={item.title} item={item} />
            ))}
          </div>
          <div className="flex justify-center">
            <Link
              prefetch={false}
              href={`${BASE_URL}/sale-shipping-containers?ptype=buy`}
              className="text-white bg-[#BD112A] text-center py-2 px-5"
            >
              View All Containers & Pricing
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
