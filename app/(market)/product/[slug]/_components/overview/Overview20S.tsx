import {
  Shield,
  Lock,
  CircleAlert,
  BrushCleaning,
  Cloud,
  Settings,
} from "lucide-react";
import { OverviewBody, type OverviewCopy } from "./OverviewBody";
import { OverviewChecklist } from "./OverviewChecklist";
import { UsedConditionGallery } from "./UsedConditionGallery";
import { combinationKey } from "@/lib/containerOverview";
import type { CombinationRegistry, OverviewProps } from "./types";

/**
 * The 20 ft overview, one component per condition and grade.
 *
 * Every combination has its own function so its copy can diverge without
 * touching the others. They all render the same body today — replace any one
 * of them with its own `OverviewCopy`, or its own markup entirely, when the
 * content for that combination is written.
 */

const DEFAULT_COPY: OverviewCopy = {
  heading: "20 FT Shipping Container for Sale Overview",
  intro: [
    "Our 20 ft shipping containers provide a cost-effective, durable solution for storage and shipping. Made from tough Corten steel, these containers are built to last and are fully inspected for door, floor, and seal functionality.",
  ],
  useCases: [
    "Residential Storage",
    "Construction Sites",
    "Farm & Agriculture",
    "Retail Overflow",
    "Workshop Space",
    "Event Storage",
    "Moving & Relocation",
    "Disaster Relief",
    "Military Storage",
    "Pop-up Retail",
  ],
  features: [
    {
      Icon: Shield,
      title: "Cor-Ten Steel Construction",
      desc: "Military-grade weathering steel resists corrosion and withstands extreme climates worldwide.",
    },
    {
      Icon: CircleAlert,
      title: "ISO Certified & CSC Plated",
      desc: "Meets international shipping standards. CSC safety approval plate included on cargo-worthy units.",
    },
    {
      Icon: Lock,
      title: "Lockbox Ready & Secure",
      desc: "Standard double cargo doors with lockrod system. Compatible with standard container padlocks.",
    },
    {
      Icon: Cloud,
      title: "100% Wind & Watertight",
      desc: "All used containers are inspected and certified wind & watertight before delivery to your site.",
    },
    {
      Icon: BrushCleaning,
      title: "Hardwood Timber Floor",
      desc: "Durable tropical hardwood floor supports forklifts up to 9,900 lbs. Easy to clean and replace.",
    },
    {
      Icon: Settings,
      title: "Modification Friendly",
      desc: "Add doors, windows, ventilation, insulation, shelving, or electrical. We offer custom modifications.",
    },
  ],
};

// ─── one per combination ──────────────────────────────────────────────────────

function UsedASIS() {
  return <OverviewBody copy={DEFAULT_COPY} />;
}

/**
 * Ordered top to bottom down the left column, then the right — the two columns
 * are CSS columns, so the array order is the reading order.
 */
const USED_WWT_CHECKS = [
  "Wind & water tight",
  "Original shipping markings",
  "Solid wood flooring",
  "Surface rust and dents may be present",
  "Working cargo doors",
  "Professionally inspected",
];

function UsedContainerLooksLike() {
  return (
    <div>
      <h2 className="text-[12px] lg:text-[24px] font-bold leading-[121%] tracking-[-0.22px] mt-5">
        See what a used container looks like:
      </h2>
      <p className="text-[12px] lg:text-[22px] leading-[121%] tracking-[-0.22px] font-light">
        Click images to see typical condition
      </p>
      <UsedConditionGallery />
    </div>
  );
}

function UsedWindandWaterTight() {
  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex gap-[20px]">
        <div className="w-full lg:w-[60%]">
          <h2 className="text-[18px] lg:text-[32px] font-bold leading-[121%] tracking-[-0.16px] uppercase">
            What is a used 20&apos; Wind and Water Tight Container?
          </h2>
          <p className="text-[14px] lg:text-[22px] font-light leading-[121%] tracking-[-0.28px] mt-5">
            A Wind &amp; Water Tight (WWT) container is used for storage and
            shipping. It is structurally sound, weather resistant, and ready for
            your job site, business, or storage needs.
          </p>
          <OverviewChecklist items={USED_WWT_CHECKS} />
        </div>
        <div className="hidden lg:block lg:w-[40%]">
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight mb-3.5">
            Ideal For
          </h3>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_COPY.useCases.map((useCase, index) => (
              <span
                key={`use-cases-${useCase}-${index}`}
                className="bg-theme-subtle border border-theme-border text-theme-accent px-3 py-1.5 rounded text-xs sm:text-sm font-semibold cursor-pointer hover:bg-theme-accent hover:text-white transition-colors"
              >
                {useCase}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="block lg:hidden">
        <UsedContainerLooksLike />
      </div>
      <div>
        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4">
          Key Features
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {DEFAULT_COPY.features.map((feature, index) => (
            <div
              key={`features-${feature.title}-${index}`}
              className="group flex gap-3.5 items-start p-4 sm:p-4.5 rounded-lg border border-theme-border bg-theme-subtle hover:border-theme-primary hover:-translate-y-0.5 transition-all"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-theme-primary-light flex items-center justify-center shrink-0 group-hover:bg-theme-primary transition-colors">
                <feature.Icon className="w-4.5 h-4.5 text-theme-primary group-hover:text-white transition-colors" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base mb-1">
                  {feature.title}
                </h4>
                <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden lg:block">
        <UsedContainerLooksLike />
      </div>
    </div>
  );
}

function UsedCargoWorthy() {
  return <OverviewBody copy={DEFAULT_COPY} />;
}

function UsedIICL() {
  return <OverviewBody copy={DEFAULT_COPY} />;
}

// Not stocked — New is only sold at IICL. Kept so the registry covers the
// whole matrix; nothing routes here today.
function NewASIS() {
  return <OverviewBody copy={DEFAULT_COPY} />;
}

// Not stocked — New is only sold at IICL. Kept so the registry covers the
// whole matrix; nothing routes here today.
function NewWindandWaterTight() {
  return <OverviewBody copy={DEFAULT_COPY} />;
}

// Not stocked — New is only sold at IICL. Kept so the registry covers the
// whole matrix; nothing routes here today.
function NewCargoWorthy() {
  return <OverviewBody copy={DEFAULT_COPY} />;
}

function NewIICL() {
  return <OverviewBody copy={DEFAULT_COPY} />;
}

/** Exhaustive by type: a missing combination fails to compile. */
const BY_COMBINATION: CombinationRegistry = {
  "Used|AS IS": UsedASIS,
  "Used|Wind and Water Tight": UsedWindandWaterTight,
  "Used|Cargo Worthy": UsedCargoWorthy,
  "Used|IICL": UsedIICL,
  "New|AS IS": NewASIS,
  "New|Wind and Water Tight": NewWindandWaterTight,
  "New|Cargo Worthy": NewCargoWorthy,
  "New|IICL": NewIICL,
};

export function Overview20S({ condition, grade }: OverviewProps) {
  const Combination = BY_COMBINATION[combinationKey(condition, grade)];
  return <Combination />;
}
