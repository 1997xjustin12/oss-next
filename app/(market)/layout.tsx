import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LinkEnricher } from "@/components/layout/LinkEnricher";

export default function MarketLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <TopBar />
      <Navbar />
      <LinkEnricher />
      <main>{children}</main>
      <Footer />
    </>
  );
}
