/** Raw shape returned by the backend API — field names match exactly */
export type Location = {
  id: string
  title: string        // passed as `location` to the WP products API
  description: string
  street: string
  city: string
  state: string
  postal_code: string
  country: string
  lat: string
  lng: string
  phone: string
  fax: string
  email: string
  website: string
  description_2: string
  logo_id: string
  marker_id: string
  is_disabled: string  // "0" = active, "1" = disabled
  open_hours: string   // JSON string — parse with OpenHours
  brand: string
  product: string
  custom: string       // JSON string — parse with LocationCustom
  ordr: string
  slug: string
  pending: null
  created_on: string
  updated_on: string
}

/** Parsed shape of the `open_hours` JSON string */
export type OpenHours = {
  mon: string[]
  tue: string[]
  wed: string[]
  thu: string[]
  fri: string[]
  sat: string[]
  sun: string[]
}

/** Parsed shape of the `custom` JSON string */
export type LocationCustom = {
  standard_mile: string
  standard_mile_rates: string
  additional_rates_per_mile: string
  local_specials: string
  location_details: string
  pricing: string
  is_virtual_depo: string   // "true" | "false"
  main_depo_id: string
  postal_code: string
  tilt_bed_rate_per_mile: string
  flat_bed_rate_per_mile: string
  tilt_bed_min_rate: string
  flat_bed_min_rate: string
  tilt_bed_hour_rate: string
  handling_fee: string
  relocation_fee: string
}
