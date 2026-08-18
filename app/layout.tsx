import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { LinkEnricher } from "@/components/layout/LinkEnricher";
import { ZipAutoDetect } from "@/components/layout/ZipAutoDetect";
import { GuestCartCapture } from "@/components/layout/GuestCartCapture";
import { ROUTES } from "@/config/routes";
import { SITE_URL } from "@/config/site";
import { ADMIN_PATHS } from "@/lib/admin";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" className={inter.variable}>
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
