import { CDN } from './containerLandingContent'
import type { LocationImage, LocationTemplate } from '@/types/locationPage'

/**
 * The location pages' template, seeded from WordPress's Atlanta and Calgary
 * pages (one Elementor template). Every location renders this; a location's
 * record (lib/data/locationPages.ts) adds its own place, cities, map, stories
 * and photos, and may replace any wording here.
 *
 * Placeholders are filled per page: {city}, {region}, {regionName},
 * {cityRegion}, {phone}, and {lowestRent} (the depot's cheapest rental, live).
 * [[…]] is the red accent; [label](/path) a link.
 *
 * Copy corrections (owner approved for migrated pages): phones are the sales
 * line, "glad you dia" is "did", "explore all you" is "your". The rental's
 * "as low as $99 a month" is the depot's lowest rent from the catalogue
 * ({lowestRent}), as the owner asked (2026-11-09).
 */

/** The backend's copy of the WordPress media, where most of these pages' images live. */
export const LOCATION_MEDIA = 'https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana'

/** A delivery photo. Its caption (container, date, place) is part of the image; the alt names the place. */
export function locationDeliveryPhoto(file: string, city: string): LocationImage {
  return { src: `${LOCATION_MEDIA}/${file}`, alt: `Shipping container delivered in ${city}`, width: 365, height: 362 }
}

