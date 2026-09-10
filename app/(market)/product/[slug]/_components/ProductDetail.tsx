"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { findEquivalentContainer, isContainerHit, isGenericDisplayHit } from "@/lib/pricing";
import { resolveContainerVariant } from "@/lib/containerVariant";
import { ROUTES } from "@/config/routes";
import { notifyVisitorZipChange, readVisitorZip } from "@/lib/visitorZip";
import { getNearestLocation } from "@/lib/locations";
import type { ProductHit } from "@/types/product";
import { ProductVariantShell } from "./ProductVariantShell";
import { MobileTrustSection } from "./MobileTrustSection";
import type { LocationChangeStrategy } from "./DeliveryZipCheck";
import { AccessoryDetail } from "./AccessoryDetail";
import { BodyTabsSection } from "./BodyTabsSection";
import { FaqAccordion } from "./FaqAccordion";
import { TrustedBySection } from "@/components/shared/TrustedBySection";
// WordPress-sourced reviews (previous PDP source) — kept in place, easy to
// restore by swapping the import + JSX below, if ReviewsCarousel needs to be
// rolled back before the OSS reviews table has enough approved data.
// import { CustomerReviews } from './CustomerReviews'
// import { ReviewsCarousel } from "./ReviewsCarousel"
import { YouMayAlsoNeed } from "./YouMayAlsoNeed";
import { MobileSpecialistBanner } from "./MobileSpecialistBanner";
import { ContainerResources } from "./ContainerResources";
import { QuoteForm } from "@/components/shared/QuoteForm";
import { StatesSection } from "@/app/(market)/(home)/_components/StatesSection";
import { CustomerReviewsSection } from "./CustomerReviewsSection";
type IdealForItem = {
  id: string;
  image: string;
  title: string;
};

/**
 * The uses shown in the "Ideal for" strip.
 *
 * Six entries to match the six-column grid. `title` doubles as the image's alt
 * text, so it has to read as a description of the picture and not just a label
 * — which it does, since each image is a photograph of the use it names.
 */
const IDEAL_FOR: IdealForItem[] = [
  {
    id: "residential-storage",
    image: "/images/pdp-ideal-for-section/residential-storage.webp",
    title: "Residential Storage",
  },
  {
    id: "construction-sites",
    image: "/images/pdp-ideal-for-section/construction-sites.webp",
    title: "Construction Sites",
  },
  {
    id: "disaster-relief",
    image: "/images/pdp-ideal-for-section/disaster-relief.webp",
    title: "Disaster Relief",
  },
  {
    id: "workshop-space",
    image: "/images/pdp-ideal-for-section/workshop-space.webp",
    title: "Workshop Space",
  },
  {
    id: "pop-up-retail",
    image: "/images/pdp-ideal-for-section/pop-up-retail.webp",
    title: "Pop-Up Retail",
  },
  {
    id: "farm-and-agri",
    image: "/images/pdp-ideal-for-section/farm-and-agri.webp",
    title: "Farm & Agriculture",
  },
];

type Props = { product: ProductHit; relatedProducts: ProductHit[] };

/**
 * The yard nearest a postcode, or null.
 *
 * Never throws: this runs on page load to improve what the visitor sees, so a
 * geocoding hiccup should leave them on the listing they asked for rather than
 * breaking the page.
 */
async function depotForPostcode(postcode: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({ text: postcode, type: "postcode", limit: "1" });
    const res = await fetch(`/api/geoapify?${params}`);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      features?: { properties?: { lat?: number; lon?: number } }[];
    };
    const props = json.features?.[0]?.properties;
    if (typeof props?.lat !== "number" || typeof props?.lon !== "number") return null;
    return getNearestLocation(props.lat, props.lon);
  } catch {
    return null;
  }
}

/**
 * Is a product page still the thing on screen?
 *
 * Every history write below is a *correction* to a product URL — it renames the
 * entry the visitor is already standing on. None of them is a navigation, so
 * none of them is correct once the visitor has left.
 */
function onProductPage(): boolean {
  return window.location.pathname.startsWith("/product/");
}

