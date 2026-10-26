import { Suspense } from "react";
import type { Metadata } from "next";
import { ROUTES } from "@/config/routes";
import { PAGE_SEO_DEFAULTS } from "@/config/pageSeoDefaults";
import { resolvePageMetadata } from "@/lib/seo";
import { breadcrumbNode, graph, siteNodes, webPageNode } from "@/lib/schema";
import { ACCESSORY_RESULTS_ID } from "@/lib/accessoryCatalog";
import { JsonLd } from "@/components/shared/JsonLd";
import { PageHeadScripts } from "@/components/shared/PageHeadScripts";
import { AccessoryHero } from "./_components/AccessoryHero";
import { CategoryTiles } from "./_components/CategoryTiles";
import { AccessoryResults } from "./_components/AccessoryResults";
import { ResultsSkeleton } from "./_components/ResultsSkeleton";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const PAGE_NAME = "Shipping Container Accessories";

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await resolvePageMetadata(ROUTES.ACCESSORY_PRODUCTS);
  // TEMPORARY: the products are placeholder data (lib/data/accessoryCatalogDemo.ts),
  // so the page stays out of search results. Remove this line when the real
  // catalogue is wired into getAccessoryCatalog().
  return { ...metadata, robots: { index: false, follow: true } };
}

/**
 * Shipping container accessories — a native page since 2026-10-26, replacing
 * the WordPress page at the same URL, whose product grid and filters were a
 * plugin that did not work once the page was served by this app.
 *
 * Everything but the results is static. The results read the URL (filters,
 * search, sort, page), so they sit behind Suspense and render on the server:
 * filters are plain links and the search is a GET form, so the page works
 * without JavaScript and every filtered view has a real URL. The only client
 * code is the sort dropdown's auto-submit.
 */
export default function AccessoryProductsPage({ searchParams }: Props) {
  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({
      path: ROUTES.ACCESSORY_PRODUCTS,
      name: PAGE_NAME,
      description: PAGE_SEO_DEFAULTS[ROUTES.ACCESSORY_PRODUCTS]?.description,
    }),
    breadcrumbNode([{ name: "Home", path: ROUTES.HOME }, { name: PAGE_NAME }]),
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
            <AccessoryResults searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
