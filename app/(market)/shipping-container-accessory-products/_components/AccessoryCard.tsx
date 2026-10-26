import Image from "next/image";
import { Package } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { formatMoney } from "@/lib/formatters";
import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";
import type { AccessoryCardData } from "@/types/accessoryCatalog";

type Props = { item: AccessoryCardData };

/**
 * One product: photo, category, title, price, stock and a link to its page.
 * The title's link stretches over the whole card (after:inset-0), so the card
 * is one target and the "View details" label is not a second link to the same
 * place.
 */
export function AccessoryCard({ item }: Props) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-theme-border bg-white transition-colors hover:border-theme-primary dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-red-400">
      <div className="relative flex aspect-video items-center justify-center bg-theme-subtle sm:aspect-4/3 dark:bg-neutral-800">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-contain p-3"
          />
        ) : (
          <Package aria-hidden className="h-12 w-12 text-theme-muted dark:text-gray-500" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {item.category && (
          <p className="text-xs font-bold uppercase tracking-wide text-theme-muted dark:text-gray-400">{item.category}</p>
        )}
        <h3 className="line-clamp-3 text-base font-bold leading-snug text-theme-dark dark:text-gray-100">
          <Link
            href={ROUTES.PRODUCT(item.handle)}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-theme-primary"
          >
            {item.title}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <p className="text-lg font-extrabold text-theme-dark dark:text-gray-100">{formatMoney(item.price)}</p>
          {/* Only a known quantity is shown: most accessories carry none, and
              "out of stock" would be a guess. */}
          {item.inStock && <p className="text-sm font-semibold text-green-700 dark:text-green-400">In stock</p>}
        </div>
        <span
          aria-hidden
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-theme-primary px-4 text-sm font-bold text-white transition-colors group-hover:bg-theme-primary-dark"
        >
          View details
        </span>
      </div>
    </article>
  );
}