/**
 * Has the visitor asked to go somewhere else?
 *
 * The depot swap runs two network round-trips before it rewrites the URL, and
 * nothing used to cancel it when the visitor left mid-flight. Clicking a nav
 * link during that window started the navigation and then let the resolving
 * swap `replaceState` a product URL over it — and because Next patches
 * `replaceState` to re-sync the router, that write did not merely change the
 * address bar, it *cancelled the navigation*: the visitor clicked Buy and
 * stayed on a product page. Reproducible here in roughly one attempt in five
 * inside a ~200 ms window, and far wider on real latency, where those two
 * fetches take seconds rather than the milliseconds they take against a local
 * backend.
 *
 * A committed-URL check cannot catch it. The router changes the URL only once
 * the payload for the new page arrives, so at the moment the swap resolves the
 * pathname is still this product's — the guard passes and the damage is done.
 * What is needed is the visitor's *intent*, which is observable a beat earlier:
 * the click itself. Capture phase, so it is recorded before any handler can
 * stop propagation.
 *
 * Compared by pathname so that in-page anchors and a repeat click on the
 * current product — neither of which goes anywhere — do not disarm the swap.
 */
function useLeavingRef() {
  const leaving = useRef(false);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.("a[href]");
      const href = anchor?.getAttribute("href");
      if (!href) return;
      try {
        if (new URL(href, window.location.href).pathname !== window.location.pathname) {
          leaving.current = true;
        }
      } catch {
        // Not a URL we can resolve — leave the swap armed.
      }
    };
    const onPopState = () => {
      leaving.current = true;
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return leaving;
}

