/**
 * "Recently Delivered Containers": one delivery as the site shows it.
 *
 * Every source is turned into this shape before it is merged, sorted or
 * filtered (lib/deliveredContainers.ts):
 *
 * - `archive` — the 616 records of the WordPress plugin, copied once from
 *   old.onsitestorage.com (lib/data/deliveredContainersArchive.ts).
 * - `order`   — the backend's delivered orders, GET api/orders/delivered-products
 *   (services/deliveredProduct.service.ts), mapped field by field.
 * - `admin`   — added by hand in Admin → Delivered Containers (Redis).
 *
 * Only what the card shows: no customer, address or order detail is carried,
 * whatever a source sends.
 */
export type DeliveredContainerSource = 'archive' | 'order' | 'admin'

export type DeliveredContainer = {
  /** Unique across sources: `wp-…` (archive), `order-…`, `admin-…`. */
  id: string
  source: DeliveredContainerSource
  /** The card's first line: "Used 40' High Cube", "Shipping Containers Portland Oregon". */
  title: string
  /** The delivery date, `YYYY-MM-DD`. */
  deliveredOn: string
  /** The place as the card shows it: "Long Beach", "Atlanta, GA". */
  location: string
  /**
   * The depot it was delivered from (config/depotCoordinates.ts ids). Null
   * when the source does not say and `location` names no depot: the record
   * then shows on the homepage but on no location page.
   */
  depotId: number | null
  /** The photo, an absolute https URL; null shows the card without one. */
  image: string | null
}

/** One record as the WordPress archive holds it: the card's fields, unmatched to a depot. */
export type ArchivedDelivery = Omit<DeliveredContainer, 'source' | 'depotId'>
