import { ROUTES } from '@/config/routes'

/**
 * The locations we deliver from, as listed on the WordPress homepage — the
 * chips in the homepage "States We Serve" section, whose heading and sub-text
 * quote the counts below. Change the list and the copy follows.
 *
 * Order as on the source: US locations alphabetically, then Canada (Halifax
 * sits in the US run there, so it is kept in place). Two fixes against the
 * source image: Montreal is "QC" (it read "QB", which is not a province code),
 * and Salt Lake City gains its missing ", UT".
 *
 * Each `url` is the location's live page. The slugs are the real WordPress
 * ones, checked against the backend's page sitemap, so several do not follow
 * the name: `indianapolis-id`, `montreal-qb` and `salt-lake-city` are what the
 * pages are actually called. Three differ from the depot records' own links,
 * which 404: Baltimore is `baltimore-md-2`, Halifax `halifax-dartmouth-ns`
 * and Las Vegas `las-vegas-nv`. Check a new slug against the sitemap before
 * adding it rather than building it from the name.
 */
export type ServiceLocation = { name: string; country: 'US' | 'CA'; url: string }

/** Where every location page lives: `/where-to-buy-shipping-containers/`. */
export const LOCATION_PAGE_PATH = `${ROUTES.WHERE_TO_BUY}/`

