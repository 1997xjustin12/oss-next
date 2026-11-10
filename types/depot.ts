/**
 * A depot as the backend's `/api/depots/` returns it (checked 2026-11-10).
 * 141 records: `main` depots with a yard, and `virtual` ones (a service area
 * served from its `main_depot`).
 */
export type DepotType = 'main' | 'virtual'

export type DepotRef = { id: number; title: string }

export type Depot = {
  id: number
  /** The WordPress store-locator id (config/locations.ts `id`). */
  external_id: number
  /** "Atlanta, GA". */
  title: string
  type: DepotType
  /** The depot a virtual one is served from; null for a main depot. */
  main_depot: DepotRef | null
  /** The virtual depots a main one serves. */
  satellites: DepotRef[]
  street: string
  city: string
  state: string
  postal_code: string
  country: string
  latitude: number
  longitude: number
  phone: string
  fax: string
  email: string
  website: string
  /** The depot page on the WordPress site, e.g. "/locations/dallas-tx/". */
  page_path: string
  /** Opening hours by day, e.g. `{ mon: ['06:00 AM - 05:00 PM'] }`. */
  hours: Record<string, string[]> | null
  /** Delivery rates; null on every depot as of 2026-11-10. */
  rates: unknown
}

/** The backend's list, every page folded into one. */
export type DepotList = { count: number; results: Depot[] }
