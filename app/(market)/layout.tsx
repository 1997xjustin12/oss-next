import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AiChatWidget } from "@/components/chat/AiChatWidget";

export default function MarketLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
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
