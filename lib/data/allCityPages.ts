import { ALL_CITY_LINKS } from './allCityContent'
import { CDN } from './containerLandingContent'
import type { AllCityDepot, AllCityPage } from '@/types/allCity'

/**
 * The native /all-city/ pages: four of WordPress's "Cities" posts, at the URLs
 * WordPress served (old.onsitestorage.com/all-city/<slug>). The other 8,500
 * cities are not native (migration doc, decisions list, 2026-11-13).
 *
 * Each record is word for word from WordPress (read 2026-11-13): the post title
 * as `city`, the live page's h1, Yoast's title and description. None of the four
 * has a focus keyphrase or a keywords tag to carry over (not in the page or the
 * REST API). What depends on the depot (banner, four product cards, where "See
 * other location prices" goes) is WordPress's per-depot template.
 */

const banner = (path: string) => ({ src: `${CDN}/${path}`, width: 1024, height: 455 })

const DEPOTS = {
  miami: {
    depot: 'Miami, FL',
    locationSlug: 'miami-fl',
    state: 'FL',
    stateName: 'Florida',
    banner: banner('2022/05/27100337/Miami-Banner-1024x455.jpg'),
    otherPricesHref: ALL_CITY_LINKS.buyOnline,
    specs: ['new_20s_iicl', 'new_40h_iicl', 'new_40s_iicl', 'used_20s_asis'],
  },
  atlanta: {
    depot: 'Atlanta, GA',
    locationSlug: 'atlanta-ga',
    state: 'GA',
    stateName: 'Georgia',
    banner: banner('2022/12/27100125/Atlanta-Banner-1024x455.jpg'),
    otherPricesHref: ALL_CITY_LINKS.whereToBuy,
    specs: ['used_20s_asis', 'used_40h_iicl', 'new_40s_iicl', 'new_40h_iicl'],
  },
  houston: {
    depot: 'Houston, TX',
    locationSlug: 'houston-tx',
    state: 'TX',
    stateName: 'Texas',
    banner: banner('2022/05/27100340/Houston-Banner-1024x455.jpg'),
    otherPricesHref: ALL_CITY_LINKS.buyOnline,
    specs: ['new_20s_iicl', 'new_40h_iicl', 'new_40s_iicl', 'used_20s_asis'],
  },
  detroit: {
    depot: 'Detroit, MI',
    locationSlug: 'detroit-mi',
    state: 'MI',
    stateName: 'Michigan',
    banner: banner('2022/12/27100124/Detroit-Banner-1024x455.jpg'),
    otherPricesHref: ALL_CITY_LINKS.whereToBuy,
    specs: ['used_40s_wwt', 'used_40s_asis', 'used_40s_iicl', 'used_40s_cw'],
  },
} as const satisfies Record<string, AllCityDepot>

export const ALL_CITY_PAGES = {
  'storage-units-cocoa-beach-fl': {
    slug: 'storage-units-cocoa-beach-fl',
    city: 'Cocoa Beach',
    h1: 'Storage Units Cocoa Beach FL',
    seoTitle: 'Storage Units Cocoa Beach FL | Lowest Price Shipping Containers',
    seoDescription:
      'Storage units Cocoa Beach FL. Lowest price guaranteed. Sturdy and reliable containers. Huge range of sizes and grades. Call us now!',
    depot: DEPOTS.miami,
  },
  'abbeville-storage-unit': {
    slug: 'abbeville-storage-unit',
    city: 'Abbeville',
    h1: 'Abbeville Storage Unit',
    seoTitle: 'Abbeville Storage Unit | Lowest Price Shipping Containers',
    seoDescription:
      'Abbeville storage unit. Lowest price guaranteed. Sturdy and reliable containers. Huge range of sizes and grades. Call us now!',
    depot: DEPOTS.atlanta,
  },
  'abbott-shipping-containers': {
    slug: 'abbott-shipping-containers',
    city: 'Abbott',
    h1: 'Abbott Shipping Containers',
    seoTitle: 'Abbott Shipping Containers | Best Prices & Fast Delivery',
    seoDescription:
      'Abbott shipping containers. Lowest price guaranteed. Sturdy and reliable containers. Huge range of sizes and grades. Call us now!',
    depot: DEPOTS.houston,
  },
  'acme-storage-container': {
    slug: 'acme-storage-container',
    city: 'Acme',
    h1: 'Acme Storage Container',
    seoTitle: 'Acme Storage Container | Lowest Price Shipping Containers',
    seoDescription:
      'Acme Storage container. Lowest price guaranteed. Sturdy and reliable containers. Huge range of sizes and grades. Call us now!',
    depot: DEPOTS.detroit,
  },
} as const satisfies Record<string, AllCityPage>

export type AllCitySlug = keyof typeof ALL_CITY_PAGES
