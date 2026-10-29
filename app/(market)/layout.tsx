import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AiChatWidget } from "@/components/chat/AiChatWidget";
import { storefrontAnton, storefrontRoboto } from "@/lib/fonts";

export default function MarketLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The storefront's preloaded faces (lib/fonts.ts). `font-sans` re-applies
    // the face here: <body> resolved it against the root layout's copy.
    <div className={`${storefrontRoboto.variable} ${storefrontAnton.variable} flex min-h-screen flex-col font-sans`}>
      <TopBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Renders nothing until it has mounted and the region check has
          answered, so the server HTML stays free of a control that cannot work
          without JavaScript. */}
      <AiChatWidget />
    </div>
  );
}
