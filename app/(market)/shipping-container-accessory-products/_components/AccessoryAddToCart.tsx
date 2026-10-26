"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { ACCESSORY_MAX_QUANTITY, accessoryCartItem } from "@/lib/accessoryCatalog";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import type { ShippingContainerHit } from "@/types/product";

type Props = { hit: ShippingContainerHit; title: string };

/**
 * Quantity and "Add to cart", side by side. Adds through the cart context like
 * the product page does, so the usual "added to cart" confirmation opens; the
 * button also says "Added" for a moment, and the quantity goes back to 1.
 */
export function AccessoryAddToCart({ hit, title }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    // Above the card's stretched title link, so these controls get the clicks.
    <div className="relative z-10 mt-1 flex items-stretch gap-2">
      <QuantityStepper value={quantity} onChange={setQuantity} max={ACCESSORY_MAX_QUANTITY} label={`Quantity of ${title}`} />
      <button
        type="button"
        onClick={() => {
          addItem(accessoryCartItem(hit, quantity));
          setAdded(true);
          setQuantity(1);
        }}
        className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-md bg-theme-primary px-3 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900"
      >
        {added ? <Check aria-hidden className="h-4 w-4 shrink-0" /> : <ShoppingCart aria-hidden className="h-4 w-4 shrink-0" />}
        <span className="truncate">{added ? "Added" : "Add to cart"}</span>
      </button>
      <span role="status" className="sr-only">
        {added ? `${title} added to cart` : ""}
      </span>
    </div>
  );
}
