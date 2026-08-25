"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Shield,
  CheckCircle2,
  Truck,
  Headphones,
  Heart,
  Printer,
  ShoppingCart,
  ClipboardList,
  Phone,
  Info,
} from "lucide-react";
import type { ProductHit } from "@/types/product";
import { useAddContainerToCart } from "@/hooks/useAddContainerToCart";
import { useWishlist } from "@/hooks/useWishlist";
import {
  getCustomFieldValue,
  isGenericDisplayHit,
  isInStockHit,
} from "@/lib/pricing";
import { DEFAULT_LOCATION } from "@/lib/constants";
import { normaliseRating } from "@/lib/ratings";
import { CartLocationConflictModal } from "@/components/cart/CartLocationConflictModal";
import { Stars } from "@/components/product/Stars";
import { DeliveryZipCheck } from "./DeliveryZipCheck";
import { ShareButton } from "@/components/product/ShareButton";
import { CONTACT_NUMBER } from "@/lib/helpers";
import Link from "next/link";
import { formatPrice } from "@/lib/formatters";

// ─── option layer types ───────────────────────────────────────────────────────

type PriceTab = "buy" | "rent" | "rto";

type Selection = {
  tab: PriceTab;
  sizeIdx: number;
  condIdx: number;
  gradeIdx: number;
  rentTerm: string;
  rtoTerm: string;
};

type OptionEntry = {
  key: string;
  label: string;
  sublabel?: string;
  /**
   * Already formatted for display, including any "/mo" — rendered beside the
   * label in the size row. Absent when no variant backs this option, so the
   * column stays empty rather than showing a price that isn't real.
   */
  price?: string;
  active: boolean;
  available: boolean;
  onSelect: () => void;
};

type OptionsGroup = {
  id: string;
  title: string;
  layout: "grid-4" | "grid-3" | "grid-2" | "flex";
  /** Explanatory text for the group. Renders an info icon when set. */
  info?: string;
  options: OptionEntry[];
};

/**
 * The info icon beside a group title, carrying its explanation.
 *
 * A native `title` gives the hover tooltip for free, and `aria-label` plus
 * `tabIndex` make the same text reachable by keyboard and screen reader —
 * an icon whose meaning only appears on mouse hover is invisible to everyone
 * else. Swap in a styled popover later if the design calls for one; the text
 * already lives on the group object either way.
 */
function InfoHint({ text }: { text: string }) {
  return (
    <span
      tabIndex={0}
      title={text}
      aria-label={text}
      className="inline-flex shrink-0 cursor-help align-middle text-theme-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40 rounded-full"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6.4165 6.12504H6.49984C6.77598 6.12504 6.99984 6.3489 6.99984 6.62504V8.54171C6.99984 8.81785 7.2237 9.04171 7.49984 9.04171H7.58317M6.99984 4.95837H7.00568"
          stroke="#222222"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.8102 11.5958C8.41372 11.4894 8.99038 11.2651 9.50724 10.9359C10.0241 10.6066 10.471 10.1787 10.8225 9.67673C11.1741 9.17473 11.4232 8.6084 11.5559 8.01009C11.6885 7.41178 11.702 6.79321 11.5956 6.18968C11.4892 5.58616 11.2649 5.0095 10.9357 4.49264C10.6064 3.97578 10.1785 3.52884 9.67653 3.17733C9.17452 2.82582 8.6082 2.57663 8.00989 2.44399C7.41158 2.31135 6.793 2.29785 6.18948 2.40427C5.58595 2.51069 5.0093 2.73494 4.49244 3.06421C3.97558 3.39349 3.52863 3.82135 3.17713 4.32335C2.82562 4.82536 2.57643 5.39168 2.44379 5.98999C2.31115 6.5883 2.29765 7.20688 2.40407 7.8104C2.51049 8.41393 2.73473 8.99058 3.06401 9.50744C3.39329 10.0243 3.82114 10.4712 4.32315 10.8228C4.82515 11.1743 5.39148 11.4234 5.98979 11.5561C6.5881 11.6887 7.20667 11.7022 7.8102 11.5958L7.8102 11.5958Z"
          stroke="#7E869E"
          strokeOpacity="0.25"
        />
      </svg>
    </span>
  );
}

