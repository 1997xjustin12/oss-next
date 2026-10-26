import type { AccessoryListing } from '@/types/accessoryCatalog'

/**
 * PLACEHOLDER catalogue for /shipping-container-accessory-products while the
 * page is being structured. Replace by wiring `getAccessoryCatalog()`
 * (services/accessoryCatalog.service.ts) to the real accessory products; once
 * that is done this file and the page's `noindex` go.
 *
 * No handles on purpose: these products do not exist, so nothing links to a
 * product page that would 404.
 */
export const ACCESSORY_CATALOG_DEMO: AccessoryListing[] = [
  { id: 'demo-1', title: 'Heavy-Duty Lock Box', category: 'security', price: 89, inStock: true, popularity: 1, addedAt: '2026-06-02' },
  { id: 'demo-2', title: 'Shrouded Padlock', category: 'security', price: 39, inStock: true, popularity: 2, addedAt: '2026-05-14' },
  { id: 'demo-3', title: 'Container Door Bar Lock', category: 'security', price: 149, inStock: false, popularity: 7, addedAt: '2026-08-21' },
  { id: 'demo-4', title: 'LED Interior Light Kit', category: 'lighting', price: 129, inStock: true, popularity: 3, addedAt: '2026-07-09' },
  { id: 'demo-5', title: 'Solar Exterior Flood Light', category: 'lighting', price: 79, inStock: true, popularity: 9, addedAt: '2026-09-30' },
  { id: 'demo-6', title: 'Battery Motion-Sensor Light', category: 'lighting', price: 29, inStock: true, popularity: 12, addedAt: '2026-04-18' },
  { id: 'demo-7', title: '20ft Shelving System', category: 'shelving', price: 649, inStock: true, popularity: 4, addedAt: '2026-03-11' },
  { id: 'demo-8', title: '40ft Shelving System', category: 'shelving', price: 1149, inStock: false, popularity: 8, addedAt: '2026-03-11' },
  { id: 'demo-9', title: 'Wall-Mount Shelf Brackets (Set of 4)', category: 'shelving', price: 59, inStock: true, popularity: 13, addedAt: '2026-08-02' },
  { id: 'demo-10', title: 'Steel Container Ramp 6ft', category: 'ramps', price: 899, inStock: true, popularity: 5, addedAt: '2026-02-20' },
  { id: 'demo-11', title: 'Aluminum Folding Ramp', category: 'ramps', price: 459, inStock: true, popularity: 10, addedAt: '2026-10-01' },
  { id: 'demo-12', title: 'Rubber Threshold Ramp', category: 'ramps', price: 99, inStock: true, popularity: 14, addedAt: '2026-06-25' },
  { id: 'demo-13', title: 'Door Gasket Replacement Kit', category: 'parts', price: 119, inStock: true, popularity: 6, addedAt: '2026-01-15' },
  { id: 'demo-14', title: 'Locking Handle Assembly', category: 'parts', price: 69, inStock: true, popularity: 11, addedAt: '2026-09-04' },
  { id: 'demo-15', title: 'Cam Keeper Set', category: 'parts', price: 24, inStock: false, popularity: 16, addedAt: '2026-05-01' },
  { id: 'demo-16', title: 'Hinge Pin Replacement (Pack of 4)', category: 'parts', price: 34, inStock: true, popularity: 17, addedAt: '2026-07-22' },
  { id: 'demo-17', title: 'Turbine Roof Vent', category: 'others', price: 189, inStock: true, popularity: 15, addedAt: '2026-08-30' },
  { id: 'demo-18', title: 'Anti-Condensation Moisture Absorbers', category: 'others', price: 45, inStock: true, popularity: 18, addedAt: '2026-10-12' },
]
