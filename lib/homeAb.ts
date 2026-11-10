/**
 * The homepage A/B test's own analytics: what the browser reports, how it is
 * checked, and how it becomes Redis counters. Pure (no I/O, no DOM at import),
 * so the tracker, the API route, the admin heatmap and the tests share it.
 *
 * ## What is measured, per variant and day
 *
 * - views (split desktop / mobile), unique visitors, engaged views (a click,
 *   or a scroll past a quarter of the page);
 * - how far down people get: views that reached 25 / 50 / 75 / 100 % of the page;
 * - clicks, and which link or button was clicked (`c:<region>:<label>`);
 * - form submits (`f:<label>`): the conversions;
 * - a click heatmap (see HEAT_GRID).
 *
 * ## Why counters, not events
 *
 * Nothing per visit is stored: every report is a sum, so each view adds to a
 * few hash fields and the storage does not grow with traffic. Keys are per day
 * (a date range is a sum of days) and expire after RETENTION_DAYS. Writing
 * services: lib/homeAbStore.ts.
 *
 * ## The heatmap grid
 *
 * The three variants are one URL, the page reflows with the window, and only
 * the hero differs, so a click is stored relative to the page section it landed
 * in (the n-th visible child of <main>, see homeSections), on a HEAT_GRID ×
 * HEAT_GRID grid of that section. The admin draws the same grid over the same
 * sections of a live copy of the page, so the map lines up at any width. Desktop
 * and mobile are kept apart: their layouts differ.
 */

import { HOME_VARIANTS, type HomeVariant } from '@/config/homeAb'

export { HOME_VARIANTS, type HomeVariant }

/** Cells per side of a section's heat grid (2 % each). */
export const HEAT_GRID = 50
/** Sections of <main> that are counted. The homepage has about ten. */
export const MAX_SECTIONS = 30
/** Clicks one report may carry; the tracker sends early when it reaches this. */
export const MAX_CLICKS_PER_REPORT = 40
export const MAX_SUBMITS_PER_REPORT = 5
export const SCROLL_MARKS = [25, 50, 75, 100] as const
export type ScrollMark = (typeof SCROLL_MARKS)[number]
/** Below this width a view counts as mobile: the homepage's lg breakpoint, where the hero's layout changes. */
export const DESKTOP_MIN_WIDTH = 1024
export const RETENTION_DAYS = 90

export type Device = 'd' | 'm'
/** Where a click happened: the site header, the page, or the footer. */
export type Region = 'h' | 'm' | 'f'

/**
 * One report from the tracker. Short keys: it is sent with sendBeacon on every
 * homepage view. A view sends one at first, then only what is new.
 */
export type HomeAbReport = {
  /** The variant shown. */
  v: HomeVariant
  d: Device
  /** A random id kept in this browser, for unique visitors. Absent if storage is blocked. */
  id?: string
  /** 1 on the view's first report: counts the view. */
  n?: 1
  /** 1 on the report in which the view first engaged. */
  e?: 1
  /** Scroll marks first reached since the last report. */
  s?: ScrollMark[]
  /** Clicks: [region, label | '', section | -1, x, y]; section -1 is outside <main> (no heat). */
  c?: [Region, string, number, number, number][]
  /** Forms submitted: their labels. */
  f?: string[]
}

const isInt = (n: unknown, min: number, max: number): n is number => Number.isInteger(n) && (n as number) >= min && (n as number) <= max

/**
 * A click or form label, as stored: a path on this site ("/cart"), a scheme
 * ("tel"), a host, or a button's text. Anything else is refused, which also
 * keeps arbitrary strings from a forged report out of the field names.
 */
export function cleanLabel(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const s = raw.replace(/\s+/g, ' ').trim()
  if (!s || s.length > 60) return null
  return /^[\w ./:'&?,()$+#%=-]+$/u.test(s) ? s : null
}

/** A report, checked field by field; null if it is not one. Unknown or bad entries are dropped, not trusted. */
export function parseHomeAbReport(raw: unknown): HomeAbReport | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const r = raw as Record<string, unknown>
  if (!(HOME_VARIANTS as readonly unknown[]).includes(r.v)) return null
  if (r.d !== 'd' && r.d !== 'm') return null

  const out: HomeAbReport = { v: r.v as HomeVariant, d: r.d }
  if (typeof r.id === 'string' && /^[A-Za-z0-9]{8,32}$/.test(r.id)) out.id = r.id
  if (r.n === 1) out.n = 1
  if (r.e === 1) out.e = 1
  if (Array.isArray(r.s)) {
    const marks = [...new Set(r.s.filter((m): m is ScrollMark => (SCROLL_MARKS as readonly unknown[]).includes(m)))]
    if (marks.length) out.s = marks
  }
  if (Array.isArray(r.c)) {
    const clicks = r.c.slice(0, MAX_CLICKS_PER_REPORT).flatMap((c): HomeAbReport['c'] & object => {
      if (!Array.isArray(c) || c.length !== 5) return []
      const [region, label, section, x, y] = c
      if (region !== 'h' && region !== 'm' && region !== 'f') return []
      const name = label === '' ? '' : cleanLabel(label)
      if (name === null) return []
      if (!isInt(section, -1, MAX_SECTIONS - 1) || !isInt(x, 0, HEAT_GRID - 1) || !isInt(y, 0, HEAT_GRID - 1)) return []
      return [[region, name, section, x, y]]
    })
    if (clicks.length) out.c = clicks
  }
  if (Array.isArray(r.f)) {
    const forms = r.f.slice(0, MAX_SUBMITS_PER_REPORT).map(cleanLabel).filter((f): f is string => !!f)
    if (forms.length) out.f = forms
  }
  return out
}

