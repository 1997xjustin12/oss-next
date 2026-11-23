import type { AllCityOldUrl } from '@/types/allCity'

/**
 * The default list of old URLs that 301 to an /all-city/ page: WordPress city
 * pages that lived outside /all-city/ for a city that now has an /all-city/
 * page (the depots' "Location Popular City" pages and five plain "City Page"
 * pages). Found 2026-11-23 by matching WordPress's page list
 * (local/wp-urls.tsv) against the /all-city/ records, the state read from each
 * page's WordPress title. Location, GBP and rental pages are not here: they are
 * pages of their own, not old versions of a city page.
 *
 * The admin edits this list (Admin → All City Pages → Old URL redirects); once
 * a list is published there, it replaces this one.
 */
export const ALL_CITY_OLD_URLS_DEFAULT: readonly AllCityOldUrl[] = [
  { from: '/columbia-storage-containers', to: 'columbia-storage-containers' }, // Baltimore – Columbia
  { from: '/container-storage-salisbury', to: 'storage-containers-salisbury' }, // Baltimore – Salisbury
  { from: '/container-store-grapevine-tx', to: 'shipping-containers-grapevine-tx' }, // Dallas – Grapevine
  { from: '/container-store-richardson-tx', to: 'shipping-containers-richardson-tx' }, // Dallas – Richardson
  { from: '/dearborn-storage', to: 'dearborn-storage' }, // Dearborn, MI
  { from: '/decatur-storage-containers', to: 'decatur-storage' }, // Atlanta – Decatur
  { from: '/ellicott-city-storage', to: 'ellicott-city-storage' }, // Baltimore – Ellicott City
  { from: '/extra-space-storage-alpharetta-georgia', to: 'extra-space-storage-alpharetta-georgia' }, // Atlanta – Alpharetta
  { from: '/extra-space-storage-bethesda', to: 'storage-units-bethesda' }, // Baltimore – Bethesda
  { from: '/extra-space-storage-bowie-md', to: 'storage-units-in-bowie-md' }, // Baltimore – Bowie
  { from: '/extra-space-storage-duluth-ga', to: 'extra-space-storage-duluth' }, // Atlanta – Duluth
  { from: '/extra-space-storage-hyattsville-md', to: 'storage-unit-hyattsville' }, // Baltimore – Hyattsville
  { from: '/extra-space-storage-kennesaw-georgia', to: 'storage-kennesaw' }, // Atlanta – Kennesaw
  { from: '/extra-space-storage-laurel', to: 'storage-laurel' }, // Baltimore – Laurel
  { from: '/extra-space-storage-parkville-md', to: 'parkville-storage-units' }, // Baltimore – Parkville
  { from: '/extra-space-storage-rockville-md', to: 'storage-units-rockville-md' }, // Baltimore – Rockville
  { from: '/extra-space-storage-silver-spring-md', to: 'storage-units-silver-spring-md' }, // Baltimore – Silver Spring
  { from: '/extra-space-storage-valdosta-ga', to: 'storage-valdosta-ga' }, // Atlanta – Valdosta
  { from: '/extra-space-storage-waldorf-md', to: 'waldorf-conex-storage-containers' }, // Baltimore – Waldorf
  { from: '/plano-storage-containers', to: 'storage-units-plano-tx' }, // Dallas – Plano
  { from: '/portable-storage-containers-marietta-ga', to: 'storage-marietta-ga' }, // Atlanta – Marietta
  { from: '/roswell-portable-storage-container', to: 'storage-units-roswell-ga' }, // Atlanta – Roswell
  { from: '/shipping-container-asheville-nc', to: 'shipping-container-asheville-nc' }, // Charlotte – Asheville
  { from: '/shipping-container-douglasville-ga', to: 'storage-douglasville-ga' }, // Atlanta – Douglasville
  { from: '/shipping-container-for-sale-amarillo', to: 'shipping-containers-for-sale-in-amarillo-texas' }, // Dallas – Amarillo
  { from: '/shipping-container-for-sale-arlington-tx', to: 'shipping-container-for-sale-arlington-tx' }, // Dallas – Arlington
  { from: '/shipping-container-for-sale-gainesville-ga', to: 'storage-units-gainesville-georgia' }, // Atlanta – Gainesville
  { from: '/shipping-container-storage-near-annapolis', to: 'storage-units-annapolis' }, // Baltimore – Annapolis
  { from: '/shipping-containers-for-sale-abilene-tx', to: 'storage-units-abilene-tx' }, // Dallas – Abilene
  { from: '/shipping-containers-for-sale-athens-ga', to: 'storage-athens-ga' }, // Atlanta – Athens
  { from: '/shipping-containers-for-sale-augusta-ga', to: 'storage-units-augusta-ga' }, // Atlanta – Augusta
  { from: '/shipping-containers-for-sale-big-spring-tx', to: 'shipping-containers-big-spring-tx' }, // Dallas – Big Spring
  { from: '/shipping-containers-for-sale-columbus-ga', to: 'storage-units-columbus-ga' }, // Atlanta – Columbus
  { from: '/shipping-containers-for-sale-fort-worth-texas', to: 'shipping-containers-for-sale-fort-worth' }, // Dallas – Fort Worth
  { from: '/shipping-containers-for-sale-frederick-md', to: 'frederick-storage-container' }, // Baltimore – Frederick
  { from: '/shipping-containers-for-sale-in-odessa-tx', to: 'shipping-containers-odessa-tx' }, // Dallas – Odessa
  { from: '/shipping-containers-for-sale-macon-ga', to: 'storage-macon-ga' }, // Atlanta – Macon
  { from: '/shipping-containers-for-sale-midland-tx', to: 'shipping-containers-midland-tx' }, // Dallas – Midland
  { from: '/shipping-containers-for-sale-tyler-tx', to: 'shipping-containers-tyler-texas' }, // Dallas – Tyler
  { from: '/shipping-containers-for-sale-waco-tx', to: 'shipping-containers-waco-texas' }, // Dallas – Waco
  { from: '/storage-albany-ga', to: 'storage-albany-ga' }, // Atlanta – Albany
  { from: '/storage-alvin-tx', to: 'shipping-containers-alvin-texas' }, // Houston – Alvin
  { from: '/storage-containers-denton-tx', to: 'shipping-containers-denton-texas' }, // Dallas – Denton
  { from: '/storage-containers-germantown', to: 'storage-containers-germantown' }, // Baltimore – Germantown
  { from: '/storage-containers-hagerstown-md', to: 'storage-containers-hagerstown-md' }, // Baltimore – Hagerstown
  { from: '/storage-cumming-ga', to: 'storage-cumming-ga' }, // Atlanta – Cumming
  { from: '/storage-gaithersburg-md', to: 'storage-units-gaithersburg-md' }, // Baltimore – Gaithersburg
  { from: '/storage-glen-burnie', to: 'storage-units-glen-burnie-md' }, // Baltimore – Glen Burnie
  { from: '/storage-kennesaw', to: 'storage-kennesaw' }, // Kennesaw, GA
  { from: '/storage-lawrenceville-ga', to: 'storage-lawrenceville-ga' }, // Atlanta – Lawrenceville
  { from: '/storage-norcross-ga', to: 'storage-units-norcross-ga' }, // Atlanta – Norcross
  { from: '/storage-stone-mountain-ga', to: 'storage-stone-mountain-ga' }, // Atlanta – Stone Mountain
  { from: '/storage-units-aiken-sc', to: 'storage-units-aiken-sc' }, // Charleston – Aiken
  { from: '/storage-units-anderson-indiana', to: 'storage-units-anderson-indiana' }, // Anderson, IN (its WordPress title says "ID")
  { from: '/storage-units-beaufort-sc', to: 'shipping-containers-beaufort-sc' }, // Charleston – Beaufort
  { from: '/storage-units-des-plaines', to: 'storage-units-des-plaines' }, // Des Plaines, IL
  { from: '/storage-units-springfield-oh', to: 'storage-units-springfield-oh' }, // Springfield, OH
  { from: '/storage-upper-marlboro-md', to: 'storage-upper-marlboro-md' }, // Baltimore – Upper Marlboro
]
