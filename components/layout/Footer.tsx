import Link from "next/link";
import { BASE_URL } from "@/lib/helpers";

const CONTAINER_LINKS = [
  {
    href: `${BASE_URL}/sale-shipping-containers/?ptype=buy`,
    label: "Buy Shipping Containers",
  },
  {
    href: `${BASE_URL}/sale-shipping-containers/?ptype=rental`,
    label: "Rent Shipping Containers",
  },
  {
    href: `${BASE_URL}/sale-shipping-containers/?ptype=rto`,
    label: "Rent-To-Own",
  },
  {
    href: `${BASE_URL}/reefer-refrigerated-container/`,
    label: "Refrigerated Units",
  },
  {
    href: `${BASE_URL}/shipping-container-modified-containers-gallery/`,
    label: "Modified Containers",
  },
  {
    href: `${BASE_URL}/shipping-container-accessory-products/`,
    label: "Accessories",
  },
];

const RESOURCES_LINKS = [
  { href: `${BASE_URL}/shipping-container-faqs/`, label: "FAQ" },
  {
    href: `${BASE_URL}/types-of-shipping-containers/`,
    label: "Container Types",
  },
  {
    href: `${BASE_URL}/shipping-container-conditions/`,
    label: "Container Conditions",
  },
  {
    href: `${BASE_URL}/shipping-container-pictures-by-grades/`,
    label: "Container Grades",
  },
  {
    href: `${BASE_URL}/complete-shipping-container-delivery-guide/`,
    label: "Delivery Guide",
  },
  { href: `${BASE_URL}/shipping-containers-blogs/`, label: "Blogs" },
];

const COMPANY_LINKS = [
  {href:`${BASE_URL}/why-onsite-storage/`, label:"Why Onsite Storage"},
  {href:`${BASE_URL}/where-to-buy-shipping-containers/`, label:"Locations"},
  {href:`${BASE_URL}/special-promotions/`, label:"Onsite Special"},
  {href:`${BASE_URL}/sales-tax-exemption-request/`, label:"Tax Exemption"},
  {href:`${BASE_URL}/my-account/`, label:"My Account"},
];

const POLICY_LINKS = [
  {href:`${BASE_URL}/privacy-policy/`, label:"Privacy Policy"},
  {href:`${BASE_URL}/terms-and-conditions/`, label:"Terms and Conditions"},
  {href:`${BASE_URL}/terms-and-conditions/#refund-policy`, label:"Refunds and Returns"},
  {href:`${BASE_URL}/shipping-policy/`, label:"Shipping Policy"},
];

export function Footer() {
  return (
    <footer
      className="bg-theme-footer pt-[54px] px-[5%] pb-[22px]"
      role="contentinfo"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-6 lg:gap-10 mb-8.5">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="bg-theme-primary text-white text-[10px] font-black px-2 py-[5px] rounded-[2px] leading-[1.2] text-center">
              ON-SITE
              <span className="text-[7.5px] font-normal opacity-80 block">
                STORAGE
              </span>
            </div>
            <div className="text-[15.5px] font-extrabold text-white">
              Onsite <span className="text-theme-primary">Storage</span>
            </div>
          </Link>
          <p className="text-[13px] text-[#666] leading-[1.65] mb-[15px]">
            America&apos;s leading shipping container wholesaler since 2002. New
            and used containers for sale, rent, and lease-to-own across the
            United States and Canada.
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="tel:8889779085"
              className="text-[13px] text-[#888] flex items-center gap-[7px] transition-colors hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                className="fill-theme-primary shrink-0"
                aria-hidden="true"
              >
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
              </svg>
              (888) 977-9085
            </a>
            <a
              href="mailto:info@onsitestorage.com"
              className="text-[13px] text-[#888] flex items-center gap-[7px] transition-colors hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                className="fill-theme-primary shrink-0"
                aria-hidden="true"
              >
                <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              info@onsitestorage.com
            </a>
            <a
              href="/locations"
              className="text-[13px] text-[#888] flex items-center gap-[7px] transition-colors hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                className="fill-theme-primary shrink-0"
                aria-hidden="true"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
              </svg>
              Wildomar, California 92595
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-[12.5px] font-bold text-[#ccc] uppercase tracking-[.06em] mb-[13px]">
            Containers
          </h4>
          {CONTAINER_LINKS.map(({ href, label }, index) => {
            return (
              <Link
                key={`container-link-${index}-${href}`}
                href={href}
                className="block text-[13px] text-[#666] mb-2 transition-colors hover:text-white"
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div>
          <h4 className="text-[12.5px] font-bold text-[#ccc] uppercase tracking-[.06em] mb-[13px]">
            Resources
          </h4>
          {RESOURCES_LINKS.map(({href, label}, index) => {
            return (
              <Link
                key={`resources-link-${index}-${href}`}
                href={href}
                className="block text-[13px] text-[#666] mb-2 transition-colors hover:text-white"
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div>
          <h4 className="text-[12.5px] font-bold text-[#ccc] uppercase tracking-[.06em] mb-[13px]">
            Company
          </h4>
          {COMPANY_LINKS.map(({href, label}, index) => {
            return (
              <Link
                key={`company-link-${index}-${href}`}
                href={href}
                className="block text-[13px] text-[#666] mb-2 transition-colors hover:text-white"
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div>
          <h4 className="text-[12.5px] font-bold text-[#ccc] uppercase tracking-[.06em] mb-[13px]">
            Policy
          </h4>
          {POLICY_LINKS.map(({href, label}, index) => {
            return (
              <Link
                key={`policy-link-${index}-${href}`}
                href={href}
                className="block text-[13px] text-[#666] mb-2 transition-colors hover:text-white"
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
      

      <div className="border-t border-[#1f1f1f] pt-5 flex justify-between items-center flex-wrap gap-3">
        <p className="text-xs text-[#444]">
          © 2025 On-Site Storage Solutions · All Rights Reserved ·{" "}
          <Link
            href="/privacy"
            className="text-[#555] transition-colors hover:text-[#888]"
          >
            Privacy Policy
          </Link>{" "}
          ·{" "}
          <Link
            href="/terms"
            className="text-[#555] transition-colors hover:text-[#888]"
          >
            Terms of Use
          </Link>{" "}
          ·{" "}
          <Link
            href="/sitemap.xml"
            className="text-[#555] transition-colors hover:text-[#888]"
          >
            Sitemap
          </Link>
        </p>
        <div className="flex gap-[9px] flex-wrap">
          {[
            "BBB Accredited",
            "Satisfaction Guaranteed",
            "Licensed & Insured",
          ].map((cert) => (
            <span
              key={cert}
              className="bg-white/[.04] border border-white/[.07] text-[#555] text-[11px] px-[9px] py-1 rounded-[2px] font-semibold"
            >
              {cert}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
