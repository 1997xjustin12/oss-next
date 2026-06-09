import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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

export default function MarketLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <TopBar />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
