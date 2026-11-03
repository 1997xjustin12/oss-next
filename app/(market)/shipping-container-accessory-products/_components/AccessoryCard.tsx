import Image from "next/image";
import { Package } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { formatMoney } from "@/lib/formatters";
import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";
import { AccessoryAddToCart } from "./AccessoryAddToCart";
import type { AccessoryCardData } from "@/types/accessoryCatalog";
import type { ShippingContainerHit } from "@/types/product";

type Props = {
  item: AccessoryCardData;
  /** The search hit, added to the cart as-is (the backend cart sync needs it). */
  hit: ShippingContainerHit;
};

/**
 * One product: photo, best-seller tag, category, title, price, then quantity
 * and "Add to cart". The title's link stretches over the whole card
 * (after:inset-0), so clicking anywhere else on the card opens the product
 * page; the cart controls sit above it.
 */
export function AccessoryCard({ item, hit }: Props) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-theme-border bg-white transition-colors hover:border-theme-primary dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-red-400">
      <div className="relative flex aspect-video items-center justify-center bg-theme-subtle sm:aspect-4/3 dark:bg-neutral-800">
        {item.bestSeller && (
          <span className="pointer-events-none absolute top-0 left-0 z-10 rounded-br-md bg-theme-primary px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
            Best Seller
          </span>
        )}
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
        <p className="mt-auto pt-2 text-lg font-extrabold text-theme-dark dark:text-gray-100">{formatMoney(item.price)}</p>
        <AccessoryAddToCart hit={hit} title={item.title} />
      </div>
    </article>
  );
}
