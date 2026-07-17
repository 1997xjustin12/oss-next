import { Suspense } from "react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/config/cache";
import { ROUTES } from "@/config/routes";
import { JsonLd } from "@/components/shared/JsonLd";
import { HeroSection } from "./_components/HeroSection";
import { TrustStrip } from "./_components/TrustStrip";
import { ContainerTypes } from "./_components/ContainerTypes";
import { HowItWorks } from "./_components/HowItWorks";
import { WhyUs } from "./_components/WhyUs";
import { QuoteForm } from "./_components/QuoteForm";
import { Reviews } from "./_components/Reviews";
import { StatesSection } from "./_components/StatesSection";

import { Hero } from "./_components/Hero";
import { HeroSkeleton } from "./_components/HeroSkeleton";
import { RightContainer } from "./_components/RightContainer";
import { OnsiteDifference } from "./_components/OnsiteDifference";
import { TrustedBySection } from "./_components/TrustedBySection";
import { ReviewsSection } from "./_components/ReviewsSection";
import { ReviewsSectionLive } from "./_components/ReviewsSectionLive";

export const metadata: Metadata = {
  title: "Shipping Containers For Sale | Lowest Price Shipping Containers",
  description:
    "Buy or rent new and used shipping containers across the USA & Canada. 20ft, 40ft, high cube, reefer & more. 130+ depots, nationwide delivery, lowest prices guaranteed since 2002.",
  alternates: {
    canonical: ROUTES.HOME,
  },
  openGraph: {
    title: "Shipping Containers For Sale | Lowest Price Shipping Containers",
    description:
      "We have the biggest range of shipping containers for sale and rent in the USA and Canada. Call us now for the best pricing and fast delivery.",
    type: "website",
    url: "https://onsitestorage.com/",
    images: [{ url: "/images/og-home.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://onsitestorage.com/#org",
      name: "On-Site Storage Solutions",
      url: "https://onsitestorage.com",
      telephone: "+18889779085",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Wildomar",
        addressRegion: "CA",
        postalCode: "92595",
        addressCountry: "US",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://onsitestorage.com/#website",
      url: "https://onsitestorage.com",
      name: "On-Site Storage Solutions",
      publisher: { "@id": "https://onsitestorage.com/#org" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://onsitestorage.com/products?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

async function getHomeData() {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.HOMEPAGE);
  // TODO: return await fetchFeaturedProducts()
}

// Reads the sticky variant middleware.ts assigned this visitor (via a
// request header, not the cookie directly — the header is always correct
// even on a visitor's very first request, before the cookie exists yet).
// Isolated in its own component + Suspense boundary since headers() is a
// dynamic API — this keeps the rest of the homepage statically cacheable.
async function VariantHero() {
  const h = await headers();
  const raw = h.get("x-ab-home-variant");
  const version = raw === "2" ? 2 : raw === "3" ? 3 : 1;
  return <Hero version={version} />;
}

export default async function Home() {
  await getHomeData();

  return (
    <>
      <JsonLd data={jsonLd} />
      {/* <HeroSection /> */}
      {/* <TrustStrip /> */}
      {/* <ContainerTypes /> */}
      {/* <WhyUs /> */}
      {/* <Reviews /> */}

      <Suspense fallback={<HeroSkeleton />}>
        <VariantHero />
      </Suspense>
      <RightContainer />
      <HowItWorks />
      <OnsiteDifference />
      <TrustedBySection />
      <QuoteForm />
      <ReviewsSection />
      {/* Rendered alongside the static one above for comparison, per request — not a final placement decision. */}
      <ReviewsSectionLive />
      <StatesSection />
    </>
  );
}
