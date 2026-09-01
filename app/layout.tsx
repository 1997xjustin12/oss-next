import type { Metadata } from "next";
import { Anton, Roboto } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { LinkEnricher } from "@/components/layout/LinkEnricher";
import { ZipAutoDetect } from "@/components/layout/ZipAutoDetect";
import { DemoResets } from "@/components/layout/DemoResets";
import { GuestCartCapture } from "@/components/layout/GuestCartCapture";
import { ROUTES } from "@/config/routes";
import { SITE_URL } from "@/config/site";
import { ADMIN_PATHS } from "@/lib/admin";

// The default face for the whole storefront, wired to `--font-primary` (and so
// to `font-sans`) in globals.css.
const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

// Display face, used via the `font-anton` utility. Anton ships a single weight,
// so `weight` is required — it is not a variable font and next/font rejects it
// without one.
//
// The variable is named `--font-anton-src` rather than `--font-anton` because
// globals.css maps the Tailwind token `--font-anton` onto it; naming both the
// same would make that mapping refer to itself.
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton-src",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Shipping Containers For Sale | Lowest Price | On-Site Storage Solutions",
    template: "%s | On-Site Storage Solutions",
  },
  description:
    "Buy or rent new and used shipping containers across the USA & Canada. 20ft, 40ft, high cube, reefer & more. 130+ depots, nationwide delivery, lowest prices guaranteed since 2002.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${roboto.variable} ${anton.variable}`}>
      <body suppressHydrationWarning>
        {/* Machine-readable representations of the site, advertised so an agent
            that doesn't guess the well-known paths can still find them. React
            hoists these into <head>. Declared here rather than via the
            metadata object's `alternates.types` because a page that sets its
            own `alternates.canonical` replaces the whole alternates object,
            which would drop these links from nearly every page. */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="Site index for language models" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="Site index with full page text" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        {/* `service-desc` is the registered IANA relation for an API
            description document — how a tool is meant to discover an OpenAPI
            spec without being handed the URL. */}
        <link rel="service-desc" type="application/json" href="/openapi.json" title="Agent API description" />

        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <Suspense><GuestCartCapture /></Suspense>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
        <Suspense><LinkEnricher /></Suspense>
        {/* Reads ?reset-guest=1 / ?reset-zip=1 / ?reset-all=1 — needs the
            Suspense boundary that useSearchParams requires, like its
            neighbours here. */}
        <Suspense><DemoResets /></Suspense>
        <Suspense>
          <ZipAutoDetect excludePaths={[
            ROUTES.CHECKOUT,
            ROUTES.CART,
            ROUTES.ACCOUNT.ROOT,
            ROUTES.WISHLIST,
            ...ADMIN_PATHS,
          ]} />
        </Suspense>
      </body>
    </html>
  );
}