/** The counter increments a report makes: the day's stats hash, and its heat hash. */
export function reportIncrements(report: HomeAbReport): { stats: Map<string, number>; heat: Map<string, number> } {
  const stats = new Map<string, number>()
  const heat = new Map<string, number>()
  const add = (map: Map<string, number>, field: string) => map.set(field, (map.get(field) ?? 0) + 1)

  if (report.n) {
    add(stats, 'views')
    add(stats, `views:${report.d}`)
  }
  if (report.e) add(stats, 'engaged')
  for (const mark of report.s ?? []) add(stats, `s${mark}`)
  for (const [region, label, section, x, y] of report.c ?? []) {
    add(stats, 'clicks')
    if (label) add(stats, `c:${region}:${label}`)
    if (section >= 0) add(heat, `${section}:${x}:${y}`)
  }
  for (const form of report.f ?? []) add(stats, `f:${form}`)
  return { stats, heat }
}

/**
 * The sections a click is placed in: the visible element children of <main>.
 * The tracker and the admin heatmap both call this on the same page, so a
 * section's number means the same thing on both sides.
 */
export function homeSections(doc: Document): HTMLElement[] {
  const main = doc.querySelector('main')
  if (!main) return []
  return (Array.from(main.children) as HTMLElement[])
    .filter((el) => el.getBoundingClientRect().height > 0)
    .slice(0, MAX_SECTIONS)
}

// ─── Reading ────────────────────────────────────────────────────────────────

/** One variant's totals over a date range, from its stats hashes summed. */
export type HomeAbTotals = {
  views: number
  viewsDesktop: number
  viewsMobile: number
  visitors: number
  engaged: number
  scroll: Record<ScrollMark, number>
  clicks: number
  /** `<region>:<label>` -> clicks. */
  targets: Record<string, number>
  /** form label -> submits. */
  submits: Record<string, number>
}

export function emptyTotals(): HomeAbTotals {
  return { views: 0, viewsDesktop: 0, viewsMobile: 0, visitors: 0, engaged: 0, scroll: { 25: 0, 50: 0, 75: 0, 100: 0 }, clicks: 0, targets: {}, submits: {} }
}

/** Add one day's stats hash (as Redis returns it) to the totals. */
export function addStatsHash(totals: HomeAbTotals, hash: Record<string, unknown> | null): HomeAbTotals {
  for (const [field, raw] of Object.entries(hash ?? {})) {
    const n = Number(raw) || 0
    if (field === 'views') totals.views += n
    else if (field === 'views:d') totals.viewsDesktop += n
    else if (field === 'views:m') totals.viewsMobile += n
    else if (field === 'engaged') totals.engaged += n
    else if (field === 'clicks') totals.clicks += n
    else if (/^s(25|50|75|100)$/.test(field)) totals.scroll[Number(field.slice(1)) as ScrollMark] += n
    else if (field.startsWith('c:')) totals.targets[field.slice(2)] = (totals.targets[field.slice(2)] ?? 0) + n
    else if (field.startsWith('f:')) totals.submits[field.slice(2)] = (totals.submits[field.slice(2)] ?? 0) + n
  }
  return totals
}

/** Add one day's heat hash to a `section:x:y` -> clicks map. */
export function addHeatHash(cells: Record<string, number>, hash: Record<string, unknown> | null): Record<string, number> {
  for (const [field, raw] of Object.entries(hash ?? {})) {
    if (/^\d+:\d+:\d+$/.test(field)) cells[field] = (cells[field] ?? 0) + (Number(raw) || 0)
  }
  return cells
}

/**
 * Is variant B's rate different from the control's? A two-proportion z-test,
 * two-sided, at 95 %. Says "too early" until both sides have enough views for
 * the test to mean something.
 */
export function compareRates(control: { hits: number; total: number }, variant: { hits: number; total: number }): 'better' | 'worse' | 'no clear difference' | 'too early' {
  const MIN_VIEWS = 100
  if (control.total < MIN_VIEWS || variant.total < MIN_VIEWS) return 'too early'
  const p1 = control.hits / control.total
  const p2 = variant.hits / variant.total
  const pooled = (control.hits + variant.hits) / (control.total + variant.total)
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / control.total + 1 / variant.total))
  if (se === 0) return 'no clear difference'
  const z = (p2 - p1) / se
  if (z > 1.96) return 'better'
  if (z < -1.96) return 'worse'
  return 'no clear difference'
}
