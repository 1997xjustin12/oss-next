import Image from "next/image";
import { ROUTES } from "@/config/routes";
import { ACCESSORY_CATEGORIES } from "@/lib/accessoryCatalog";
import { formatMoney } from "@/lib/formatters";
import { CONTACT_NUMBER, telHref } from "@/lib/helpers";
import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";
import { CategoryIcon } from "./CategoryIcon";
import type { AccessoryListing } from "@/types/accessoryCatalog";

type Props = { item: AccessoryListing };

const CTA =
  "mt-auto inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2";

/**
 * One product. With a real product (it has a handle) the title and button lead
 * to its page; the placeholder products have none, so the button calls instead
 * of linking to a page that does not exist.
 */
export function AccessoryCard({ item }: Props) {
  const category = ACCESSORY_CATEGORIES.find((c) => c.key === item.category)?.label;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-theme-border bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="relative flex aspect-video items-center sm:aspect-4/3 justify-center bg-theme-subtle dark:bg-neutral-800">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />
        ) : (
          <CategoryIcon category={item.category} className="h-12 w-12 text-theme-muted dark:text-gray-500" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-theme-muted dark:text-gray-400">{category}</p>
        <h3 className="text-base font-bold leading-snug text-theme-dark dark:text-gray-100">
          {item.handle ? (
            <Link href={ROUTES.PRODUCT(item.handle)} className="hover:underline">
              {item.title}
            </Link>
          ) : (
            item.title
          )}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <p className="text-lg font-extrabold text-theme-dark dark:text-gray-100">{formatMoney(item.price)}</p>
          <p
            className={
              item.inStock
                ? "text-sm font-semibold text-green-700 dark:text-green-400"
                : "text-sm font-semibold text-theme-muted dark:text-gray-400"
            }
          >
            {item.inStock ? "In stock" : "Out of stock"}
          </p>
        </div>

        {item.handle ? (
          <Link href={ROUTES.PRODUCT(item.handle)} className={`${CTA} bg-theme-primary text-white hover:bg-theme-primary-dark`}>
            View details
          </Link>
        ) : (
          <a
            href={telHref(CONTACT_NUMBER)}
            aria-label={`Call to order: ${item.title}`}
            className={`${CTA} border border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-400 dark:hover:text-neutral-950`}
          >
            Call to order
          </a>
        )}
      </div>
    </article>
  );
}