// ─── CTA icons ────────────────────────────────────────────────────────────────
//
// Inline rather than from lucide-react because these are the design's own
// drawings. All three are decorative: each sits next to its button's text
// label, so `aria-hidden` keeps a screen reader from announcing them twice.
//
// Note the camelCase attributes. `stroke-width`, `stroke-linecap` and
// `stroke-linejoin` are invalid DOM properties that React warns about at
// runtime while TypeScript stays silent — the same trap the other SVGs in this
// file hit.

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 4H5.62563C6.193 4 6.47669 4 6.70214 4.12433C6.79511 4.17561 6.87933 4.24136 6.95162 4.31912C7.12692 4.50769 7.19573 4.7829 7.33333 5.33333L7.51493 6.05972C7.616 6.46402 7.66654 6.66617 7.74455 6.83576C8.01534 7.42449 8.5546 7.84553 9.19144 7.96546C9.37488 8 9.58326 8 10 8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 17H7.55091C7.40471 17 7.33162 17 7.27616 16.9938C6.68857 16.928 6.28605 16.3695 6.40945 15.7913C6.42109 15.7367 6.44421 15.6674 6.49044 15.5287C6.54177 15.3747 6.56743 15.2977 6.59579 15.2298C6.88607 14.5342 7.54277 14.0608 8.29448 14.0054C8.3679 14 8.44906 14 8.61137 14H14"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5279 14H10.9743C9.75838 14 9.15042 14 8.68147 13.7246C8.48343 13.6083 8.30689 13.4588 8.15961 13.2825C7.81087 12.8652 7.71092 12.2655 7.51103 11.0662C7.30849 9.85093 7.20722 9.2433 7.44763 8.79324C7.54799 8.60536 7.68722 8.44101 7.85604 8.31113C8.26045 8 8.87646 8 10.1085 8H16.7639C18.2143 8 18.9395 8 19.2326 8.47427C19.5257 8.94854 19.2014 9.59717 18.5528 10.8944L18.1056 11.7889C17.5677 12.8647 17.2987 13.4026 16.8154 13.7013C16.3321 14 15.7307 14 14.5279 14Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="17" cy="20" r="1" fill="white" />
      <circle cx="9" cy="20" r="1" fill="white" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg width="13" height="16" viewBox="0 0 13 16" fill="none" aria-hidden="true">
      <path
        d="M1 4.6C1 3.33988 1 2.70982 1.24524 2.22852C1.46095 1.80516 1.80516 1.46095 2.22852 1.24524C2.70982 1 3.33988 1 4.6 1H7.9C9.16015 1 9.79015 1 10.2715 1.24524C10.6949 1.46095 11.0391 1.80516 11.2548 2.22852C11.5 2.70982 11.5 3.33988 11.5 4.6V14.5L6.25 11.5L1 14.5V4.6Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
      <path
        d="M10.1336 9.44073L11.6542 11.5077C11.9487 11.908 11.863 12.4713 11.4626 12.7658C9.29838 14.358 6.29269 14.1165 4.41043 12.1991L4.3007 12.0874C2.88088 10.6411 1.67382 9.00034 0.715752 7.21436L0.641711 7.07634C-0.628409 4.70865 0.0357438 1.76733 2.20001 0.175136C2.60032 -0.119363 3.16358 -0.033586 3.45807 0.366725L4.97872 2.43373C5.30599 2.87859 5.21067 3.50454 4.7658 3.83182L3.32341 4.89295C3.05461 5.0907 2.94251 5.43826 3.04511 5.7558C3.63821 7.59142 4.81068 9.18515 6.38654 10.2978C6.65914 10.4903 7.02431 10.4867 7.29311 10.289L8.7355 9.22782C9.18037 8.90054 9.80632 8.99587 10.1336 9.44073Z"
        fill="white"
      />
    </svg>
  );
}

/** Digits only — `tel:` should not carry the display formatting. */
const CONTACT_TEL = `tel:${CONTACT_NUMBER.replace(/[^\d+]/g, "")}`;

/**
 * Upper bound on the quantity stepper.
 *
 * Not a stock limit — the cart has none — just a guard so holding the "+" key
 * can't run the subtotal into nonsense. Anyone genuinely buying more than this
 * is talking to sales, not clicking a stepper.
 */
const MAX_QUANTITY = 99;

// ─── static option definitions ────────────────────────────────────────────────

const sizes = [
  {
    name: "20' Standard",
    sizeKey: "20",
    highCube: false,
    desc: "160 sq ft · Most popular",
  },
  {
    name: "40' Standard",
    sizeKey: "40",
    highCube: false,
    desc: "320 sq ft · Double the space",
  },
  {
    name: "40' High Cube",
    sizeKey: "40",
    highCube: true,
    desc: "344 sq ft · Extra 1ft height",
  },
];

const conditions = [
  { name: "Used", desc: "Inspected & weather-tight · Best value" },
  { name: "New", desc: "One-trip · Like new condition" },
];

const grades = [
  { name: "AS IS", gradeKey: "AS IS", desc: "No certification · Sold as-is" },
  {
    name: "Wind & Water Tight",
    gradeKey: "Wind",
    desc: "Weather-sealed · Structurally sound",
  },
  {
    name: "Cargo Worthy",
    gradeKey: "Cargo",
    desc: "IICL certified · Ship-ready",
  },
  { name: "IICL", gradeKey: "IICL", desc: "Premium grade · Highest standard" },
];

/**
 * Selection type — how the container is picked at the depot.
 *
 * One entry on purpose. The catalogue's `selectionoptions` field does carry
 * "Exclusive Pool (EP)" and "You Pick (UP)", but between them they cover 10 of
 * 10,528 products, so offering all three showed one live button beside two
 * permanently disabled ones. This states the fulfilment method instead of
 * pretending it is a choice.
 *
 * Nothing reads the field any more, so a product that is genuinely EP or UP
 * will still display "First Off the Stack". If those ever become real
 * inventory, this needs to read `selectionoptions` again — and note that 9,981
 * of its values begin with a zero-width space (U+200B) and the same option is
 * spelled both "First off the Stack" and "First of the Stack", so match on the
 * bracketed code rather than the name.
 */
const selectionTypes = [
  {
    name: "First Off the Stack",
    key: "FO",
    desc: "Whichever unit is on top · Fastest",
  },
];

const RENT_TERMS = [
  { value: "12", label: "12 Months" },
  { value: "6", label: "6 Months" },
  { value: "3", label: "3 Months" },
];

const RTO_TERMS = [
  { value: "48", label: "48 Months" },
  { value: "36", label: "36 Months" },
  { value: "24", label: "24 Months" },
  { value: "12", label: "12 Months" },
];

const trustBadges = [
  { Icon: Shield, label: "Satisfaction Guaranteed" },
  { Icon: CheckCircle2, label: "No Hidden Fees" },
  { Icon: Truck, label: "Fast Nationwide Delivery" },
  { Icon: Headphones, label: "Expert Phone Support" },
];

// ─── index helpers ────────────────────────────────────────────────────────────

function sizeToIndex(size: string, height?: string): number {
  const s = size.toLowerCase();
  const h = (height ?? "").toLowerCase();
  if (
    s.includes("40") &&
    (h.includes("high") ||
      h.includes("hc") ||
      s.includes("high") ||
      s.includes("hc"))
  )
    return 2;
  if (s.includes("40")) return 1;
  return 0;
}

// Condition is its own field — never infer it from grade
function conditionToIndex(condition: string): number {
  const c = (condition ?? "").toLowerCase();
  return c.includes("new") || c.includes("one") || c.includes("trip") ? 1 : 0;
}