export function ProductDetail({ product, relatedProducts }: Props) {
  // Shared across ProductVariantShell, BodyTabsSection, and FaqAccordion so
  // they all react to whichever variant the shopper currently has selected.
  const [activeProduct, setActiveProduct] = useState(product);

  /**
   * The depot's container pool, and the product the option pickers treat as
   * their starting point.
   *
   * Both arrive as server props but are held in state because a location change
   * replaces them wholesale: every size, condition and grade option is derived
   * from this pool, so switching depot means switching the entire option layer,
   * not just the product on screen.
   */
  const [pool, setPool] = useState(relatedProducts);
  const [baseProduct, setBaseProduct] = useState(product);
  const [swapping, setSwapping] = useState(false);
  const leaving = useLeavingRef();
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  /**
   * Move the page to the equivalent container at another depot, without
   * navigating.
   *
   * The alternative — and what this replaces at the call site — is
   * `router.push` to the other product's URL. That works, but it tears down and
   * rebuilds the whole page for what is really one more axis of the same
   * selection the size and condition pickers already change in place.
   *
   * Deliberately conservative when the depot has no exact match: it keeps the
   * visitor's chosen spec and explains, rather than quietly substituting a
   * different container. Silently changing someone's selection is worse than
   * telling them it isn't stocked.
   */
  const swapToLocation = useCallback(
    async (location: string) => {
      setSwapping(true);
      setLocationNotice(null);
      try {
        const res = await fetch(
          `/api/shipping-containers/by-location?location=${encodeURIComponent(location)}`,
        );
        if (!res.ok) throw new Error(`by-location responded ${res.status}`);

        const json = (await res.json()) as { data?: ProductHit[] };
        const nextPool = json.data ?? [];
        const match = findEquivalentContainer(nextPool, activeProduct);

        if (!match?.handle) {
          setLocationNotice(
            `${location} doesn't stock this exact container right now — showing the original depot. Try a different size or grade, or call us.`,
          );
          return;
        }

        // Nothing below is right for a visitor who left while those two
        // fetches were in flight — see useLeavingRef. Checked before the state
        // writes as well as the history write, so a departed visitor doesn't
        // pay for a re-render of a tree that is on its way out either.
        if (leaving.current || !onProductPage()) return;

        setPool(nextPool);
        setBaseProduct(match);
        setActiveProduct(match);

        // Replaces rather than pushes: picking a ZIP is a selection, not a
        // step worth a Back press, and a visitor who tries three ZIPs should
        // still be one press from where they came in. It carries the handle
        // so the entry names the product it now points at.
        // The query string is carried over, not dropped. `readVisitorZip`
        // resolves `?zipcode=` ahead of storage, so rewriting the URL without
        // it silently changes what every reader on the page resolves to — the
        // delivery field would fall back to whatever was stored before, right
        // after the visitor told us somewhere new.
        const swapped = new URL(window.location.href);
        swapped.pathname = ROUTES.PRODUCT(String(match.handle));
        window.history.replaceState({ handle: String(match.handle) }, "", swapped);
        notifyVisitorZipChange();
      } catch {
        setLocationNotice(
          "Couldn't load containers for that location. Please try again, or call us.",
        );
      } finally {
        setSwapping(false);
      }
    },
    [activeProduct, leaving],
  );

  /**
   * Variant selections are logged to browser history, so Back and Forward step
   * through them.
   *
   * All three pieces live here rather than in the shell because the popstate
   * handler has to turn a handle back into a product, and this is where the
   * pool of them is. Native history rather than `router.push`: that re-runs the
   * server component for a change already resolved on the client, so the swap
   * stops being instant.
   *
   * The URL carries the variant in its path — `/product/<handle>` — rather than
   * a query parameter, because each variant is a real product with its own page.
   */

  /** Seeds the entry the page loaded on, so Back from the next one has a handle. */
  useEffect(() => {
    const handle = String(activeProduct.handle ?? "");
    if (handle && onProductPage())
      window.history.replaceState({ handle }, "", window.location.href);
    // Mount only — later entries are pushed by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handle = String(activeProduct.handle ?? "");
    if (!handle) return;

    // A variant settling after the visitor has navigated away must not push a
    // product entry onto the page they moved to — see useLeavingRef.
    if (leaving.current || !onProductPage()) return;

    // Already the entry we are standing on. Covers both a repeat click on the
    // selected option and a change that came from popstate — the browser set
    // that state before telling us, so pushing here would bury the entry the
    // visitor just navigated back to.
    const current = (window.history.state as { handle?: string } | null)?.handle;
    if (current === handle) return;

    // Query carried over for the same reason the ZIP swap carries it: the
    // visitor's location is orthogonal to which variant they are looking at,
    // and dropping it here means a link copied after switching size arrives
    // somewhere with no location at all.
    const next = new URL(window.location.href);
    next.pathname = ROUTES.PRODUCT(handle);
    window.history.pushState({ handle }, "", next);
  }, [activeProduct, leaving]);

  useEffect(() => {
    function onPopState(event: PopStateEvent) {
      const fromState = (event.state as { handle?: string } | null)?.handle;
      // Falls back to the path for entries pushed before this state shape
      // existed, or by anything else that rewrote the URL.
      const fromPath = window.location.pathname
        .split("/product/")[1]
        ?.replace(/\/$/, "");
      const handle = fromState ?? fromPath;
      if (!handle) return;

      const match = [baseProduct, product, ...pool].find(
        (p) => String(p.handle) === handle,
      );

      if (match) {
        setActiveProduct(match);
        return;
      }

      // The depot changed since that entry was pushed, so the product is no
      // longer in this pool and cannot be restored on the client. The URL has
      // already moved, so reloading renders what it now points at — better than
      // leaving the address bar describing a product that is not on screen.
      window.location.reload();
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [pool, baseProduct, product]);

  /**
   * On arrival, move a reference listing to the visitor's own depot.
   *
   * A "Generic Product Page" describes a container without saying where it
   * comes from, so its price, stock and delivery are all placeholders. When we
   * already know where the visitor is — a `?zipcode=` on the link, or a ZIP
   * they gave us on an earlier page — there is no reason to show them the
   * placeholder and wait for them to ask. Clicking a generic listing from the
   * PLP should land on the real container stocked near them.
   *
   * `readVisitorZip` is the same reader the rest of the site uses, so the URL
   * parameter wins over storage and the depot is only returned when it belongs
   * to the ZIP actually in play — a depot left over from a previous ZIP would
   * relocate the visitor somewhere they never asked about.
   *
   * Runs once. `swapToLocation` replaces `activeProduct`, which re-runs this
   * effect, and without the latch the second pass would swap the swapped
   * product again.
   *
   * Only reference listings. A visitor who clicked a specific container at a
   * named depot chose that depot; silently moving them to another because of a
   * ZIP in storage would take away a choice they had already made.
   */
  const autoSwapped = useRef(false);
  useEffect(() => {
    if (autoSwapped.current) return;
    if (!isGenericDisplayHit(activeProduct)) return;

    const { postcode, depot } = readVisitorZip();
    if (!postcode) return;

    autoSwapped.current = true;
    void (async () => {
      // A stored depot is the common case and costs nothing: the visitor picked
      // a ZIP earlier and `selectResult` recorded which yard serves it.
      //
      // A ZIP that arrived only in the URL has no depot beside it — a shared
      // link, or a fresh browser — so it is geocoded once and matched to the
      // nearest yard, the same two steps `useGeoapify` takes when someone picks
      // a suggestion. Without this, a link with ?zipcode= on it would land on
      // the placeholder listing, which is half the point of the parameter.
      const nearest = depot || (await depotForPostcode(postcode));
      if (nearest) await swapToLocation(nearest);
    })();
  }, [activeProduct, swapToLocation]);

  const locationChange: LocationChangeStrategy = {
    mode: "swap",
    onChange: (location) => void swapToLocation(location),
    loading: swapping,
    notice: locationNotice,
  };

  if (!isContainerHit(product)) {
    return <AccessoryDetail product={product} />;
  }

  const containerVariant = resolveContainerVariant(activeProduct);

  return (
    <div className="bg-theme-bg text-theme-dark flex flex-col gap-[20px]">
      {/* Breadcrumb + product grid */}
      <ProductVariantShell
        relatedProducts={pool}
        activeProduct={activeProduct}
        onVariantChange={setActiveProduct}
        locationChange={locationChange}
      />

      {/* Phones only — the desktop sidebar already carries this. */}
      <MobileTrustSection />

      {/* BODY TABS */}
      <BodyTabsSection variant={containerVariant} product={activeProduct} />

      <section className="px-4 sm:px-[5%]">
        <div className="flex flex-col gap-[10px]">
          <h2 className="text-[16px] md:text-[24px] font-bold">Ideal for:</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[10px]">
            {IDEAL_FOR.map((item) => (
              <li
                key={item.id}
                className="relative aspect-square overflow-hidden rounded-[10px] bg-stone-200"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  // Six across on desktop, three on tablet, two on mobile —
                  // tells the browser how small these actually render, so it
                  // doesn't fetch a full-width image for a thumbnail.
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover"
                />
                {/* Gradient sits behind the caption so white text stays legible
                    whatever the photograph underneath happens to be. */}
                <div className="absolute right-[10px] bottom-[10px] bg-[#E7EDF9] px-2 py-1 border-[0.5px] border-[#A3A3A3] rounded-[5px] text-[10px] font-semibold leading-tight text-[#00318C]">
                  <div>{item.title}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>


      <ContainerResources product={activeProduct} />
      
      {/* Phones only — desktop keeps a call button in the sticky panel. */}
      <MobileSpecialistBanner />

      {/* NOTE: this renders four hardcoded containers with placeholder prices
          and "#" CTA links — see the TODO in YouMayAlsoNeed.tsx. The section
          directly above it lists the *real* related products for this depot,
          under the same "You May Also Need" title. Give this one its own
          heading, or wire it to relatedProducts, before it ships. */}
      <section className="px-4 sm:px-[5%]">
        <YouMayAlsoNeed />
      </section>

      {/* REVIEWS */}
      <CustomerReviewsSection />

      {/* <section id="reviews" className="px-4 sm:px-[5%] py-10 sm:py-16">
        No "Write a Review" entry point here on purpose — review submission
            is only exposed from Order History (delivered orders), per
            docs/reference/REVIEWS_FLOW.md's purchase-gating recommendation.
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6">Customer Reviews</h2>
        <CustomerReviews variant={containerVariant} />
        <ReviewsCarousel productId={activeProduct.product_id as string | number} />
      </section> */}

      {/* An explicit heading rather than the homepage's. The default comes from
          `quoteForm.h2` in the Content Editor, which is homepage copy — sharing
          it would mean editing the homepage silently rewrote this section too.
          This component is a Client Component, so it cannot resolve admin copy
          itself; if this heading should become editable, add its own key and
          pass it down from product/[slug]/page.tsx. */}
      <QuoteForm heading="Get a Free Quote on This Container" />

      {/* Same logo marquee the homepage runs, one component shared by both. */}
      <TrustedBySection />

      {/* FAQ */}
      <section className="px-4 sm:px-[5%]">
        <div className="flex items-baseline mb-6">
          <h2 className="text-[16px] md:text-[24px] font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>
        <FaqAccordion variant={containerVariant} />
      </section>
      <StatesSection heading={"Delivering Across All 50 States"} />
    </div>
  );
}
