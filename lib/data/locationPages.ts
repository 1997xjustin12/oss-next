import { LOCATION_PAGE_RECORDS } from './locationPageRecords'
import { LOCATION_MEDIA, locationDeliveryPhoto } from './locationTemplate'
import type { LocationPage } from '@/types/locationPage'

/**
 * The native /where-to-buy-shipping-containers/[location] pages, one record
 * each, from the WordPress page at the same URL (2026-11-09). Every other
 * location slug still renders from WordPress (the route's fallback).
 *
 * What a record holds, and what the template (lib/data/locationTemplate.ts)
 * holds instead: docs/reference/location-pages.md, "Plan: native location pages".
 */

const OG_IMAGE = 'https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp'

/** Atlanta, written by hand as the first record; the other locations are generated (locationPageRecords.ts). */
const ATLANTA: readonly LocationPage[] = [
  {
    slug: 'atlanta-ga',
    depot: 'Atlanta, GA',
    place: { city: 'Atlanta', region: 'GA', regionName: 'Georgia', label: 'Atlanta, GA' },
    // Atlanta's own wording where the other locations share the template's.
    text: {
      buy: { heading: 'Buy A Shipping Container In [[{regionName}]] At the best price' },
      overview: {
        body: 'On-Site Storage Solutions offers top-quality portable storage containers in [[{city}, {regionName}]], perfect for residential, commercial, or industrial use. Choose from new and used steel containers to suit your needs at unbeatable prices. Safely store inventory, construction materials, or furniture during a remodel with peace of mind. Call us at {phone} to get started today!',
      },
    },
    nearbyCities: [
      { name: 'Albany', href: '/storage-albany-ga' },
      { name: 'Alpharetta', href: '/extra-space-storage-alpharetta-georgia' },
      { name: 'Athens', href: '/shipping-containers-for-sale-athens-ga' },
      { name: 'Augusta', href: '/shipping-containers-for-sale-augusta-ga' },
      { name: 'Columbus', href: '/shipping-containers-for-sale-columbus-ga' },
      { name: 'Cumming', href: '/storage-cumming-ga' },
      { name: 'Decatur', href: '/decatur-storage-containers' },
      { name: 'Douglasville', href: '/shipping-container-douglasville-ga' },
      { name: 'Duluth', href: '/extra-space-storage-duluth-ga' },
      { name: 'Gainesville', href: '/shipping-container-for-sale-gainesville-ga' },
      { name: 'Kennesaw', href: '/extra-space-storage-kennesaw-georgia' },
      { name: 'Lawrenceville', href: '/storage-lawrenceville-ga' },
      { name: 'Macon', href: '/shipping-containers-for-sale-macon-ga' },
      { name: 'Marietta', href: '/portable-storage-containers-marietta-ga' },
      { name: 'Norcross', href: '/storage-norcross-ga' },
      { name: 'Roswell', href: '/roswell-portable-storage-container' },
      { name: 'Stone Mountain', href: '/storage-stone-mountain-ga' },
      { name: 'Valdosta', href: '/extra-space-storage-valdosta-ga' },
    ],
    mapImage: { src: `${LOCATION_MEDIA}/location-map-66e27cea688f1-1webpbv.webp`, alt: 'Map of Georgia, from Atlanta to the coast', width: 528, height: 653 },
    featured: {
      title: 'Shipping Container Museum in Atlanta',
      paragraphs: [
        'The Dignity Museum, an innovative exhibition housed in a striking red shipping container at LoveBeyondWalls headquarters in College Park, sheds light on the struggles and discrimination faced by the homeless. Founded by Terence Lester, who experienced homelessness firsthand as a teenager, LoveBeyondWalls aims to raise awareness and provide essential services like mobile grooming stations, emergency shelters, and grocery programs. Since its inception, the organization has positively impacted nearly 100,000 lives with over 25,000 hours of volunteer work.',
        'With The Dignity Museum built inside a shipping container symbolizing homeless individuals’ plight, they were able to make a powerful statement too. Lester explains that shipping containers were the perfect choice for this project because just like homeless people, they travel and possess stories of their own. Homelessness does not equate to a lack of worth; on the contrary, every person carries an immense amount of value with them regardless of their situation.',
      ],
      image: {
        src: `${LOCATION_MEDIA}/featured-iimage-66e299890c455webpbv_resized_ipadwebpbv.webp`,
        alt: 'The Dignity Museum, a red shipping container exhibition',
        width: 575,
        height: 481,
      },
    },
    news: {
      title: 'Shipping Container Home in Atlanta',
      paragraphs: [
        'During his travels through Europe, Glen Donaldson was inspired by homes constructed from old shipping containers. Upon returning to Atlanta, he noticed the absence of such designs despite the city’s abundance of boxcars. Driven by his vision, Donaldson found an affordable plot of land in a neighborhood that permitted modern housing and collaborated with an architect to bring his concept to life. Surprisingly, acquiring the six containers needed for his three-story townhome, complete with a drive-under garage, was easier than anticipated.',
        'In 2007, Donaldson constructed his three-bedroom, two-and-a-half bath abode out of “high cube” containers that tower nine and a half feet high. This design choice afforded extra headroom to the interior rooms in comparison to regular eight-and-a-half-foot containers. The first house is situated on an eighty-foot-deep lot with only twenty-seven feet at its widest point while the second building sits lengthwise on an eighty by seventeen narrow plot of land from front to back.',
      ],
      image: {
        src: `${LOCATION_MEDIA}/news-updates-image-66e2998919b18webpbv_resized_ipadwebpbv.webp`,
        alt: 'A three-story shipping container townhome in Atlanta',
        width: 575,
        height: 481,
      },
    },
    deliveredLead: [
      locationDeliveryPhoto('atlanta-8-671b565d04559webpbv.webp', 'Atlanta'),
      locationDeliveryPhoto('new-orleans-4-671b565f2a44fwebpbv.webp', 'New Orleans'),
      locationDeliveryPhoto('baltimore-7-671b565ebc2a2webpbv.webp', 'Baltimore'),
    ],
    seo: {
      title: 'Shipping Container for Sale in Atlanta | Buy, Rent & Rent-to-Own',
      description:
        'Shop shipping container for sale in Atlanta with flexible options: buy, rent, or rent-to-own. Durable containers delivered to your site.',
      ogImage: OG_IMAGE,
    },
  },
]

/** Every native location, by slug. Their paths are claimed from lib/data/locationPageSlugs.ts, kept equal to this by a test. */
export const LOCATION_PAGES: readonly LocationPage[] = [...ATLANTA, ...LOCATION_PAGE_RECORDS].sort((a, b) => a.slug.localeCompare(b.slug))

export function getLocationPageSeed(slug: string): LocationPage | undefined {
  return LOCATION_PAGES.find((page) => page.slug === slug)
}