function gradeToGradeIndex(grade: string): number {
  const g = grade.toLowerCase();
  if (g.includes("iicl")) return 3;
  if (g.includes("cargo")) return 2;
  if (g.includes("wind") || g.includes("wwt") || g.includes("water")) return 1;
  return 0;
}

// ─── match predicates ─────────────────────────────────────────────────────────

function matchesSize(p: ProductHit, i: number): boolean {
  const entry = sizes[i];
  if (!entry) return false;
  const h = getCustomFieldValue(p, "height").toLowerCase();
  const isHC = h.includes("high") || h.includes("hc");
  const num = getCustomFieldValue(p, "length_width").match(/\d+/)?.[0] ?? "";
  return num === entry.sizeKey && isHC === entry.highCube;
}

function matchesCondition(p: ProductHit, i: number): boolean {
  const cond = conditions[i]?.name;
  const pc = getCustomFieldValue(p, "condition").toLowerCase();
  if (cond === "New")
    return pc.includes("new") || pc.includes("one") || pc.includes("trip");
  return !pc.includes("new") && !pc.includes("trip");
}

function matchesGrade(p: ProductHit, i: number): boolean {
  const entry = grades[i];
  if (!entry) return false;
  const pg = getCustomFieldValue(p, "grade").toLowerCase();
  const gk = entry.gradeKey.toLowerCase();
  if (gk === "as is")
    return pg.includes("as is") || pg.includes("as-is") || pg === "";
  if (gk === "wind")
    return pg.includes("wind") || pg.includes("wwt") || pg.includes("water");
  if (gk === "cargo") return pg.includes("cargo");
  if (gk === "iicl") return pg.includes("iicl");
  return false;
}

// custom_fields stores payment_term as a stringified list literal, e.g.
// "['12']" — pull out the first number rather than an exact string match.
function termMatch(v: ProductHit, termValue: string): boolean {
  return getCustomFieldValue(v, "payment_term").match(/\d+/)?.[0] === termValue;
}

function findBestMatch(
  pool: ProductHit[],
  sizeIdx: number,
  condIdx: number,
  gradeIdx: number,
): ProductHit | undefined {
  return (
    pool.find(
      (p) =>
        matchesSize(p, sizeIdx) &&
        matchesCondition(p, condIdx) &&
        matchesGrade(p, gradeIdx),
    ) ??
    pool.find((p) => matchesSize(p, sizeIdx) && matchesCondition(p, condIdx)) ??
    pool.find((p) => matchesSize(p, sizeIdx)) ??
    pool[0]
  );
}

// Prevents downstream dimensions from being left on a now-unavailable option
// when an upstream dimension changes (e.g. size → condition becomes invalid,
// or condition → grade becomes invalid). Runs before setSelection so the first
// click always lands in a consistent state.
function clampSelection(next: Selection, pool: ProductHit[]): Selection {
  // sizeIdx is the upstream dimension here — only the two downstream of it
  // get clamped, so it never gets reassigned.
  const { sizeIdx } = next;
  let { condIdx, gradeIdx } = next;

  const condValid = pool.some(
    (p) => matchesSize(p, sizeIdx) && matchesCondition(p, condIdx),
  );
  if (!condValid) {
    condIdx = conditions.findIndex((_, i) =>
      pool.some((p) => matchesSize(p, sizeIdx) && matchesCondition(p, i)),
    );
    if (condIdx === -1) condIdx = 0;
  }

  const gradeValid = pool.some(
    (p) =>
      matchesSize(p, sizeIdx) &&
      matchesCondition(p, condIdx) &&
      matchesGrade(p, gradeIdx),
  );
  if (!gradeValid) {
    gradeIdx = grades.findIndex((_, i) =>
      pool.some(
        (p) =>
          matchesSize(p, sizeIdx) &&
          matchesCondition(p, condIdx) &&
          matchesGrade(p, i),
      ),
    );
    if (gradeIdx === -1) gradeIdx = 0;
  }

  return { ...next, condIdx, gradeIdx };
}

// ─── option button ────────────────────────────────────────────────────────────

function OptionBtn({
  entry,
  className = "",
  group,
}: {
  entry: OptionEntry;
  className?: string;
  group?: string;
}) {
  return (
    <button
      type="button"
      disabled={!entry.available}
      onClick={entry.onSelect}
      className={`text-left border rounded-lg p-3 transition-all ${className} ${
        !entry.available
          ? "opacity-35 cursor-not-allowed border-theme-border bg-theme-bg"
          : entry.active
            ? "rounded-[5px] bg-[#474747] border-stone-500 shadow-[0_0_0_1px_rgba(71,71,71,0.10),inset_-2px_0_0_0_rgba(255,255,255,0.20),inset_2px_0_0_0_rgba(255,255,255,0.20),inset_0_4px_0_-1px_rgba(255,255,255,0.20),inset_0_-2px_0_1px_rgba(0,0,0,0.20),inset_0_0_0_0.5px_rgba(0,0,0,0.15)]"
            : "rounded-[5px] border-stone-500 bg-[#F5F5F5] shadow-[0_0_0_1px_#F5F5F5,inset_-2px_0_0_0_rgba(255,255,255,0.20),inset_2px_0_0_0_rgba(255,255,255,0.20),inset_0_2px_0_0_rgba(255,255,255,0.20),inset_0_-2px_0_0_rgba(0,0,0,0.05),inset_0_0_0_0.5px_rgba(0,0,0,0.15)]"
      }`}
    >
      {group !== "size" && (
        <span
          className={`flex items-center justify-center font-extrabold text-sm ${entry.active && entry.available ? "text-white" : "text-theme-dark"}`}
        >
          {entry.label}
        </span>
      )}
      {group === "size" && (
        <div className="flex items-center justify-between gap-[20px]">
          <span
            className={`flex items-center justify-center font-extrabold text-sm ${entry.active && entry.available ? "text-white" : "text-theme-dark"}`}
          >
            {entry.label}
          </span>
          <span
            className={`flex items-center justify-even font-extrabold text-sm whitespace-nowrap ${entry.active && entry.available ? "text-[#F4BF3C]" : "text-theme-dark"}`}
          >
            {entry.price}
          </span>
        </div>
      )}
    </button>
  );
}

