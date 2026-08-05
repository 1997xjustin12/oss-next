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
import { ADMIN_PATHS } from "@/lib/admin";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://onsitestorage.com"),
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