/** WordPress's carousel after Atlanta's own three, in its order: [file, place]. */
const DELIVERED: readonly (readonly [string, string])[] = [
  ['long-beach-2-671b560406448webpbv_NxJYYy3.webp', 'Long Beach'],
  ['dallas-2-671b560428232webpbv_DFgS8cr.webp', 'Dallas'],
  ['portland-2-671b5605eb263webpbv_aQwh0Hw.webp', 'Portland'],
  ['oakland-3-671b5607c2080webpbv.webp', 'Oakland'],
  ['cleveland-2-671b5605cf6f1webpbv.webp', 'Cleveland'],
  ['louisville-671b5609684edwebpbv.webp', 'Louisville'],
  ['cincinnati-671b5607e2059webpbv.webp', 'Cincinnati'],
  ['chicago-7-671b56097425dwebpbv.webp', 'Chicago'],
  ['charlotte-671b560b419c4webpbv.webp', 'Charlotte'],
  ['austin-2-671b560b2a209webpbv.webp', 'Austin'],
  ['seattle-4-671b560cdf2edwebpbv.webp', 'Seattle'],
  ['omaha-3-671b560cc51edwebpbv.webp', 'Omaha'],
  ['new-orleans-3-671b560e9ce8fwebpbv.webp', 'New Orleans'],
  ['denver-4-671b560e79dcewebpbv.webp', 'Denver'],
  ['miami-3-671b5611d0a89webpbv.webp', 'Miami'],
  ['detroit-3-671b5610638f3webpbv.webp', 'Detroit'],
  ['baltimore-6-671b56100f99cwebpbv.webp', 'Baltimore'],
  ['norfolk-2-671b561215a50webpbv.webp', 'Norfolk'],
  ['memphis-2-671b5613aa050webpbv.webp', 'Memphis'],
  ['kansas-2-671b56133dac2webpbv.webp', 'Kansas City'],
  ['houston-5-671b5614ef8bdwebpbv.webp', 'Houston'],
  ['dallas-671b5615330a1webpbv.webp', 'Dallas'],
  ['savannah-3-671b56169f6c2webpbv.webp', 'Savannah'],
  ['canada-671b5616cc96ewebpbv.webp', 'Canada'],
  ['salt-lake-city-2-671b56185fa0dwebpbv.webp', 'Salt Lake City'],
  ['indianapolis-3-671b5618706bawebpbv.webp', 'Indianapolis'],
  ['tampa-671b561b844e9webpbv.webp', 'Tampa'],
  ['new-orleans-2-671b561a12720webpbv.webp', 'New Orleans'],
  ['detroit-2-671b561b8b558webpbv.webp', 'Detroit'],
  ['denver-3-671b5619e5e40webpbv.webp', 'Denver'],
  ['st-louis-671b561d1ab19webpbv.webp', 'St. Louis'],
  ['oakland-2-671b561cdd878webpbv.webp', 'Oakland'],
  ['seattle-3-671b561e7c32ewebpbv.webp', 'Seattle'],
  ['atlanta-7-671b561eb215fwebpbv.webp', 'Atlanta'],
  ['nashville-3-671b5620508eawebpbv.webp', 'Nashville'],
  ['detroit-671b562041b40webpbv.webp', 'Detroit'],
  ['charleston-671b5621c219fwebpbv.webp', 'Charleston'],
  ['toronto-2-671b562369c93webpbv.webp', 'Toronto'],
  ['minneapolis-671b5621c70a3webpbv.webp', 'Minneapolis'],
  ['indianapolis-2-671b56233906cwebpbv.webp', 'Indianapolis'],
  ['tacoma-3-671b56252e21bwebpbv.webp', 'Tacoma'],
  ['san-antonio-2-671b5624c30dawebpbv.webp', 'San Antonio'],
  ['winnipeg-2-671b562668b3ewebpbv.webp', 'Winnipeg'],
  ['atlanta-6-671b5626c5011webpbv.webp', 'Atlanta'],
  ['winniped-671b562987af7webpbv.webp', 'Winnipeg'],
  ['norfolk-671b562879c49webpbv.webp', 'Norfolk'],
  ['atlanta-4-671b5628182d9webpbv.webp', 'Atlanta'],
  ['los-angeles-2-671b562b28f91webpbv.webp', 'Los Angeles'],
  ['laredo-671b562a324ffwebpbv.webp', 'Laredo'],
  ['vancouver-671b562d7ecacwebpbv.webp', 'Vancouver'],
  ['houston-4-671b562bd471ewebpbv.webp', 'Houston'],
  ['calgary-671b562cdbc17webpbv.webp', 'Calgary'],
  ['omaha-2-671b562f57ecdwebpbv.webp', 'Omaha'],
  ['el-paso-671b562e88a52webpbv.webp', 'El Paso'],
  ['jacksonville-3-671b563056e88webpbv.webp', 'Jacksonville'],
  ['houston-3-671b56312d4a0webpbv.webp', 'Houston'],
  ['atlanta-3-671b5631c366ewebpbv.webp', 'Atlanta'],
  ['los-angeles-671b5632b4490webpbv.webp', 'Los Angeles'],
  ['baltimore-5-671b563341d37webpbv.webp', 'Baltimore'],
  ['seattle-2-671b5634764c6webpbv.webp', 'Seattle'],
  ['baltimore-4-671b563504d28webpbv.webp', 'Baltimore'],
  ['oakland-671b56362e4f7webpbv.webp', 'Oakland'],
  ['baltimore-3-671b5636936bdwebpbv.webp', 'Baltimore'],
  ['tacoma-2-671b56382b480webpbv.webp', 'Tacoma'],
  ['memphis-671b5639b43edwebpbv.webp', 'Memphis'],
  ['chicago-6-671b56395b283webpbv.webp', 'Chicago'],
  ['boston-671b5637ebf67webpbv.webp', 'Boston'],
  ['miami-2-671b563b7f17awebpbv.webp', 'Miami'],
  ['jacksonville-2-671b563b2baf7webpbv.webp', 'Jacksonville'],
  ['nashville-2-671b563cba36ewebpbv.webp', 'Nashville'],
  ['austin-671b563d31812webpbv.webp', 'Austin'],
  ['cleveland-671b563eddf0dwebpbv.webp', 'Cleveland'],
  ['atlanta-2-671b563e799f4webpbv.webp', 'Atlanta'],
  ['houston-2-671b5640255e5webpbv.webp', 'Houston'],
  ['chicago-5-671b56406c78awebpbv.webp', 'Chicago'],
  ['indianapolis-671b564396fefwebpbv.webp', 'Indianapolis'],
  ['denver-2-671b564274160webpbv.webp', 'Denver'],
  ['chicago-4-671b5641e1267webpbv.webp', 'Chicago'],
  ['nashville-671b56455a571webpbv.webp', 'Nashville'],
  ['kansas-671b56443e352webpbv.webp', 'Kansas City'],
  ['long-beach-671b5645e586ewebpbv.webp', 'Long Beach'],
  ['chicago-3-671b5646e84edwebpbv.webp', 'Chicago'],
  ['baltimore-2-671b5647ba5a4webpbv.webp', 'Baltimore'],
  ['salt-lake-city-671b56499dd6ewebpbv.webp', 'Salt Lake City'],
  ['new-orleans-671b5648ad9fbwebpbv.webp', 'New Orleans'],
  ['baltimore-671b564a60f41webpbv.webp', 'Baltimore'],
  ['atlanta-671b564b41147webpbv.webp', 'Atlanta'],
  ['jacksonville-671b564d05b6fwebpbv.webp', 'Jacksonville'],
  ['chicago-2-671b564c267aawebpbv.webp', 'Chicago'],
  ['portland-671b564f70c28webpbv.webp', 'Portland'],
  ['houston-671b564dd213ewebpbv.webp', 'Houston'],
  ['denver-671b564e8276dwebpbv.webp', 'Denver'],
  ['san-antonio-671b565146cf2webpbv.webp', 'San Antonio'],
  ['chicago-671b56505e7d8webpbv.webp', 'Chicago'],
  ['toronto-671b565305e59webpbv.webp', 'Toronto'],
  ['montreal-671b5652015c7webpbv.webp', 'Montreal'],
  ['tacoma-671b56548fe9bwebpbv.webp', 'Tacoma'],
  ['savannah-2-671b5653c3102webpbv.webp', 'Savannah'],
  ['omaha-671b56555e62cwebpbv.webp', 'Omaha'],
  ['seattle-671b56563dadcwebpbv.webp', 'Seattle'],
  ['miami-671b5656c4472webpbv.webp', 'Miami'],
  ['savannah-671b56588df0fwebpbv.webp', 'Savannah'],
  ['mobile-671b5657cc3cdwebpbv.webp', 'Mobile'],
  ['mobile-2-671b56599e90awebpbv.webp', 'Mobile'],
  ['tampa-2-671b565b6e131webpbv.webp', 'Tampa'],
  ['savannah-4-671b565a3fa49webpbv.webp', 'Savannah'],
  ['jacksonville-4-671b565d6767ewebpbv.webp', 'Jacksonville'],
  ['cleveland-3-671b565beb347webpbv.webp', 'Cleveland'],
]

