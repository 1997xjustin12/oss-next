import { AllCityPage } from '@/components/allCity/AllCityPage'
import { ROUTES } from '@/config/routes'
import { ALL_CITY_PAGES } from '@/lib/data/allCityPages'
import { resolvePageMetadata } from '@/lib/seo'

const PAGE = ALL_CITY_PAGES['acme-storage-container']

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.ALL_CITY(PAGE.slug))
}

/** /all-city/acme-storage-container, native since 2026-11-13 at the URL WordPress served it from. */
export default function Page() {
  return <AllCityPage page={PAGE} />
}
