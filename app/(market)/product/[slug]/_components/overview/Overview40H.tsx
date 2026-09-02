import { Shield, CheckCircle2, Lock, CloudRain, Layers, DollarSign } from 'lucide-react'
import { OverviewBody, type OverviewCopy } from './OverviewBody'
import { combinationKey } from '@/lib/containerOverview'
import type { CombinationRegistry, OverviewProps } from './types'

/**
 * The 40 ft high cube overview, one component per condition and grade.
 *
 * Every combination has its own function so its copy can diverge without
 * touching the others. They all render the same body today — replace any one
 * of them with its own `OverviewCopy`, or its own markup entirely, when the
 * content for that combination is written.
 */

const DEFAULT_COPY: OverviewCopy = {
  heading: "40 FT Shipping Container for Sale Overview",
  intro: [
    "Our 40 ft shipping containers for sale provide maximum storage capacity at the lowest cost per square foot, making them one of the most cost-effective storage solutions available. Constructed from durable Corten steel, these containers are built to withstand harsh weather conditions and are wind and watertight, keeping your contents safe, secure, and dry.",
    "With their large size and wide availability, 40-foot shipping containers are ideal for commercial storage, construction sites, equipment storage, and long-term use. Each container is fully inspected to ensure reliable door operation, floor integrity, and weather-tight seals.",
  ],
  useCases: [
    "Bulk & Palletized Storage",
    "Tall Equipment Storage",
    "Workshop Conversions",
    "Business Storage",
    "Distribution Staging",
    "Container Home Builds",
    "Insulated Retrofits",
    "Wholesale Storage",
    "Retail Pop-up",
    "Farm & Agriculture",
  ],
  features: [
    { Icon: Shield, title: "Material", desc: "High-strength Corten steel shipping container." },
    { Icon: Layers, title: "Flooring", desc: "Marine-grade plywood over steel cross members." },
    { Icon: CloudRain, title: "Weather Protection", desc: "Wind- and watertight storage container." },
    { Icon: Lock, title: "Security", desc: "Heavy-duty cargo doors with secure locking bars." },
    { Icon: DollarSign, title: "Cost Efficiency", desc: "Lowest cost per square foot of any shipping container size." },
    { Icon: CheckCircle2, title: "Inspection", desc: "Fully inspected doors, floors, and seals." },
  ],
}

// ─── one per combination ──────────────────────────────────────────────────────

function UsedASIS() {
  return <OverviewBody copy={DEFAULT_COPY} />
}

function UsedWindandWaterTight() {
  return <OverviewBody copy={DEFAULT_COPY} />
}

function UsedCargoWorthy() {
  return <OverviewBody copy={DEFAULT_COPY} />
}

function UsedIICL() {
  return <OverviewBody copy={DEFAULT_COPY} />
}

// Not stocked — New is only sold at IICL. Kept so the registry covers the
// whole matrix; nothing routes here today.
function NewASIS() {
  return <OverviewBody copy={DEFAULT_COPY} />
}

// Not stocked — New is only sold at IICL. Kept so the registry covers the
// whole matrix; nothing routes here today.
function NewWindandWaterTight() {
  return <OverviewBody copy={DEFAULT_COPY} />
}

// Not stocked — New is only sold at IICL. Kept so the registry covers the
// whole matrix; nothing routes here today.
function NewCargoWorthy() {
  return <OverviewBody copy={DEFAULT_COPY} />
}

function NewIICL() {
  return <OverviewBody copy={DEFAULT_COPY} />
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
}

export function Overview40H({ condition, grade }: OverviewProps) {
  const Combination = BY_COMBINATION[combinationKey(condition, grade)]
  return <Combination />
}