export const SERVICE_LOCATIONS: readonly ServiceLocation[] = [
  { name: 'Atlanta, GA', country: 'US', url: `${LOCATION_PAGE_PATH}atlanta-ga` },
  { name: 'Bakersfield, CA', country: 'US', url: `${LOCATION_PAGE_PATH}bakersfield-ca` },
  { name: 'Baltimore, MD', country: 'US', url: `${LOCATION_PAGE_PATH}baltimore-md-2` },
  { name: 'Charleston, SC', country: 'US', url: `${LOCATION_PAGE_PATH}charleston-sc` },
  { name: 'Charlotte, NC', country: 'US', url: `${LOCATION_PAGE_PATH}charlotte-nc` },
  { name: 'Chicago, IL', country: 'US', url: `${LOCATION_PAGE_PATH}chicago-il` },
  { name: 'Cincinnati, OH', country: 'US', url: `${LOCATION_PAGE_PATH}cincinnati-oh` },
  { name: 'Cleveland, OH', country: 'US', url: `${LOCATION_PAGE_PATH}cleveland-oh` },
  { name: 'Columbus, OH', country: 'US', url: `${LOCATION_PAGE_PATH}columbus-oh` },
  { name: 'Dallas, TX', country: 'US', url: `${LOCATION_PAGE_PATH}dallas-tx` },
  { name: 'Denver, CO', country: 'US', url: `${LOCATION_PAGE_PATH}denver-co` },
  { name: 'Detroit, MI', country: 'US', url: `${LOCATION_PAGE_PATH}detroit-mi` },
  { name: 'El Paso, TX', country: 'US', url: `${LOCATION_PAGE_PATH}el-paso-tx` },
  { name: 'Halifax / Dartmouth, NS', country: 'CA', url: `${LOCATION_PAGE_PATH}halifax-dartmouth-ns` },
  { name: 'Houston, TX', country: 'US', url: `${LOCATION_PAGE_PATH}houston-tx` },
  { name: 'Indianapolis, IN', country: 'US', url: `${LOCATION_PAGE_PATH}indianapolis-id` },
  { name: 'Jacksonville, FL', country: 'US', url: `${LOCATION_PAGE_PATH}jacksonville-fl` },
  { name: 'Kansas City, KS', country: 'US', url: `${LOCATION_PAGE_PATH}kansas-city-ks` },
  { name: 'Laredo, TX', country: 'US', url: `${LOCATION_PAGE_PATH}laredo-tx` },
  { name: 'Las Vegas, NV', country: 'US', url: `${LOCATION_PAGE_PATH}las-vegas-nv` },
  { name: 'Los Angeles / Long Beach, CA', country: 'US', url: `${LOCATION_PAGE_PATH}los-angeles-long-beach-ca` },
  { name: 'Louisville, KY', country: 'US', url: `${LOCATION_PAGE_PATH}louisville-ky` },
  { name: 'Memphis, TN', country: 'US', url: `${LOCATION_PAGE_PATH}memphis-tn` },
  { name: 'Miami, FL', country: 'US', url: `${LOCATION_PAGE_PATH}miami-fl` },
  { name: 'Minneapolis, MN', country: 'US', url: `${LOCATION_PAGE_PATH}minneapolis-mn` },
  { name: 'Mobile, AL', country: 'US', url: `${LOCATION_PAGE_PATH}mobile-al` },
  { name: 'Nashville, TN', country: 'US', url: `${LOCATION_PAGE_PATH}nashville-tn` },
  { name: 'New Orleans, LA', country: 'US', url: `${LOCATION_PAGE_PATH}new-orleans-la` },
  { name: 'New York, NY / Newark, NJ', country: 'US', url: `${LOCATION_PAGE_PATH}new-york-ny-newark-nj` },
  { name: 'Norfolk, VA', country: 'US', url: `${LOCATION_PAGE_PATH}norfolk-va` },
  { name: 'Omaha, NE', country: 'US', url: `${LOCATION_PAGE_PATH}omaha-ne` },
  { name: 'Phoenix, AZ', country: 'US', url: `${LOCATION_PAGE_PATH}phoenix-az` },
  { name: 'Portland, OR', country: 'US', url: `${LOCATION_PAGE_PATH}portland-or` },
  { name: 'Raleigh, NC', country: 'US', url: `${LOCATION_PAGE_PATH}raleigh-nc` },
  { name: 'Salt Lake City, UT', country: 'US', url: `${LOCATION_PAGE_PATH}salt-lake-city` },
  { name: 'San Antonio, TX', country: 'US', url: `${LOCATION_PAGE_PATH}san-antonio-tx` },
  { name: 'San Francisco / Oakland, CA', country: 'US', url: `${LOCATION_PAGE_PATH}san-francisco-oakland-ca` },
  { name: 'Savannah, GA', country: 'US', url: `${LOCATION_PAGE_PATH}savannah-ga` },
  { name: 'Seattle, WA', country: 'US', url: `${LOCATION_PAGE_PATH}seattle-wa` },
  { name: 'St. Louis, MO', country: 'US', url: `${LOCATION_PAGE_PATH}st-louis-mo` },
  { name: 'Tacoma, WA', country: 'US', url: `${LOCATION_PAGE_PATH}tacoma-wa` },
  { name: 'Tampa, FL', country: 'US', url: `${LOCATION_PAGE_PATH}tampa-fl` },
  { name: 'Temecula, CA', country: 'US', url: `${LOCATION_PAGE_PATH}temecula-ca` },
  { name: 'Wilmington, NC', country: 'US', url: `${LOCATION_PAGE_PATH}wilmington-nc` },
  { name: 'Worcester / Boston, MA', country: 'US', url: `${LOCATION_PAGE_PATH}worcester-boston-ma` },
  { name: 'Calgary, AB', country: 'CA', url: `${LOCATION_PAGE_PATH}calgary-ab` },
  { name: 'Edmonton, AB', country: 'CA', url: `${LOCATION_PAGE_PATH}edmonton-ab` },
  { name: 'Montreal, QC', country: 'CA', url: `${LOCATION_PAGE_PATH}montreal-qb` },
  { name: 'Toronto, ON', country: 'CA', url: `${LOCATION_PAGE_PATH}toronto-on` },
  { name: 'Vancouver, BC / Delta, BC', country: 'CA', url: `${LOCATION_PAGE_PATH}vancouver-bc-delta-bc` },
  { name: 'Winnipeg, MB', country: 'CA', url: `${LOCATION_PAGE_PATH}winnipeg-mb` },
  { name: 'Regina, SK', country: 'CA', url: `${LOCATION_PAGE_PATH}regina-sk` },
  { name: 'Saskatoon, SK', country: 'CA', url: `${LOCATION_PAGE_PATH}saskatoon-sk` },
]

export const SERVICE_LOCATION_COUNT = SERVICE_LOCATIONS.length
export const US_LOCATION_COUNT = SERVICE_LOCATIONS.filter((l) => l.country === 'US').length
export const CA_LOCATION_COUNT = SERVICE_LOCATIONS.filter((l) => l.country === 'CA').length
