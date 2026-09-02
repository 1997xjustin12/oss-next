import { Shield, CheckCircle2, Lock, Layers } from 'lucide-react'
import { OverviewBody, type OverviewCopy } from './OverviewBody'
import { combinationKey } from '@/lib/containerOverview'
import type { CombinationRegistry, OverviewProps } from './types'

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
    { Icon: Shield, title: "Material", desc: "High-strength Corten steel." },
    { Icon: Layers, title: "Flooring", desc: "Marine-grade plywood over steel cross members." },
    { Icon: Lock, title: "Security", desc: "Heavy-duty cargo doors with secure locking bars." },
    { Icon: CheckCircle2, title: "Inspection", desc: "Fully inspected for operational doors, seals, and floors." },
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

export function Overview20S({ condition, grade }: OverviewProps) {
  const Combination = BY_COMBINATION[combinationKey(condition, grade)]
  return <Combination />
}
