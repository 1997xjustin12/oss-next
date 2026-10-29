import { SITE } from '@/config/site'
import type { GbpOpeningHours } from '@/types/gbp'

// The GBP listing's defaults, in a module of their own so the admin's client
// editors can import them without pulling in the pages' data file.

/** The listing's name when the GBP SEO screen sets none. */
export const GBP_LISTING_NAME = `${SITE.name}, Inc.`

/** Hours when the GBP SEO screen sets none: every page shows "M-F 5am-5pm". */
export const GBP_OPENING_HOURS: GbpOpeningHours[] = [
  { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '05:00', closes: '17:00' },
]
