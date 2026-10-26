import { ChevronLeft, ChevronRight } from "lucide-react";
import { accessoryHref } from "@/lib/accessoryCatalog";
import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";
import type { AccessoryCatalogQuery } from "@/types/accessoryCatalog";

type Props = { query: AccessoryCatalogQuery; page: number; pageCount: number };

const BOX =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary";

/** Page links. Nothing renders when everything fits on one page. */
export function AccessoryPagination({ query, page, pageCount }: Props) {
  if (pageCount <= 1) return null;
  const href = (p: number) => accessoryHref({ ...query, page: p });
  const idle = "border-theme-border bg-white text-theme-dark hover:border-theme-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100";

  return (
    <nav aria-label="Pagination" className="mt-8">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {page > 1 && (
          <li>
            <Link href={href(page - 1)} className={`${BOX} ${idle}`} aria-label="Previous page">
              <ChevronLeft aria-hidden className="h-4 w-4" />
            </Link>
          </li>
        )}
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
          <li key={p}>
            <Link
              href={href(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
              className={`${BOX} ${p === page ? "border-theme-primary bg-theme-primary text-white" : idle}`}
            >
              {p}
            </Link>
          </li>
        ))}
        {page < pageCount && (
          <li>
            <Link href={href(page + 1)} className={`${BOX} ${idle}`} aria-label="Next page">
              <ChevronRight aria-hidden className="h-4 w-4" />
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