export const LOCATION_TEMPLATE_DEFAULT: LocationTemplate = {
  sections: [
    { id: 'hero', enabled: true },
    { id: 'budgetBand', enabled: true },
    { id: 'options', enabled: true },
    { id: 'products', enabled: true },
    { id: 'buy', enabled: true },
    { id: 'delivered', enabled: true },
    { id: 'satisfaction', enabled: true },
    { id: 'callBand', enabled: true },
    { id: 'featured', enabled: true },
    { id: 'news', enabled: true },
    { id: 'video', enabled: true },
    { id: 'overview', enabled: true },
    { id: 'purchase', enabled: true },
    { id: 'rental', enabled: true },
    { id: 'rto', enabled: true },
    { id: 'closingBand', enabled: true },
  ],
  text: {
    hero: {
      heading: 'Shipping Containers For Sale [[{cityRegion}]]',
      tagline: '100% Satisfaction Guaranteed - Highest Customer Satisfaction -Founded in 2002',
    },
    budgetBand: 'WE HAVE CONTAINERS FOR EVERY BUDGET!',
    options: { heading: 'Select An Option Below', cta: 'See Prices' },
    products: {
      heading: 'Explore our top-selling shipping containers available in [[{cityRegion}]]',
      intro:
        'Get competitive prices and fast delivery across the {cityRegion} area. Click on each product to learn more and secure the best deal on quality storage containers today.',
      cta: 'Shop All Products - {cityRegion}',
    },
    buy: {
      heading: 'Buy A Shipping Container In [[{regionName}]] At the best price',
      body: 'Looking to buy a shipping container in {regionName} at an unbeatable price? [On-Site Storage Solutions](/) has got you covered. We offer containers in sizes from 10ft to 40ft, including high cube containers. You can choose from new, used, or refurbished options. Discover unbeatable value and fast delivery for all your container needs. Contact us today to learn more about our special offers!',
      cta: 'See All Container Prices',
    },
    delivered: { heading: 'Shipping Containers Delivered' },
    satisfaction: {
      heading: '100% Satisfaction Guaranteed',
      body: 'Our satisfaction guarantee makes buying or renting a container easy and worry-free. Call to order from our friendly experienced sales associates or just order online using our website. Our website is a great place to start learning more about container prices, types, conditions, and grades. Order today you will be glad you did.',
      cta: 'Check out our reviews',
    },
    callBand: 'Ready to Buy a shipping container? [[Call {phone} for more savings!]]',
    stories: { featuredLabel: 'FEATURED', newsLabel: 'NEWS & UPDATES', readMore: 'Read More', readLess: 'Read Less' },
    video: { title: 'Find Shipping Containers Near You with On-Site Storage Solutions!' },
    overview: {
      heading: 'Portable Storage Containers [[For Sale, Rent & Rent-To-Own in {city}]]',
      body: 'On-Site Storage Solutions offers top-quality portable storage containers in [[{city}, {regionName}]], perfect for residential, commercial, or industrial use. Choose from new and used steel containers to suit your needs at unbeatable prices. Safely store inventory, construction materials, or furniture during a remodel with peace of mind. Call us at {phone} to get started today!',
    },
    purchase: {
      heading: 'Purchase Your Storage Containers',
      body: 'On-Site Storage Solutions offers top-quality portable storage containers or conex boxes in [[{city}, {regionName}]], perfect for residential storage space, commercial, or businesses seeking industrial use. Choose from new and used steel containers to suit your needs at unbeatable prices. Safely store inventory, construction materials, or furniture during a remodel with peace of mind. Call us at {phone} to get started today!',
      cta: 'Buy A Container',
    },
    rental: {
      heading: 'Shipping Container Rental',
      body: 'Looking for flexible storage solutions? On-Site Storage Solutions offers shipping container rental in [[{city}]] at the lowest rates, starting as low as {lowestRent} a month. Some areas may require sales tax. Give us a call at {phone} during business days to discuss your temporary or long-term rental needs, and we’ll guide you through the container rental process.',
      cta: 'Rent A Container',
    },
    rto: {
      heading: 'Shipping Container Rent-To-Own',
      body: 'In addition, we proudly present a Rent-To-Own Option in partnership with My Container Rental offering plans in {city} for as low as $61.36 per month, providing payment plans that suit your needs, including 6, 12, 18, and 24-month terms, as well as long-term programs. For more information, call us at {phone} to explore all your shipping container options in {cityRegion}.',
      cta: 'Rent-to-own A Container',
    },
    closingBand: 'Ready to purchase? Call now for more [[discounts!]]',
  },
  media: {
    heroBackground: `${CDN}/2024/08/22033247/new_homepage_banner.webp`,
    satisfactionSeal: { src: `${CDN}/2024/10/08011536/Satisfaction-Guaranteed-1.webp`, alt: '', width: 149, height: 141 },
    purchaseImage: {
      src: `${LOCATION_MEDIA}/how-to-buy-a-shipping-container-66e2b7f9b00dawebpbv.webp`,
      alt: 'On-Site Storage team member in a hard hat and safety vest',
      width: 577,
      height: 388,
    },
    rentalImage: { src: `${CDN}/2024/09/12095608/shipping-container-rental-66e2baa616062.webp`, alt: 'shipping container for rent', width: 541, height: 362 },
    rtoImage: { src: `${CDN}/2024/09/12100436/shipping-container-rent-to-own-66e2bc2d01f93.webp`, alt: 'shipping container rent to own', width: 557, height: 365 },
    youtubeId: 'FHhyeGprAvQ',
  },
  options: {
    buy: {
      image: { src: `${LOCATION_MEDIA}/buy-container-image-67da335807fc5webpbv_nb3BwKk.webp`, alt: 'Buy a shipping container', width: 330, height: 171 },
      bullets: ['Guaranteed Lowest Price', 'Huge Selection', 'Location Near You'],
      ptype: 'buy',
    },
    rent: {
      image: { src: `${LOCATION_MEDIA}/rent-logo-imagewebpbv.webp`, alt: 'Rent a shipping container', width: 1224, height: 637 },
      bullets: ['Lowest Price Rate', 'Free Rent', 'Fast Delivery'],
      ptype: 'rental',
    },
    rto: {
      image: { src: `${LOCATION_MEDIA}/rent-to-own-containers-croppedwebpbv_Bw30iiF.webp`, alt: 'Rent-to-own a shipping container', width: 342, height: 180 },
      bullets: ['Affordable Monthly Payment', 'Huge Selection', 'Everyone Qualifies'],
      ptype: 'rto',
    },
  },
  productSpecs: ['used_20s_asis', 'used_20s_wwt', 'used_20s_cw', 'used_40s_asis'],
  deliveredPhotos: DELIVERED.map(([file, city]) => locationDeliveryPhoto(file, city)),
}
