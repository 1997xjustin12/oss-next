"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CartButton } from "@/components/layout/CartButton";
import { BASE_URL } from "@/lib/helpers";
import { applyEnrichParams } from "@/lib/linkEnrich";

type NavChild = { href: string; label: string };
type NavLink = {
  href: string;
  label: string;
  highlight?: boolean;
  children?: NavChild[];
};

const NAV_LINKS: NavLink[] = [
  {
    href: `${BASE_URL}/sale-shipping-containers/?ptype=buy`,
    label: "Buy",
    children: [
      {
        href: `${BASE_URL}/sale-shipping-containers/?ptype=buy`,
        label: "Buy Shipping Containers",
      },
      {
        href: `${BASE_URL}/reefer-refrigerated-container/`,
        label: "Buy Refrigerated Shipping Containers",
      },
      {
        href: `${BASE_URL}/shipping-container-modified-containers-gallery/`,
        label: "Modifications",
      },
      {
        href: `${BASE_URL}/shipping-container-accessory-products/`,
        label: "Shipping Container Accessories",
      },
    ],
  },
  {
    href: `${BASE_URL}/sale-shipping-containers/?ptype=rental`,
    label: "Rent",
    children: [
      {
        href: `${BASE_URL}/sale-shipping-containers/?ptype=rental`,
        label: "Shipping Container Rental",
      },
      {
        href: `${BASE_URL}/reefer-refrigerated-container/`,
        label: "Rent Refrigerated Shipping Containers",
      }
    ],
  },
  { href: `${BASE_URL}/sale-shipping-containers/?ptype=rto`, label: "Rent-To-Own" },
  { href: `${BASE_URL}/where-to-buy-shipping-containers/`, label: "Locations" },
  {
    href: `${BASE_URL}/shipping-containers-blogs/`,
    label: "Resources",
    children: [
      {href: `${BASE_URL}/shipping-container-faqs/`, label: "FAQ"},
      {href: `${BASE_URL}/types-of-shipping-containers/`, label: "Container Types"},
      {href: `${BASE_URL}/shipping-container-conditions/`, label: "Container Conditions"},
      {href: `${BASE_URL}/shipping-container-pictures-by-grades/`, label: "Container Grades"},
      {href: `${BASE_URL}/complete-shipping-container-delivery-guide/`, label: "Delivery Guide"},
      {href: `${BASE_URL}/containers-we-delivered/`, label: "Containers We Delivered"},
      {href: `${BASE_URL}/sales-tax-exemption-request/`, label: "Tax Exemption"},
      {href: `${BASE_URL}/shipping-containers-blogs/`, label: "Blogs"},
    ],
  },
  { href: `${BASE_URL}/special-promotions/`, label: "Onsite Special", highlight: true },
  { href: `${BASE_URL}/why-onsite-storage/`, label: "Why Onsite" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const [dropdownLeft, setDropdownLeft] = useState(0);
  const [enrichZip, setEnrichZip] = useState('');
  const [enrichLoc, setEnrichLoc] = useState('');
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setEnrichZip(localStorage.getItem('zipcode') ?? '');
    setEnrichLoc(localStorage.getItem('zipcode_depot') ?? '');
  }, []);

  // Enrich a single href using stored location data
  const e = (href: string) => applyEnrichParams(href, enrichZip, enrichLoc);

  const activeNavLink = NAV_LINKS.find((l) => l.href === activeLink);

  function openDesktopDropdown(
    href: string,
    e: React.MouseEvent<HTMLDivElement>
  ) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveLink(href);
    if (navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = e.currentTarget.getBoundingClientRect();
      setDropdownLeft(itemRect.left - navRect.left);
    }
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setActiveLink(null), 150);
  }

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  return (
    <nav
      ref={navRef}
      className="bg-white border-b-[3px] border-theme-primary shadow-[0_2px_10px_rgba(0,0,0,.08)] sticky top-0 z-1000"
      aria-label="Main navigation"
    >
      {/* ── Desktop / tablet bar ── */}
      <div className="px-[5%] flex items-center justify-between h-[68px] gap-4">
        <Link href="/" className="flex items-center gap-[10px] shrink-0">
          <div className="bg-theme-primary text-white text-[11px] font-black px-[9px] py-[6px] rounded-[3px] tracking-[.01em] leading-[1.2] text-center">
            ON-SITE
            <span className="text-[8px] font-normal opacity-85 block">
              STORAGE
            </span>
          </div>
          <div className="text-lg font-extrabold text-theme-dark tracking-[-0.02em]">
            Onsite <span className="text-theme-primary">Storage</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-0.5 flex-nowrap">
          {NAV_LINKS.map((link) => (
            <div
              key={link.href}
              onMouseEnter={
                link.children
                  ? (ev) => openDesktopDropdown(link.href, ev)
                  : undefined
              }
              onMouseLeave={link.children ? scheduleClose : undefined}
            >
              <Link
                href={e(link.href)}
                className={`flex items-center gap-0.5 text-[13.5px] font-semibold px-2.75 py-1.5 rounded transition-colors whitespace-nowrap ${
                  link.highlight
                    ? "text-theme-primary"
                    : "text-theme-dark-2 hover:text-theme-primary"
                }`}
              >
                {link.label}
                {link.children && (
                  <span className="text-[9px] opacity-40 ml-0.5">▾</span>
                )}
              </Link>
            </div>
          ))}
        </div>

        {/* Desktop right section */}
        <div className="hidden lg:flex items-center gap-[10px] shrink-0">
          <CartButton />
          <div className="text-base font-extrabold text-theme-primary whitespace-nowrap">
            <a href="tel:8889779085">(888) 977-9085</a>
          </div>
          <Link
            href={`${BASE_URL}/shipping-container-quote/`}
            className="bg-theme-primary text-white px-[18px] py-[10px] rounded-[5px] text-[13.5px] font-bold whitespace-nowrap transition-colors hover:bg-theme-primary-dark"
          >
            Get Free Quote
          </Link>
        </div>

        {/* Mobile: phone + hamburger */}
        <div className="flex lg:hidden items-center gap-3 shrink-0 ml-auto">
          <a
            href="tel:8889779085"
            className="hidden sm:block text-[13px] font-extrabold text-theme-primary whitespace-nowrap"
          >
            (888) 977-9085
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded cursor-pointer border border-theme-border bg-transparent transition-colors hover:border-theme-primary"
          >
            <span
              className={`block w-5 h-0.5 bg-theme-dark transition-transform origin-center ${open ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-theme-dark transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-theme-dark transition-transform origin-center ${open ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ── Desktop dropdown — rendered at nav level, below the border ── */}
      {activeNavLink?.children && (
        <div
          className="hidden lg:block absolute top-full mt-1 z-50"
          style={{ left: dropdownLeft }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="bg-white border border-theme-border rounded-b-[5px] rounded-tr-[5px] shadow-[0_4px_16px_rgba(0,0,0,.10)] min-w-57.5 py-1.5">
            {activeNavLink.children.map((child) => (
              <Link
                key={child.href}
                href={e(child.href)}
                className="block px-4 py-2.5 text-[13px] font-medium text-theme-dark-2 hover:text-theme-primary hover:bg-theme-primary/5 transition-colors"
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Mobile menu ── */}
      {open && (
        <div className="lg:hidden border-t border-theme-border bg-white px-[5%] py-4 flex flex-col">
          {NAV_LINKS.map((link) => (
            <div key={link.href}>
              <div className="flex items-center justify-between border-b border-theme-border/60">
                <Link
                  href={e(link.href)}
                  onClick={() => setOpen(false)}
                  className={`py-3 flex-1 text-[15px] font-semibold transition-colors hover:text-theme-primary ${
                    link.highlight ? "text-theme-primary" : "text-theme-dark-2"
                  }`}
                >
                  {link.label}
                </Link>
                {link.children && (
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === link.href ? null : link.href
                      )
                    }
                    aria-label={`Toggle ${link.label} submenu`}
                    className="p-2 text-theme-dark-2 hover:text-theme-primary transition-colors"
                  >
                    <span
                      className={`block text-[11px] transition-transform duration-200 ${
                        openDropdown === link.href ? "rotate-180" : ""
                      }`}
                    >
                      ▾
                    </span>
                  </button>
                )}
              </div>
              {link.children && openDropdown === link.href && (
                <div className="pl-4 pb-1">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={e(child.href)}
                      onClick={() => setOpen(false)}
                      className="block py-2.5 text-[13.5px] text-theme-dark-2 hover:text-theme-primary transition-colors border-b border-theme-border/40 last:border-0"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="flex flex-col gap-2.5 mt-4">
            <a
              href="tel:8889779085"
              className="flex items-center justify-center gap-2 py-3 border border-theme-border rounded-[5px] text-[14px] font-bold text-theme-dark-2 transition-colors hover:border-theme-primary hover:text-theme-primary sm:hidden"
            >
              📞 (888) 977-9085
            </a>
            <Link
              href="#quote-section"
              onClick={() => setOpen(false)}
              className="bg-theme-primary text-white py-3 rounded-[5px] text-[14px] font-bold text-center transition-colors hover:bg-theme-primary-dark"
            >
              Get Free Quote
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
