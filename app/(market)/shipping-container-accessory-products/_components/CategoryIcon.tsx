import { Layers, Lightbulb, Package, Shield, Truck, Wrench } from "lucide-react";
import type { AccessoryCategoryKey } from "@/types/accessoryCatalog";

const ICONS = {
  security: Shield,
  lighting: Lightbulb,
  shelving: Layers,
  ramps: Truck,
  parts: Wrench,
  others: Package,
} satisfies Record<AccessoryCategoryKey, unknown>;

type Props = { category: AccessoryCategoryKey; className?: string };

/** The category's icon. Decorative: the category name is always shown beside it. */
export function CategoryIcon({ category, className }: Props) {
  const Icon = ICONS[category];
  return <Icon aria-hidden className={className} />;
}
