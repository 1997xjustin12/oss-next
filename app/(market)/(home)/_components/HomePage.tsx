import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/config/cache";
import { ROUTES } from "@/config/routes";
import { SITE } from "@/config/site";
import { graph, siteNodes, webPageNode } from "@/lib/schema";
import { resolveAgentSummary } from "@/lib/seo";
import { mixReviews } from "@/lib/storeReviews";
import { REVIEWS } from "@/config/reviews";
import { getOnsiteReviews, getStoreReviews } from "@/services/review.service";
import { getHomeHeadings } from "@/lib/content";
import { JsonLd } from "@/components/shared/JsonLd";
import { PageHeadScripts } from "@/components/shared/PageHeadScripts";
import { QuoteForm } from "@/components/shared/QuoteForm";
import { TrustedBySection } from "@/components/shared/TrustedBySection";
import { HowItWorks } from "./HowItWorks";
import { StatesSection } from "./StatesSection";
import { Hero } from "./Hero";
import { HeroBannerPreload } from "./HeroBannerPreload";
import { RightContainer } from "./RightContainer";
import { OnsiteDifference } from "./OnsiteDifference";
import { ReviewsSection } from "./ReviewsSection";

/** The homepage A/B/C variants. Variant 1 is the control. */
export const HOME_VARIANTS = [1, 2, 3] as const;
export type HomeVariant = (typeof HOME_VARIANTS)[number];

export function parseHomeVariant(raw: string | undefined): HomeVariant | null {
  const n = Number(raw);
  return (HOME_VARIANTS as readonly number[]).includes(n) ? (n as HomeVariant) : null;
}

// Organization + WebSite, built from config/site.ts so every other page's
// schema can reference the same two @ids instead of restating them.
//
// The WebPage description is the admin-editable agent summary rather than a
// constant, so the same sentence a reader gets from /llms.txt is the one in the
// structured data — and an author can change both from the Page Configurator
// without a deploy.
async function buildHomeJsonLd() {
  return graph([
    ...siteNodes(),
    webPageNode({
      path: ROUTES.HOME,
      name: SITE.name,
      description: (await resolveAgentSummary(ROUTES.HOME)) ?? SITE.tagline,
    }),
  ]);
}

async function getHomeData() {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.HOMEPAGE);
  // TODO: return await fetchFeaturedProducts()
}

/**
 * The whole homepage for one A/B variant.
 *
 * The variant arrives as a prop, never from the request: the proxy rewrites `/`
 * to /home-variant/<n> (see handleAbTest in proxy.ts), and each variant is a
 * prebuilt static page. The hero used to read the variant from a request header
 * behind a Suspense boundary, which made it stream at the very end of the HTML
 * (byte ~195,000 of ~198,000) and put a function render on every home view.
 */
export async function HomePage({ variant }: { variant: HomeVariant }) {
  await getHomeData();

  // Every heading on the page, resolved once here and passed down. Doing it in
  // the shell keeps the fetch to a single cached read and lets the three Client
  // Components below receive their copy as props — they can't read Redis
  // themselves. See config/homeContent.ts for the registry.
  // Cached reads, run together. The reviews weave three sources: this site's
  // own (the backend, from customers with an order), REVIEWS.io's newest, both
  // live and refreshed hourly, and the hand-kept Google ones, which have no
  // feed. A source that fails or is empty simply drops out of the mix.
  const [copy, jsonLd, onsiteReviews, storeReviews] = await Promise.all([
    getHomeHeadings(),
    buildHomeJsonLd(),
    getOnsiteReviews(),
    getStoreReviews(),
  ]);
  const reviews = mixReviews(onsiteReviews, storeReviews, REVIEWS);

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={ROUTES.HOME} />
      {/* <TrustStrip /> */}
      {/* <ContainerTypes /> */}
      {/* <WhyUs /> */}
      {/* <Reviews /> */}

      <HeroBannerPreload />
      <Hero version={variant} h1={copy["hero.h1"]} h2={copy["hero.h2"]} />
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
      <ReviewsSection heading={copy["reviews.h2"]} reviews={reviews} />
      <StatesSection heading={copy["states.h2"]} />
    </>
  );
}
