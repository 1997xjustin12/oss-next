"use client";

import { useState } from "react";
import Link from "next/link";
import { CartButton } from "@/components/layout/CartButton";

const NAV_LINKS = [
  { href: "/buy",         label: "Buy",            dropdown: true  },
  { href: "/rent",        label: "Rent",           dropdown: true  },
  { href: "/rent-to-own", label: "Rent-To-Own",    dropdown: false },
  { href: "/locations",   label: "Locations",      dropdown: false },
  { href: "/resources",   label: "Resources",      dropdown: true  },
  { href: "/special",     label: "Onsite Special", dropdown: false, highlight: true },
  { href: "/why-onsite",  label: "Why Onsite",     dropdown: false },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="bg-white border-b-[3px] border-theme-primary shadow-[0_2px_10px_rgba(0,0,0,.08)] sticky top-0 z-[1000]"
      aria-label="Main navigation"
    >
      {/* ── Desktop / tablet bar ── */}
      <div className="px-[5%] flex items-center justify-between h-[68px] gap-4">
        <Link href="/" className="flex items-center gap-[10px] shrink-0">
          <div className="bg-theme-primary text-white text-[11px] font-black px-[9px] py-[6px] rounded-[3px] tracking-[.01em] leading-[1.2] text-center">
            ON-SITE
            <span className="text-[8px] font-normal opacity-85 block">STORAGE</span>
          </div>
          <div className="text-lg font-extrabold text-theme-dark tracking-[-0.02em]">
            Onsite <span className="text-theme-primary">Storage</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-0.5 flex-nowrap">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[13.5px] font-semibold px-[11px] py-[6px] rounded transition-colors whitespace-nowrap ${
                link.highlight
                  ? "text-theme-primary"
                  : "text-theme-dark-2 hover:text-theme-primary"
              }`}
            >
              {link.label}{link.dropdown && <span className="text-[9px] opacity-50"> ▾</span>}
            </Link>
          ))}
        </div>

        {/* Desktop right section */}
        <div className="hidden lg:flex items-center gap-[10px] shrink-0">
          <CartButton />
          <div className="text-base font-extrabold text-theme-primary whitespace-nowrap">
            <a href="tel:8889779085">(888) 977-9085</a>
          </div>
          <Link
            href="#quote-section"
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
            <span className={`block w-5 h-0.5 bg-theme-dark transition-transform origin-center ${open ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-theme-dark transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-theme-dark transition-transform origin-center ${open ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {open && (
        <div className="lg:hidden border-t border-theme-border bg-white px-[5%] py-4 flex flex-col">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`py-3 text-[15px] font-semibold border-b border-theme-border/60 transition-colors hover:text-theme-primary ${
                link.highlight ? "text-theme-primary" : "text-theme-dark-2"
              }`}
            >
              {link.label}
            </Link>
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