// ─── component ────────────────────────────────────────────────────────────────

type Props = {
  product: ProductHit;
  categoryLabel: string;
  relatedProducts: ProductHit[];
  onVariantChange?: (product: ProductHit) => void;
};

export function ProductInfoPanel({
  product,
  categoryLabel,
  relatedProducts,
  onVariantChange,
}: Props) {
  const {
    conflict: locationConflict,
    clearConflict: clearLocationConflict,
    addContainerToCart,
    clearCart,
  } = useAddContainerToCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  // The currently matched product — starts as the page product, updates on every option change
  const [activeProduct, setActiveProduct] = useState<ProductHit>(product);

  const [selection, setSelection] = useState<Selection>(() => ({
    tab:
      getCustomFieldValue(product, "payment_type") === "rental"
        ? "rent"
        : (getCustomFieldValue(product, "payment_type") as PriceTab) || "buy",
    sizeIdx: sizeToIndex(
      getCustomFieldValue(product, "length_width"),
      getCustomFieldValue(product, "height"),
    ),
    condIdx: conditionToIndex(getCustomFieldValue(product, "condition")),
    gradeIdx: gradeToGradeIndex(getCustomFieldValue(product, "grade")),
    rentTerm: RENT_TERMS[0].value,
    rtoTerm: RTO_TERMS[0].value,
  }));

  const [added, setAdded] = useState(false);

  /**
   * How many units the CTA will add.
   *
   * Deliberately not reset when the variant changes: someone who has decided
   * they want three of something is still asking for three after switching to
   * the high-cube version, and silently dropping back to one is the kind of
   * change nobody notices until the wrong order arrives.
   */
  const [quantity, setQuantity] = useState(1);

  // When the shell swaps to a different product, reset both states
  useEffect(() => {
    setActiveProduct(product);
    setSelection((prev) => ({
      ...prev,
      tab:
        getCustomFieldValue(product, "payment_type") === "rental"
          ? "rent"
          : (getCustomFieldValue(product, "payment_type") as PriceTab) || "buy",
      sizeIdx: sizeToIndex(
        getCustomFieldValue(product, "length_width"),
        getCustomFieldValue(product, "height"),
      ),
      condIdx: conditionToIndex(getCustomFieldValue(product, "condition")),
      gradeIdx: gradeToGradeIndex(getCustomFieldValue(product, "grade")),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.objectID]);

  // ── derived pools ───────────────────────────────────────────────────────────

  const rentVariants = useMemo(
    () =>
      relatedProducts.filter(
        (p) => getCustomFieldValue(p, "payment_type") === "rental",
      ),
    [relatedProducts],
  );
  const rtoVariants = useMemo(
    () =>
      relatedProducts.filter(
        (p) => getCustomFieldValue(p, "payment_type") === "rto",
      ),
    [relatedProducts],
  );
  const candidates = useMemo(() => {
    const type = selection.tab === "rent" ? "rental" : selection.tab;
    return relatedProducts.filter(
      (p) => getCustomFieldValue(p, "payment_type") === type,
    );
  }, [selection.tab, relatedProducts]);

  // ── cascading availability ──────────────────────────────────────────────────

  const availableSizes = useMemo(
    () => sizes.map((_, i) => candidates.some((p) => matchesSize(p, i))),
    [candidates],
  );

  /**
   * The price to show on each size button.
   *
   * Prefers the variant matching the condition and grade already selected, so
   * the figure is what switching to that size would actually cost. When the
   * current combination doesn't exist in that size, it falls back to the
   * cheapest variant of the size rather than showing nothing — the button is
   * still selectable, and an empty price next to an enabled control reads as a
   * bug.
   *
   * Rental and rent-to-own prices are monthly, so they carry "/mo". A bare
   * figure here would be the same ambiguity that makes a $232 40-footer look
   * like a purchase price.
   */
  const sizePrices = useMemo(
    () =>
      sizes.map((_, i) => {
        const ofSize = candidates.filter((p) => matchesSize(p, i));
        if (ofSize.length === 0) return undefined;

        const exact = ofSize.find(
          (p) =>
            matchesCondition(p, selection.condIdx) &&
            matchesGrade(p, selection.gradeIdx),
        );
        const chosen =
          exact ??
          ofSize.reduce((cheapest, p) =>
            p.sale_price < cheapest.sale_price ? p : cheapest,
          );

        const amount = formatPrice(chosen.sale_price);
        if (!amount) return undefined;

        const monthly = selection.tab === "rent" || selection.tab === "rto";
        return `$${amount}${monthly ? "/mo" : ""}`;
      }),
    [candidates, selection.condIdx, selection.gradeIdx, selection.tab],
  );

  const availableConditions = useMemo(
    () =>
      conditions.map((_, i) =>
        candidates.some(
          (p) => matchesSize(p, selection.sizeIdx) && matchesCondition(p, i),
        ),
      ),
    [candidates, selection.sizeIdx],
  );

  const availableGrades = useMemo(
    () =>
      grades.map((_, i) =>
        candidates.some(
          (p) =>
            matchesSize(p, selection.sizeIdx) &&
            matchesCondition(p, selection.condIdx) &&
            matchesGrade(p, i),
        ),
      ),
    [candidates, selection.sizeIdx, selection.condIdx],
  );

  const rentTermOptions = useMemo(
    () =>
      RENT_TERMS.map((term) => ({
        ...term,
        available: rentVariants.some((v) => termMatch(v, term.value)),
        variant:
          rentVariants.find(
            (v) =>
              termMatch(v, term.value) && matchesSize(v, selection.sizeIdx),
          ) ?? rentVariants.find((v) => termMatch(v, term.value)),
      })),
    [rentVariants, selection.sizeIdx],
  );

  const rtoTermOptions = useMemo(
    () =>
      RTO_TERMS.map((term) => ({
        ...term,
        available: rtoVariants.some((v) => termMatch(v, term.value)),
        variant:
          rtoVariants.find(
            (v) =>
              termMatch(v, term.value) && matchesSize(v, selection.sizeIdx),
          ) ?? rtoVariants.find((v) => termMatch(v, term.value)),
      })),
    [rtoVariants, selection.sizeIdx],
  );

  // ── unified handler ─────────────────────────────────────────────────────────

  const handleSelect = useCallback(
    (patch: Partial<Selection>) => {
      const type = ({ ...selection, ...patch } as Selection).tab;
      const poolType = type === "rent" ? "rental" : type;
      const pool = relatedProducts.filter(
        (p) => getCustomFieldValue(p, "payment_type") === poolType,
      );

      // Clamp before setting state — keeps downstream dimensions valid on the first click
      const next = clampSelection({ ...selection, ...patch }, pool);
      setSelection(next);

      let match: ProductHit | undefined;

      if (next.tab === "rent") {
        match =
          pool.find(
            (v) =>
              termMatch(v, next.rentTerm) &&
              matchesSize(v, next.sizeIdx) &&
              matchesCondition(v, next.condIdx),
          ) ??
          pool.find(
            (v) => termMatch(v, next.rentTerm) && matchesSize(v, next.sizeIdx),
          ) ??
          pool.find((v) => termMatch(v, next.rentTerm)) ??
          pool[0];
      } else if (next.tab === "rto") {
        match =
          pool.find(
            (v) =>
              termMatch(v, next.rtoTerm) &&
              matchesSize(v, next.sizeIdx) &&
              matchesCondition(v, next.condIdx),
          ) ??
          pool.find(
            (v) => termMatch(v, next.rtoTerm) && matchesSize(v, next.sizeIdx),
          ) ??
          pool.find((v) => termMatch(v, next.rtoTerm)) ??
          pool[0];
      } else {
        match = findBestMatch(pool, next.sizeIdx, next.condIdx, next.gradeIdx);
      }

      if (match) {
        setActiveProduct(match);
        onVariantChange?.(match);
      }
    },
    [selection, relatedProducts, onVariantChange],
  );

  // ── product options object ──────────────────────────────────────────────────
  // Regenerates on every selection change. Each group describes one row of UI:
  // which buttons to render, which are active, which are disabled, and the callback.

  const productOptions = useMemo((): OptionsGroup[] => {
    const groups: OptionsGroup[] = [];

    groups.push({
      id: "size",
      title: "Size",
      layout: "grid-3",
      info: "External length, plus interior height. High Cube adds roughly one foot of headroom over Standard.",
      options: sizes.map((s, i) => ({
        key: s.name,
        label: s.name,
        sublabel: s.desc,
        price: sizePrices[i],
        active: selection.sizeIdx === i,
        available: availableSizes[i],
        onSelect: () => handleSelect({ sizeIdx: i }),
      })),
    });

    if (selection.tab === "buy" || selection.tab === "rto") {
      groups.push({
        id: "condition",
        title: "Condition",
        layout: "grid-3",
        info: "New containers are one-trip — a single voyage from the factory. Used containers are inspected and weather-tight.",
        options: conditions.map((c, i) => ({
          key: c.name,
          label: c.name,
          sublabel: c.desc,
          active: selection.condIdx === i,
          available: availableConditions[i],
          onSelect: () => handleSelect({ condIdx: i }),
        })),
      });

      groups.push({
        id: "grade",
        title: "Grade",
        layout: "grid-4",
        info: "Certification level, from AS IS (no certification) up to IICL (the highest standard).",
        options: grades.map((g, i) => ({
          key: g.name,
          label: g.name,
          sublabel: g.desc,
          active: selection.gradeIdx === i,
          available: availableGrades[i],
          onSelect: () => handleSelect({ gradeIdx: i }),
        })),
      });

      // groups.push({
      groups.push({
        id: "selection_type",
        title: "Selection Type",
        layout: "grid-3",
        info: "How your container is picked at the depot — you get the next available unit matching the specification you chose above.",
        // Display only. Every container we sell is First Off the Stack, so this
        // states the fulfilment method rather than offering a choice: always
        // shown as selected, never disabled, and clicking it does nothing.
        // It is deliberately outside the size/condition/grade cascade — nothing
        // here narrows which variant is chosen.
        options: selectionTypes.map((t) => ({
          key: t.key,
          label: t.name,
          sublabel: t.desc,
          active: true,
          available: true,
          onSelect: () => {},
        })),
      });
    }

    if (selection.tab === "rent") {
      groups.push({
        id: "rentTerm",
        title: "Select Payment Term",
        layout: "flex",
        info: "How long the rental agreement runs. Longer terms lower the monthly payment.",
        options: rentTermOptions.map((term) => ({
          key: term.value,
          label: term.label,
          sublabel: term.variant ? `$${term.variant.sale_price}/mo` : undefined,
          active: selection.rentTerm === term.value,
          available: term.available,
          onSelect: () => handleSelect({ rentTerm: term.value }),
        })),
      });
    }

    if (selection.tab === "rto") {
      groups.push({
        id: "rtoTerm",
        title: "Select Payment Term",
        layout: "flex",
        info: "How long the rent-to-own agreement runs. Longer terms lower the monthly payment but raise the total paid.",
        options: rtoTermOptions.map((term) => ({
          key: term.value,
          label: term.label,
          sublabel: term.variant ? `$${term.variant.sale_price}/mo` : undefined,
          active: selection.rtoTerm === term.value,
          available: term.available,
          onSelect: () => handleSelect({ rtoTerm: term.value }),
        })),
      });
    }

    return groups;
  }, [
    selection,
    availableSizes,
    sizePrices,
    availableConditions,
    availableGrades,
    rentTermOptions,
    rtoTermOptions,
    handleSelect,
  ]);

  // ── price display ───────────────────────────────────────────────────────────

  const priceDisplay = useMemo(
    () => ({
      price: `$${formatPrice(activeProduct.sale_price)}`,
      suffix: selection.tab === "buy" ? "" : "/mo",
      note: {
        buy: "Additional delivery fee based on your location - Sales tax may apply",
        rent: "Delivery & pickup included · Flexible terms",
        rto: "Own it at end of term · No credit check required",
      }[selection.tab],
    }),
    [activeProduct.sale_price, selection.tab],
  );

  /**
   * Unit price × quantity, already formatted.
   *
   * Rounded in whole cents rather than multiplied straight: 232.14 × 3 is
   * 696.4200000000001 in binary floating point, and formatPrice would round it
   * to two decimals anyway — doing it here keeps the number that reaches the
   * cart and the number on screen identical.
   *
   * Keeps priceDisplay's suffix, so three rentals read as "$696.42/mo" rather
   * than looking like a one-off total.
   */
  const subtotal = useMemo(() => {
    const total = Math.round(activeProduct.sale_price * quantity * 100) / 100;
    return `$${formatPrice(total)}`;
  }, [activeProduct.sale_price, quantity]);

  const { value: rating, count: reviewCount } = normaliseRating(
    product.ratings,
  );

  // Generic Product Page / "Various North America" listings are template
  // pages with no real depot behind them — not meant to be purchasable.
  // Hide Add to Cart in favor of the Quote/Call CTAs below, which stay
  // visible either way.
  const isGenericDisplay = isGenericDisplayHit(activeProduct);
  const inStock = isInStockHit(activeProduct);

  function handleAddToCart() {
    if (isGenericDisplay) return; // belt-and-suspenders — the button is hidden for these

    const orderType =
      selection.tab === "rent"
        ? `Rental · ${selection.rentTerm} Months`
        : selection.tab === "rto"
          ? `Rent-to-Own · ${selection.rtoTerm} Months`
          : "Purchase";

    const wasAdded = addContainerToCart({
      id: activeProduct.objectID,
      name: activeProduct.title,
      price: activeProduct.sale_price,
      quantity,
      sku: activeProduct.variants?.[0]?.sku,
      size:
        sizes[selection.sizeIdx]?.name ??
        getCustomFieldValue(activeProduct, "length_width"),
      condition: getCustomFieldValue(activeProduct, "condition"),
      orderType,
      image: activeProduct.images?.[0]?.src,
      isContainer: true,
      location: getCustomFieldValue(activeProduct, "location"),
      rawHit: activeProduct,
    });
    if (!wasAdded) return; // blocked by a different-location container already in the cart

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleToggleWishlist() {
    toggleWishlist({
      id: activeProduct.objectID,
      handle: activeProduct.handle,
      name: activeProduct.title,
      price: activeProduct.sale_price,
      image: activeProduct.images?.[0]?.src,
      addedAt: new Date().toISOString(),
    });
  }

  // ── render ──────────────────────────────────────────────────────────────────

  const layoutClass: Record<OptionsGroup["layout"], string> = {
    "grid-4": "grid grid-cols-4 gap-2",
    "grid-3": "grid grid-cols-3 gap-2",
    "grid-2": "grid grid-cols-2 gap-2",
    flex: "flex flex-wrap gap-2",
  };

  return (
    <div className="w-full">
      {/* Category label */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[18px] font-bold uppercase text-theme-primary">
          {product?.loc_title}
        </span>
        <span className="flex-1 h-px bg-theme-primary-light" />
      </div>

      <h1 className="text-[45px] leading-11.5 mb-2 font-anton line-clamp-4">
        {product.title}
      </h1>

      <div className="flex flex-wrap gap-[15px]">
        <div className="font-extrabold text-[22px]">{product?.size_title}</div>
        <div className="text-[#A3A3A3] text-[14px] underline self-baseline-last">
          Other size available
        </div>
      </div>

      <p className="text-[14px] text-[#A3A3A3] mb-3">
        SKU: {product.variants?.[0]?.sku}
      </p>

      <div className="flex items-center gap-2 mb-5 text-[20px]">
        <span>{rating.toFixed(1)}</span>
        <Stars count={Math.round(rating)} />
        <a href="#reviews" className="underline">
          {reviewCount > 0 && `(${reviewCount})`}
        </a>
      </div>

      <div className="flex flex-col">
        <div className="flex gap-[20px]">
          {/* Price display — driven by activeProduct */}
          <div className="flex flex-col gap-0">
            <div className="uppercase text-[12px]">Price Starts At</div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-[52px] font-anton  font-normal">
                {priceDisplay.price}
              </p>
              {priceDisplay.suffix && (
                <span className="text-lg text-theme-muted">
                  {priceDisplay.suffix}
                </span>
              )}
            </div>
          </div>
          {/* Delivery ZIP */}
          <DeliveryZipCheck product={activeProduct} />
        </div>
        <p className="text-xs text-theme-muted">{priceDisplay.note}</p>

        <div className="flex gap-[5px]">
          <Link
            className="text-[14px] text-[#279ED4] font-bold"
            prefetch={false}
            href={`tel:${CONTACT_NUMBER}`}
          >
            Found it Cheaper? {CONTACT_NUMBER}
          </Link>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            aria-hidden="true"
          >
            <g clipPath="url(#clip0_651_2828)">
              <path
                d="M4.95435 4.91487C5.04686 4.6298 5.21633 4.3761 5.44417 4.18139C5.67201 3.98667 5.94956 3.85871 6.24556 3.81175C6.54157 3.76479 6.84462 3.80055 7.12154 3.91518C7.39846 4.02981 7.63829 4.2189 7.81449 4.46134C7.9907 4.70378 8.09623 4.99014 8.11978 5.28892C8.14334 5.5877 8.08375 5.88726 7.94771 6.15432C7.81166 6.42137 7.60466 6.64543 7.34912 6.80204C7.09358 6.95865 6.79971 7.04154 6.5 7.04154V7.58346M6.5 11.375C3.80761 11.375 1.625 9.19239 1.625 6.5C1.625 3.80761 3.80761 1.625 6.5 1.625C9.19239 1.625 11.375 3.80761 11.375 6.5C11.375 9.19239 9.19239 11.375 6.5 11.375ZM6.52698 9.20833V9.2625L6.47302 9.26261V9.20833H6.52698Z"
                stroke="#279ED4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_651_2828">
                <rect width="13" height="13" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>

      {/* Availability */}
      {/* {inStock ? (
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-md px-4 py-2.5 mb-5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
          <span className="text-sm font-bold text-emerald-700">In Stock — Ready to Ship</span>
          <span className="text-xs text-emerald-600/80 ml-auto hidden sm:inline">Delivers in 1–5 business days</span>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 bg-theme-subtle border border-theme-border rounded-md px-4 py-2.5 mb-5">
          <span className="w-2.5 h-2.5 rounded-full bg-theme-muted shrink-0" />
          <span className="text-sm font-bold text-theme-dark-2">Out of Stock</span>
          <span className="text-xs text-theme-muted ml-auto hidden sm:inline">Call for availability</span>
        </div>
      )} */}

      {/* Price tabs */}
      <div className="grid grid-cols-3 rounded-t-md overflow-hidden mt-2">
        {(["buy", "rent", "rto"] as PriceTab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSelect({ tab: key })}
            className={`py-[16px] px-[48px] text-center rounded-[5px] transition-colors
              ${selection.tab === key ? "bg-theme-primary text-white shadow-[inset_0_2px_2px_0_#BD112A,inset_0_-4px_4px_0_rgba(0,0,0,0.30),inset_0_3px_2px_0_rgba(255,255,255,0.50),0_4px_15px_0_rgba(0,0,0,0.15)]" : "mx-[1px] my-[3px] rounded-[2px] bg-[#D9D9D9] shadow-[inset_0_2px_2px_0_#D9D9D9,inset_0_-2px_6px_0_rgba(0,0,0,0.20),inset_0_2px_2px_0_rgba(255,255,255,0.50),0_4px_15px_0_rgba(0,0,0,0.15)]"}`}
          >
            <span className="block font-bold text-sm">
              {key === "buy"
                ? "Purchase"
                : key === "rent"
                  ? "Rent"
                  : "Rent-to-Own"}
            </span>
            <span className="block text-[10px] opacity-75 mt-0.5">
              {key === "buy"
                ? "Call For Best Pricing "
                : key === "rent"
                  ? "as low as $96 a month"
                  : "as low as $61.36 a month"}
            </span>
          </button>
        ))}
      </div>

      <div className="text-[#474747] text-[14px] font-bold mt-4 mb-2">
        Select Container Specifications
      </div>

      {/* Option groups — generated from productOptions */}
      {productOptions.map((group) => (
        <div key={group.id} className="mb-5">
          <p className="text-[12px] font-bold tracking-wide mb-2 flex items-center gap-1">
            <span>
              {group.title}:{" "}
              {/* The option currently chosen in this group. Read off `active`
                  rather than tracked separately, so it can never disagree with
                  which button is highlighted. */}
              <span className="font-normal text-theme-muted">
                {group.options.find((o) => o.active)?.label ?? "—"}
              </span>
            </span>
            {group.info && <InfoHint text={group.info} />}
          </p>
          <div className={layoutClass[group.layout]}>
            {group.options.map((entry) => (
              <OptionBtn
                key={entry.key}
                group={group.id}
                entry={entry}
                className={group.layout === "flex" ? "flex-1 min-w-27.5" : ""}
              />
            ))}
          </div>
        </div>
      ))}

      {/* SUMMARY */}
      <div className="border-t-[3px] border-t-theme-primary">
        <div className="bg-[#F4F4F4] text-[14px] font-semibold py-2">
          Selected Container Summary
        </div>
        <ul className="text-[14px] py-3">
          {/* All three read activeProduct, not product: `product` is whatever
              the page loaded with, so the summary would keep describing that
              variant while the buttons above changed the selection. */}
          <li className="flex justify-between">
            <div className="font-light">Unit</div>
            <div>{activeProduct.desc_title || activeProduct.title}</div>
          </li>
          <li className="flex justify-between">
            <div className="font-light">Condition</div>
            <div>
              {[
                getCustomFieldValue(activeProduct, "condition"),
                getCustomFieldValue(activeProduct, "grade"),
              ]
                .filter(Boolean)
                .join(" · ") || "—"}
            </div>
          </li>
          <li className="flex justify-between">
            <div className="font-light">Unit Price</div>
            {/* Carries the /mo suffix for rent and rent-to-own — the figure is
                a monthly payment there, and a bare amount reads as the price of
                the container. */}
            <div>
              {priceDisplay.price}
              {priceDisplay.suffix}
            </div>
          </li>
          <li className="flex justify-between">
            <div className="font-light">Delivery</div>
            <div className="font-thin">Calculated at Checkout</div>
          </li>
          <li className="flex justify-between">
            <div className="font-light">Sales Tax</div>
            <div className="font-thin">Calculated at Checkout</div>
          </li>
        </ul>
      </div>

      {/* NEW CTA */}
      <div className="bg-[#0F3A59] rounded-bl-[30px] rounded-br-[30px] py-[10px] px-[30px]">
        <div className="flex justify-between">
          {/* quantity */}
          <div>
            <div className="text-left text-[#E7EDF9] text-[12px]">Quantity</div>
            <div className="bg-[#E7EDF9]/20 flex items-center justify-between rounded-[3px] p-1 w-[73px] h-[23px] mt-[6px]">
              {/* Real buttons, not divs: a div is unreachable by keyboard and
                  invisible to assistive tech, and these change what gets
                  ordered. */}
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="text-center bg-[#E7EDF9]/30 w-[18px] h-[18px] rounded-[3px] flex items-center justify-center text-white border-[0.5px] border-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                -
              </button>
              <div aria-live="polite" className="text-center text-white font-light">
                {quantity}
              </div>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
                disabled={quantity >= MAX_QUANTITY}
                aria-label="Increase quantity"
                className="text-center bg-[#E7EDF9]/30 w-[18px] h-[18px] rounded-[3px] flex items-center justify-center text-white border-[0.5px] border-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>
          {/* subtotal */}
          <div>
            <div className="text-right text-[#E7EDF9] text-[12px]">Subtotal</div>
            <div className="text-right text-[22px] font-semibold text-white">
              {subtotal}
              {priceDisplay.suffix}
            </div>
          </div>
        </div>
        <div className="px-[20px] pt-[10px] flex flex-col gap-[10px]">
              {/* Disabled for reference-only listings (no real depot behind
                  them) and for out-of-stock units — the same two guards
                  handleAddToCart re-checks for itself. */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isGenericDisplay || !inStock}
                className="w-full font-semibold text-[14px] rounded-[10px] bg-[#BD112A] shadow-[inset_0_2px_2px_0_#BD112A,inset_0_-4px_4px_0_rgba(0,0,0,0.30),inset_0_3px_2px_0_rgba(255,255,255,0.50),0_4px_15px_0_rgba(0,0,0,0.15)] flex h-[34px] items-center justify-center gap-2 text-[14px] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CartIcon />
                {added
                  ? "Added to cart"
                  : !inStock
                    ? "Out of stock"
                    : "Add to cart"}
              </button>
              <div className="flex items-center gap-[20px]">
                <button
                  type="button"
                  className="w-full text-[12px] font-semibold h-[34px] text-white rounded-[10px] border border-white bg-[#0F3A59] shadow-[inset_0_-4px_4px_0_rgba(0,0,0,0.30),inset_0_3px_2.9px_0_rgba(255,255,255,0.20),0_4px_14.8px_0_rgba(0,0,0,0.21)] flex items-center justify-center gap-2"
                >
                  <QuoteIcon />
                  Save Quote
                </button>
                {/* A link, not a button: this dials rather than acting on the
                    page, so it belongs in the browser's normal navigation
                    affordances — long-press to copy, right-click, and the
                    keyboard behaviour a link already has. */}
                <Link
                  href={CONTACT_TEL}
                  aria-label={`Call ${CONTACT_NUMBER} for expert help`}
                  className="w-full text-[12px] font-semibold h-[34px] text-white rounded-[10px] border border-white bg-[#0F3A59] shadow-[inset_0_-4px_4px_0_rgba(0,0,0,0.30),inset_0_3px_2.9px_0_rgba(255,255,255,0.20),0_4px_14.8px_0_rgba(0,0,0,0.21)] flex items-center justify-center gap-2"
                >
                  <PhoneIcon />
                  Get expert help
                </Link>
              </div>
              <div className="text-center text-[#F6F9FF] font-extralight text-[12px]">Price locked for 48 hrs when you save this quote</div>
        </div>
      </div>

      {/* CTAs */}
      {/* <div className="flex flex-col gap-2.5 mb-5">
        {isGenericDisplay ? (
          <div className="w-full flex items-start gap-2 rounded-md border border-theme-border bg-theme-subtle px-4 py-3 text-sm text-theme-mid">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-theme-muted" />
            <span>
              This is a general reference listing — pricing and availability
              vary by location. Request a quote or call us for real-time
              details.
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-3.5 rounded-md text-lg sm:text-xl font-extrabold text-white bg-theme-primary hover:bg-theme-primary-dark hover:-translate-y-0.5 active:translate-y-0 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {added ? (
              <>✓ Added to Cart!</>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" /> Add to Cart — $
                {activeProduct.sale_price}
              </>
            )}
          </button>
        )}
        <Link
          prefetch={false}
          href="/shipping-container-quote/"
          className="w-full py-3 rounded-md text-base sm:text-lg font-bold border-2 border-theme-border hover:border-theme-primary hover:text-theme-primary transition-colors flex items-center justify-center gap-2"
        >
          <ClipboardList className="w-4.5 h-4.5" /> Request a Free Quote
        </Link>
        <Link
          prefetch={false}
          href={`tel:${CONTACT_NUMBER}`}
          className="w-full py-3 rounded-md text-base sm:text-lg font-bold text-white bg-theme-dark hover:bg-black transition-colors flex items-center justify-center gap-2"
        >
          <Phone className="w-4.5 h-4.5" /> Call {CONTACT_NUMBER} — Talk to an
          Expert
        </Link>
      </div> */}

      {/* Trust badges */}
      {/* <div className="flex flex-wrap gap-2 mb-5">
        {trustBadges.map((b) => (
          <span
            key={b.label}
            className="flex items-center gap-1.5 text-xs text-theme-muted bg-theme-subtle border border-theme-border rounded px-2.5 py-1.5 hover:border-theme-primary hover:text-theme-primary transition-colors"
          >
            <b.Icon className="w-3.5 h-3.5" /> {b.label}
          </span>
        ))}
      </div> */}

      {/* Actions row */}
      {/* <div className="flex items-center gap-4 sm:gap-5 pt-3.5 border-t border-theme-border text-xs text-theme-muted flex-wrap">
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`flex items-center gap-1.5 transition-colors ${
            isWishlisted(activeProduct.objectID)
              ? "text-theme-primary"
              : "hover:text-theme-primary"
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 ${isWishlisted(activeProduct.objectID) ? "fill-current" : ""}`}
          />
          {isWishlisted(activeProduct.objectID)
            ? "Saved to Wishlist"
            : "Save to Wishlist"}
        </button>
        <ShareButton title={activeProduct.title} />
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 hover:text-theme-primary transition-colors"
        >
          <Printer className="w-3.5 h-3.5" /> Print Spec Sheet
        </button>
      </div> */}

      {locationConflict && (
        <CartLocationConflictModal
          open={true}
          onClose={clearLocationConflict}
          currentLocation={locationConflict.currentLocation}
          newLocation={locationConflict.newLocation}
          onClearCart={clearCart}
        />
      )}
    </div>
  );
}
