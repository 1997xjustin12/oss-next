/**
 * The locations we deliver from, as listed on the WordPress homepage — the
 * chips in the homepage "States We Serve" section, whose heading and sub-text
 * quote the counts below. Change the list and the copy follows.
 *
 * Order as on the source: US locations alphabetically, then Canada (Halifax
 * sits in the US run there, so it is kept in place). Two fixes against the
 * source image: Montreal is "QC" (it read "QB", which is not a province code),
 * and Salt Lake City gains its missing ", UT".
 */
export type ServiceLocation = { name: string; country: 'US' | 'CA' }

export const SERVICE_LOCATIONS: readonly ServiceLocation[] = [
  { name: 'Atlanta, GA', country: 'US' },
  { name: 'Bakersfield, CA', country: 'US' },
  { name: 'Baltimore, MD', country: 'US' },
  { name: 'Charleston, SC', country: 'US' },
  { name: 'Charlotte, NC', country: 'US' },
  { name: 'Chicago, IL', country: 'US' },
  { name: 'Cincinnati, OH', country: 'US' },
  { name: 'Cleveland, OH', country: 'US' },
  { name: 'Columbus, OH', country: 'US' },
  { name: 'Dallas, TX', country: 'US' },
  { name: 'Denver, CO', country: 'US' },
  { name: 'Detroit, MI', country: 'US' },
  { name: 'El Paso, TX', country: 'US' },
  { name: 'Halifax / Dartmouth, NS', country: 'CA' },
  { name: 'Houston, TX', country: 'US' },
  { name: 'Indianapolis, IN', country: 'US' },
  { name: 'Jacksonville, FL', country: 'US' },
  { name: 'Kansas City, KS', country: 'US' },
  { name: 'Laredo, TX', country: 'US' },
  { name: 'Las Vegas, NV', country: 'US' },
  { name: 'Los Angeles / Long Beach, CA', country: 'US' },
  { name: 'Louisville, KY', country: 'US' },
  { name: 'Memphis, TN', country: 'US' },
  { name: 'Miami, FL', country: 'US' },
  { name: 'Minneapolis, MN', country: 'US' },
  { name: 'Mobile, AL', country: 'US' },
  { name: 'Nashville, TN', country: 'US' },
  { name: 'New Orleans, LA', country: 'US' },
  { name: 'New York, NY / Newark, NJ', country: 'US' },
  { name: 'Norfolk, VA', country: 'US' },
  { name: 'Omaha, NE', country: 'US' },
  { name: 'Phoenix, AZ', country: 'US' },
  { name: 'Portland, OR', country: 'US' },
  { name: 'Raleigh, NC', country: 'US' },
  { name: 'Salt Lake City, UT', country: 'US' },
  { name: 'San Antonio, TX', country: 'US' },
  { name: 'San Francisco / Oakland, CA', country: 'US' },
  { name: 'Savannah, GA', country: 'US' },
  { name: 'Seattle, WA', country: 'US' },
  { name: 'St. Louis, MO', country: 'US' },
  { name: 'Tacoma, WA', country: 'US' },
  { name: 'Tampa, FL', country: 'US' },
  { name: 'Temecula, CA', country: 'US' },
  { name: 'Wilmington, NC', country: 'US' },
  { name: 'Worcester / Boston, MA', country: 'US' },
  { name: 'Calgary, AB', country: 'CA' },
  { name: 'Edmonton, AB', country: 'CA' },
  { name: 'Montreal, QC', country: 'CA' },
  { name: 'Toronto, ON', country: 'CA' },
  { name: 'Vancouver, BC / Delta, BC', country: 'CA' },
  { name: 'Winnipeg, MB', country: 'CA' },
  { name: 'Regina, SK', country: 'CA' },
  { name: 'Saskatoon, SK', country: 'CA' },
]

export const SERVICE_LOCATION_COUNT = SERVICE_LOCATIONS.length
export const US_LOCATION_COUNT = SERVICE_LOCATIONS.filter((l) => l.country === 'US').length
export const CA_LOCATION_COUNT = SERVICE_LOCATIONS.filter((l) => l.country === 'CA').length
