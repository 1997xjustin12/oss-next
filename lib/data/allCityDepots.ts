import { CDN } from './containerLandingContent'
import type { AllCityDepot } from '@/types/allCity'

/**
 * The depots the /all-city/ pages hang off (22), keyed as the seed names them
 * (WordPress's tag, normalised: `city-page-md` and `location-baltimore-md` are
 * both `baltimore-md`, `indianapolis-id` is `indianapolis-in`).
 *
 * WordPress had one Elementor template per depot, all with the same words
 * (lib/data/allCityTemplate.ts). What differed is here: the depot and its
 * banner (the product cards are the template's since 2026-11-18). Read from
 * the live pages on 2026-11-13. The code default, which the admin's All City
 * Pages → Depots edits.
 */

const banner = (path: string, height = 455) => ({ src: `${CDN}/${path}`, width: 1024, height })

const DEPOTS: Readonly<Record<string, Omit<AllCityDepot, 'key'>>> = {
  'atlanta-ga': {
    depot: 'Atlanta, GA',
    locationSlug: 'atlanta-ga',
    state: 'GA',
    banner: banner('2022/12/27100125/Atlanta-Banner-1024x455.jpg'),
    depotCityBanner: banner('2022/12/27100124/Atlanta-Banner-1-1024x455.jpg'),
  },
  'baltimore-md': {
    depot: 'Baltimore, MD',
    locationSlug: 'baltimore-md-2',
    state: 'MD',
    banner: banner('2022/12/27100117/Baltimore-Banner-1024x455.jpg'),
  },
  'charleston-sc': {
    depot: 'Charleston, SC',
    locationSlug: 'charleston-sc',
    state: 'SC',
    banner: banner('2022/12/27100118/Charleston-Banner-1024x455.jpg'),
  },
  'charlotte-nc': {
    depot: 'Charlotte, NC',
    locationSlug: 'charlotte-nc',
    state: 'NC',
    banner: banner('2022/05/27100348/Charlotte-Banner-1024x455.jpg'),
  },
  'chicago-il': {
    depot: 'Chicago, IL',
    locationSlug: 'chicago-il',
    state: 'IL',
    banner: banner('2022/12/27100118/Chicago-Banner-1024x455.jpg'),
  },
  'cincinnati-oh': {
    depot: 'Cincinnati, OH',
    locationSlug: 'cincinnati-oh',
    state: 'OH',
    banner: banner('2022/12/27100119/Cincinnati-Banner-1024x455.jpg'),
  },
  'cleveland-oh': {
    depot: 'Cleveland, OH',
    locationSlug: 'cleveland-oh',
    state: 'OH',
    banner: banner('2022/12/27100119/Cleveland-Banner-1024x455.jpg'),
  },
  'columbus-oh': {
    depot: 'Columbus, OH',
    locationSlug: 'columbus-oh',
    state: 'OH',
    banner: banner('2022/12/27100121/Columbus-Ohio-Depot-1024x410.png', 410),
  },
  'dallas-tx': {
    depot: 'Dallas, TX',
    locationSlug: 'dallas-tx',
    state: 'TX',
    banner: banner('2022/12/27100121/Dallas-Banner-1024x455.jpg'),
  },
  'denver-co': {
    depot: 'Denver, CO',
    locationSlug: 'denver-co',
    state: 'CO',
    banner: banner('2022/12/27100121/Denver-Banner-1024x455.jpg'),
  },
  'detroit-mi': {
    depot: 'Detroit, MI',
    locationSlug: 'detroit-mi',
    state: 'MI',
    banner: banner('2022/12/27100124/Detroit-Banner-1024x455.jpg'),
  },
  'el-paso-tx': {
    depot: 'El Paso, TX',
    locationSlug: 'el-paso-tx',
    state: 'TX',
    banner: banner('2022/12/27100124/El-Paso-Banner-1024x455.jpg'),
  },
  'houston-tx': {
    depot: 'Houston, TX',
    locationSlug: 'houston-tx',
    state: 'TX',
    banner: banner('2022/05/27100340/Houston-Banner-1024x455.jpg'),
  },
  'indianapolis-in': {
    depot: 'Indianapolis, IN',
    locationSlug: 'indianapolis-in',
    state: 'IN',
    banner: banner('2022/05/27100339/Indianapolis-Banner-1024x455.jpg'),
  },
  'jacksonville-fl': {
    depot: 'Jacksonville, FL',
    locationSlug: 'jacksonville-fl',
    state: 'FL',
    banner: banner('2022/05/27100338/Jacksonville-Banner--1024x455.jpg'),
  },
  'kansas-city-ks': {
    depot: 'Kansas City, KS',
    locationSlug: 'kansas-city-ks',
    state: 'KS',
    banner: banner('2022/05/27100338/Kansas-Banner-1024x455.jpg'),
  },
  'laredo-tx': {
    depot: 'Laredo, TX',
    locationSlug: 'laredo-tx',
    state: 'TX',
    banner: banner('2022/05/27100338/Laredo-Banner-1024x455.jpg'),
  },
  'miami-fl': {
    depot: 'Miami, FL',
    locationSlug: 'miami-fl',
    state: 'FL',
    banner: banner('2022/05/27100337/Miami-Banner-1024x455.jpg'),
  },
  'raleigh-nc': {
    depot: 'Raleigh, NC',
    locationSlug: 'raleigh-nc',
    state: 'NC',
    banner: banner('2022/05/27100332/Raleigh-Banner-1024x455.jpg'),
  },
  'san-antonio-tx': {
    depot: 'San Antonio, TX',
    locationSlug: 'san-antonio-tx',
    state: 'TX',
    banner: banner('2022/05/27100332/San-Antonio-1024x455.jpg'),
  },
  'tampa-fl': {
    depot: 'Tampa, FL',
    locationSlug: 'tampa-fl',
    state: 'FL',
    banner: banner('2022/05/27100330/Tampa-Banner-1024x455.jpg'),
  },
  'wilmington-nc': {
    depot: 'Wilmington, NC',
    locationSlug: 'wilmington-nc',
    state: 'NC',
    banner: banner('2022/05/27100328/Wilmington-Banner-1024x455.jpg'),
  },
}

export const ALL_CITY_DEPOTS: Readonly<Record<string, AllCityDepot>> = Object.fromEntries(
  Object.entries(DEPOTS).map(([key, depot]) => [key, { key, ...depot }]),
)
