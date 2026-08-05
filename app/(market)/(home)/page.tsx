import { Suspense } from "react";
import { headers } from "next/headers";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/config/cache";
import { ROUTES } from "@/config/routes";
import { resolvePageMetadata } from "@/lib/seo";
import { getHomeHeadings } from "@/lib/content";
import { JsonLd } from "@/components/shared/JsonLd";
import { PageHeadScripts } from "@/components/shared/PageHeadScripts";
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

// Copy lives in config/pageSeoDefaults.ts so the admin Page Configurator can
// show it as the placeholder behind each field.
export function generateMetadata() {
  return resolvePageMetadata(ROUTES.HOME);
}

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
async function VariantHero({ h1, h2 }: { h1: string; h2: string }) {
  const h = await headers();
  const raw = h.get("x-ab-home-variant");
  const version = raw === "2" ? 2 : raw === "3" ? 3 : 1;
  return <Hero version={version} h1={h1} h2={h2} />;
}

export default async function Home() {
  await getHomeData();

  // Every heading on the page, resolved once here and passed down. Doing it in
  // the shell keeps the fetch to a single cached read and lets the three Client
  // Components below receive their copy as props — they can't read Redis
  // themselves. See config/homeContent.ts for the registry.
  const copy = await getHomeHeadings();

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={ROUTES.HOME} />
      {/* <HeroSection /> */}
      {/* <TrustStrip /> */}
      {/* <ContainerTypes /> */}
      {/* <WhyUs /> */}
      {/* <Reviews /> */}

      <Suspense fallback={<HeroSkeleton />}>
        <VariantHero h1={copy["hero.h1"]} h2={copy["hero.h2"]} />
      </Suspense>
      <RightContainer heading={copy["rightContainer.h2"]} />
      <HowItWorks
        heading={copy["howItWorks.h2"]}
        stepTitles={[
          copy["howItWorks.step1"],
          copy["howItWorks.step2"],
          copy["howItWorks.step3"],
          copy["howItWorks.step4"],
        ]}
      />
      <OnsiteDifference
        heading={copy["onsiteDifference.h2"]}
        itemTitles={[
          copy["onsiteDifference.item1"],
          copy["onsiteDifference.item2"],
          copy["onsiteDifference.item3"],
          copy["onsiteDifference.item4"],
        ]}
      />
      <TrustedBySection heading={copy["trustedBy.h2"]} />
      <QuoteForm heading={copy["quoteForm.h2"]} />
      <ReviewsSection heading={copy["reviews.h2"]} />
      {/* Rendered alongside the static one above for comparison, per request — not a final placement decision. */}
      <ReviewsSectionLive heading={copy["reviews.h2"]} />
      <StatesSection heading={copy["states.h2"]} />
    </>
  );
}
