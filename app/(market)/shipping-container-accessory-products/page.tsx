import { Suspense } from "react";
import { ROUTES } from "@/config/routes";
import { PAGE_SEO_DEFAULTS } from "@/config/pageSeoDefaults";
import { resolvePageMetadata } from "@/lib/seo";
import { breadcrumbNode, graph, itemListNode, siteNodes, webPageNode } from "@/lib/schema";
import { ACCESSORY_RESULTS_ID } from "@/lib/accessoryCatalog";
import { getAccessoryHighlights } from "@/services/accessoryCatalog.service";
import { JsonLd } from "@/components/shared/JsonLd";
import { PageHeadScripts } from "@/components/shared/PageHeadScripts";
import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";
import { AccessoryHero } from "./_components/AccessoryHero";
import { CategoryTiles } from "./_components/CategoryTiles";
import { AccessoryInstantSearch } from "./_components/AccessoryInstantSearch";
import { ResultsSkeleton } from "./_components/ResultsSkeleton";

const PAGE_NAME = "Shipping Container Accessories";

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.ACCESSORY_PRODUCTS);
}

/**
 * Shipping container accessories — a native page since 2026-10-26, replacing
 * the WordPress page at the same URL, whose product grid and filters were a
 * plugin that did not work once the page was served by this app.
 *
 * Static apart from the product search, which is InstantSearch in the browser
 * (search, category / price / availability filters, sort, pagination) over
 * POST /api/search. Its state lives in the URL, so a filtered view can be
 * shared and the category tiles link straight to one. The first page of
 * products is also rendered on the server — in the ItemList structured data
 * and a no-JavaScript list — so crawlers see the catalogue without running
 * the search.
 */
export default async function AccessoryProductsPage() {
  const highlights = await getAccessoryHighlights();
  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({
      path: ROUTES.ACCESSORY_PRODUCTS,
      name: PAGE_NAME,
      description: PAGE_SEO_DEFAULTS[ROUTES.ACCESSORY_PRODUCTS]?.description,
    }),
    breadcrumbNode([{ name: "Home", path: ROUTES.HOME }, { name: PAGE_NAME }]),
    itemListNode(highlights, PAGE_NAME),
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={ROUTES.ACCESSORY_PRODUCTS} />
      <AccessoryHero title={PAGE_NAME} />
      <CategoryTiles />
      <section
        id={ACCESSORY_RESULTS_ID}
        aria-labelledby="accessories-heading"
        className="scroll-mt-4 bg-theme-subtle px-4 py-12 sm:px-[5%] dark:bg-neutral-950"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="accessories-heading"
            className="mb-6 text-2xl font-extrabold text-theme-dark sm:text-3xl dark:text-gray-100"
          >
            All accessories
          </h2>
          <Suspense fallback={<ResultsSkeleton />}>
            <AccessoryInstantSearch />
          </Suspense>
          {highlights.length > 0 && (
            <noscript>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {highlights.map((product) => (
                  <li key={product.handle}>
                    <Link href={ROUTES.PRODUCT(product.handle)} className="underline underline-offset-2">
                      {product.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </noscript>
          )}
        </div>
      </section>
    </>
  );
}
