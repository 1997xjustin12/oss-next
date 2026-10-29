import { Suspense } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AiChatWidget } from "@/components/chat/AiChatWidget";
import { GuestCartCapture } from "@/components/layout/GuestCartCapture";
import { LinkEnricher } from "@/components/layout/LinkEnricher";
import { ZipAutoDetect } from "@/components/layout/ZipAutoDetect";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ROUTES } from "@/config/routes";
import { storefrontAnton, storefrontRoboto } from "@/lib/fonts";

/**
 * The storefront shell: its header, footer and chat, and everything only the
 * storefront needs, which used to sit in the root layout and so loaded on
 * every page (the GBP location pages and the admin included):
 *
 * - the account, cart and wishlist providers, and what hangs off them (the
 *   guest-cart email capture, ZIP auto-detect, which won't move a visitor off
 *   their cart's depot);
 * - the sale-link enricher.
 *
 * The cart lives in browser storage and the session in a cookie, so moving
 * between the storefront and a GBP page re-reads them; nothing is lost.
 */
export default function MarketLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          {/* The storefront's preloaded faces (lib/fonts.ts). `font-sans` re-applies
              the face here: <body> resolved it against the root layout's copy. */}
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
          <Suspense>
            <GuestCartCapture />
          </Suspense>
          {/* Inside CartProvider: it will not move a visitor off the depot their
              cart was built for, so it has to be able to read the cart. */}
          <Suspense>
            <ZipAutoDetect excludePaths={[ROUTES.CHECKOUT, ROUTES.CART, ROUTES.ACCOUNT.ROOT, ROUTES.WISHLIST]} />
          </Suspense>
          <Suspense>
            <LinkEnricher />
          </Suspense>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
