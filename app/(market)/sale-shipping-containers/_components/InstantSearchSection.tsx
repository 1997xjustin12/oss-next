'use client'

import { useCallback, useMemo, useRef, useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  InstantSearch,
  Hits,
  Configure,
  Pagination,
  useInstantSearch,
} from 'react-instantsearch'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, ChevronDown, Phone, SlidersHorizontal, Star, X } from 'lucide-react'
import { ZipLookup } from './ZipLookup'
import { AccessoryCard } from './AccessoryCard'
import type { Accessory, BadgeTone } from '@/types/product'

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

const INDEX         = process.env.NEXT_PUBLIC_SEARCH_INDEX ?? 'onsite_products_index'
const SPECIALS_HREF = '/on-site-specials'

// ─── Filter options ───────────────────────────────────────────────────────────

type ProductType = 'buy' | 'rental' | 'rto' | 'accessories'
type FilterParam = 'size' | 'condition' | 'grade' | 'height' | 'type'

const FILTER_TABS: Array<{ label: string; value: ProductType }> = [
  { label: 'Buy',         value: 'buy' },
  { label: 'Rent',        value: 'rental' },
  { label: 'Rent-To-Own', value: 'rto' },
  { label: 'Accessories', value: 'accessories' },
]

const SIZE_OPTIONS           = ["10'", "20'", "40'", "45'", "53'", 'Other']                                        as const
const CONDITION_OPTIONS      = ['New', 'Used']                                                                      as const
const GRADE_OPTIONS          = ['Wind and Water tight (WWT)', 'IICL', 'Cargo Worthy (CW)', 'AS IS']                as const
const HEIGHT_OPTIONS         = ["8' 6\" Standard", "9' 6\" High Cube (HC)"]                                        as const
const CONTAINER_TYPE_OPTIONS = ['Dry Van Shipping Container With Double Doors at 1 End']                           as const

const ACCESSORY_CATEGORY_OPTIONS: Array<{ label: string; value: string | null }> = [
  { label: 'All',      value: null },
  { label: 'Lighting', value: 'Lighting' },
  { label: 'Parts',    value: 'Parts' },
  { label: 'Ramp',     value: 'Ramp' },
  { label: 'Security', value: 'Security' },
  { label: 'Shelving', value: 'Shelving' },
  { label: 'Others',   value: 'Others' },
]

type SortOption = { value: string; label: string }

const CONTAINER_SORT_OPTIONS: SortOption[] = [
  { value: 'default',    label: 'Default' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'best_rated', label: 'Best Rated' },
]

const ACCESSORY_SORT_OPTIONS: SortOption[] = [
  { value: 'default',    label: 'Default' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc',   label: 'Name: A → Z' },
  { value: 'name_desc',  label: 'Name: Z → A' },
]

// ─── Shared filter state type ─────────────────────────────────────────────────

const DEFAULT_LOCATION = 'Various North America'

type AllFilters = {
  productType:       ProductType
  location:          string
  sort:              string
  accessoryCategory: string | null
  sizes:             string[]
  conditions:        string[]
  grades:            string[]
  heights:           string[]
  containerTypes:    string[]
}

// ─── Sidebar props ────────────────────────────────────────────────────────────

type SidebarProps = {
  selectedType:             ProductType
  onTypeSelect:             (t: ProductType) => void
  selected:                 Record<FilterParam, string[]>
  onToggle:                 (param: FilterParam, value: string) => void
  selectedAccessoryCategory: string | null
  onAccessoryCategory:      (cat: string | null) => void
}

// ─── Filter styling ───────────────────────────────────────────────────────────

const filterItemCls  = 'flex w-full items-center gap-2.5 rounded-md px-1 py-1.5 text-sm text-theme-dark-2 dark:text-gray-300 transition-colors hover:bg-theme-subtle dark:hover:bg-neutral-800'
const filterCheckCls = 'h-4 w-4 accent-red-600 pointer-events-none'
const filterLabelCls = 'mb-1 text-[10px] font-extrabold uppercase tracking-wider text-theme-muted dark:text-gray-500'

// ─── Filter components ────────────────────────────────────────────────────────

function ProductTypeFilter({ selectedType, onTypeSelect }: Pick<SidebarProps, 'selectedType' | 'onTypeSelect'>) {
  return (
    <div className="mt-3">
      <div className={filterLabelCls}>Products</div>
      {FILTER_TABS.map((tab) => (
        <button key={tab.value} type="button" onClick={() => onTypeSelect(tab.value)} className={filterItemCls}>
          <input type="checkbox" checked={selectedType === tab.value} readOnly className={filterCheckCls} />
          {tab.label}
        </button>
      ))}
      <Link href={SPECIALS_HREF} className={filterItemCls}>
        <ArrowUpRight className="h-4 w-4 text-theme-muted shrink-0" />
        On-site Specials
      </Link>
    </div>
  )
}

type MultiFilterProps = {
  label:    string
  options:  readonly string[]
  selected: string[]
  onToggle: (value: string) => void
}

function MultiFilter({ label, options, selected, onToggle }: MultiFilterProps) {
  return (
    <div className="mt-3">
      <div className={filterLabelCls}>{label}</div>
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onToggle(opt)} className={filterItemCls}>
          <input type="checkbox" checked={selected.includes(opt)} readOnly className={filterCheckCls} />
          {opt}
        </button>
      ))}
    </div>
  )
}

function AccessoryCategoryFilter({ selected, onSelect }: { selected: string | null; onSelect: (v: string | null) => void }) {
  return (
    <div className="mt-3">
      <div className={filterLabelCls}>Category</div>
      {ACCESSORY_CATEGORY_OPTIONS.map((opt) => {
        const isActive = opt.value === null ? selected === null : selected === opt.value
        return (
          <button key={opt.label} type="button" onClick={() => onSelect(opt.value)} className={filterItemCls}>
            <input type="checkbox" checked={isActive} readOnly className={filterCheckCls} />
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── SearchRefresher ──────────────────────────────────────────────────────────

function SearchRefresher({ onReady }: { onReady: (fn: () => void) => void }) {
  const { refresh } = useInstantSearch()
  useEffect(() => { onReady(refresh) }, [onReady, refresh])
  return null
}

// ─── Search client ────────────────────────────────────────────────────────────

function makeSearchClient(filtersRef: React.MutableRefObject<AllFilters>) {
  return {
    search(requests: unknown[]) {
      const f = filtersRef.current
      const enriched = (requests as Array<{ indexName: string; params?: Record<string, unknown> }>)
        .map((r) => ({
          ...r,
          params: {
            ...(r.params ?? {}),
            productType:    f.productType,
            locationFilter: f.location,
            sortParam:      f.sort,
            ...(f.accessoryCategory                 ? { accessoryCategoryFilter: f.accessoryCategory } : {}),
            ...(f.sizes.length                      ? { sizeFilter:              f.sizes }              : {}),
            ...(f.conditions.length                 ? { conditionFilter:         f.conditions }         : {}),
            ...(f.grades.length                     ? { gradeFilter:             f.grades }             : {}),
            ...(f.heights.length                    ? { heightFilter:            f.heights }            : {}),
            ...(f.containerTypes.length             ? { containerTypeFilter:     f.containerTypes }     : {}),
          },
        }))
      return fetch('/api/search', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ requests: enriched }),
      }).then((res) => res.json())
    },
  }
}

// ─── Types matching the actual Elasticsearch document ────────────────────────

type Variant = {
  price:            string
  compare_at_price: string
  sku:              string
  qty:              number
}

type ProductImage = {
  src:      string
  alt:      string
  position: number
}

type ProductCategory = {
  category_name: string
  id:            number
}

type CustomField = {
  name:     string
  label?:   string
  value:    string
  choices?: string[]
}

type HitData = {
  objectID:         string
  title:            string
  handle:           string
  product_type:     string
  tags:             string[]
  status:           string
  published:        boolean
  variants:         Variant[]
  images:           ProductImage[]
  product_category: ProductCategory[]
  custom_fields:    CustomField[]
  ratings:          number | null
  sale_price:       number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCF(fields: CustomField[] | undefined, name: string): string {
  return fields?.find((f) => f.name === name)?.value ?? ''
}

function hitToAccessory(hit: HitData): Accessory {
  const price    = hit.sale_price ?? 0
  const promoTag = hit.tags?.find((t) => /best|popular|sale|deal/i.test(t))
  const tone: BadgeTone = promoTag
    ? /best|popular/i.test(promoTag) ? 'red' : 'amber'
    : 'green'
  return {
    id:           hit.objectID,
    title:        hit.title,
    price,
    thumbnailUrl: hit.images?.[0]?.src,
    permalink:    `/products/${hit.handle}`,
    sku:          hit.variants?.[0]?.sku ?? '',
    category:     hit.product_category?.[0]?.category_name ?? '',
    badge:        { label: promoTag ?? 'In Stock', tone },
    rating:       hit.ratings ?? 0,
    reviews:      0,
  }
}

// ─── Hit card ─────────────────────────────────────────────────────────────────

const BADGE_CLASSES = {
  red:   'bg-theme-primary',
  amber: 'bg-amber-600',
  green: 'bg-green-600',
} as const

function StarRow({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          className={n <= full ? 'fill-theme-primary text-theme-primary' : 'fill-gray-200 text-gray-200'}
        />
      ))}
    </div>
  )
}

function ProductHit({ hit }: { hit: HitData }) {
  const [loading, setLoading] = useState(false)
  const router  = useRouter()

  const img      = hit.images?.[0]
  const variant  = hit.variants?.[0]
  const price    = hit.sale_price ?? 0
  const location = getCF(hit.custom_fields, 'location')
  const size     = getCF(hit.custom_fields, 'length_width')
  const height   = getCF(hit.custom_fields, 'height')
  const cond     = getCF(hit.custom_fields, 'condition')
  const grade    = getCF(hit.custom_fields, 'grade')
  const sku      = variant?.sku ?? ''
  const href     = `/product/${hit.handle}`
  const rating   = typeof hit.ratings === 'number' ? hit.ratings : 0

  const badge = (() => {
    const tag = hit.tags?.find((t) => /best|popular/i.test(t)) ?? hit.tags?.[0] ?? ''
    if (!tag) return { label: 'In Stock', tone: 'green' as const }
    if (/best|popular/i.test(tag)) return { label: tag, tone: 'red' as const }
    if (/sale|deal/i.test(tag))    return { label: tag, tone: 'amber' as const }
    return { label: 'In Stock', tone: 'green' as const }
  })()

  return (
    <article
      onClick={() => { setLoading(true); router.push(href) }}
      className="relative grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-5 rounded-lg border border-theme-border bg-white p-4 sm:p-5 cursor-pointer transition-all hover:border-theme-primary/40 hover:shadow-lg"
    >
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 rounded-lg">
          <div className="w-6 h-6 border-[3px] border-theme-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative sm:col-span-3 aspect-4/3 rounded-md bg-theme-subtle overflow-hidden">
        <span className={`absolute top-0 left-0 z-10 rounded-br-md px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white ${BADGE_CLASSES[badge.tone]}`}>
          {badge.label}
        </span>
        {img?.src ? (
          <Image src={img.src} alt={img.alt || hit.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
        )}
      </div>

      {/* Info */}
      <div className="sm:col-span-6 flex min-w-0 flex-col gap-2">
        <h3 className="text-lg font-extrabold leading-tight text-theme-dark">{hit.title}</h3>

        <div className="flex items-center gap-2 text-xs">
          <StarRow rating={rating} />
          <span className="text-theme-dark-2">{rating}</span>
        </div>

        {location && location !== 'Various North America' && (
          <div className="text-xs font-bold text-theme-primary">{location}</div>
        )}

        <div className="flex items-center gap-1.5 text-xs font-semibold text-theme-accent">
          <Phone size={12} />
          Found It Cheaper? Call{' '}
          <a href="tel:8889779085" onClick={(e) => e.stopPropagation()} className="hover:underline">
            (888) 977-9085
          </a>
        </div>

        <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          {cond && (
            <>
              <dt className="font-bold uppercase tracking-wide text-theme-muted text-[10px]">Condition</dt>
              <dd className="text-theme-dark-2">{cond}</dd>
            </>
          )}
          {grade && (
            <>
              <dt className="font-bold uppercase tracking-wide text-theme-muted text-[10px]">Grade</dt>
              <dd className="text-theme-dark-2">{grade}</dd>
            </>
          )}
          {size && (
            <>
              <dt className="font-bold uppercase tracking-wide text-theme-muted text-[10px]">Size</dt>
              <dd className="text-theme-dark-2">{size}{height ? ` — ${height}` : ''}</dd>
            </>
          )}
        </dl>

        {sku && <div className="text-[10px] text-theme-muted">SKU: {sku}</div>}
      </div>

      {/* Action */}
      <div className="sm:col-span-3 flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3">
        <div className="text-left sm:text-right">
          <div className="text-3xl font-black leading-none text-theme-dark">
            {price > 0 ? `$${price.toLocaleString()}` : 'Call for Price'}
          </div>
          {price > 0 && <div className="text-[11px] text-theme-muted">+ delivery, no tax</div>}
        </div>
        <div className="flex w-full max-w-45 flex-col gap-2">
          <button
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-md bg-theme-primary px-4 py-2.5 text-sm font-extrabold text-white text-center transition-colors hover:bg-theme-primary-dark"
          >
            Quick View
          </button>
          <a
            href="tel:8889779085"
            onClick={(e) => e.stopPropagation()}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-theme-dark px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
          >
            <Phone size={13} />
            (888) 977-9085
          </a>
        </div>
      </div>
    </article>
  )
}

// ─── Sort bar (results count + sort dropdown) ─────────────────────────────────

function InstantSortBar({ currentSort, onSortChange, sortOptions }: {
  currentSort:  string
  onSortChange: (sort: string) => void
  sortOptions:  SortOption[]
}) {
  const { results } = useInstantSearch()
  const nb = results?.nbHits ?? 0
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-theme-border dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 mb-4">
      <p className="text-sm text-theme-muted dark:text-gray-400">
        <span className="font-bold text-theme-dark dark:text-gray-100">{nb.toLocaleString()}</span>{' '}
        {nb === 1 ? 'product' : 'products'} found
      </p>
      <label className="flex items-center gap-2 text-sm font-semibold text-theme-muted dark:text-gray-400">
        Sort:
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-md border border-theme-border dark:border-neutral-700 bg-white dark:bg-neutral-800 dark:text-gray-200 px-2.5 py-1.5 text-sm text-theme-dark-2 outline-none focus:border-theme-primary"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
    </div>
  )
}

// ─── Filter content (shared between sidebar and mobile drawer) ────────────────

function FilterContent({ selectedType, onTypeSelect, selected, onToggle, selectedAccessoryCategory, onAccessoryCategory }: SidebarProps) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <ProductTypeFilter selectedType={selectedType} onTypeSelect={onTypeSelect} />
      {selectedType === 'accessories' ? (
        <AccessoryCategoryFilter selected={selectedAccessoryCategory} onSelect={onAccessoryCategory} />
      ) : (
        <>
          <MultiFilter label="Size / Length"  options={SIZE_OPTIONS}           selected={selected.size}      onToggle={(v) => onToggle('size', v)} />
          <MultiFilter label="Condition"      options={CONDITION_OPTIONS}      selected={selected.condition} onToggle={(v) => onToggle('condition', v)} />
          <MultiFilter label="Grade"          options={GRADE_OPTIONS}          selected={selected.grade}     onToggle={(v) => onToggle('grade', v)} />
          <MultiFilter label="Height"         options={HEIGHT_OPTIONS}         selected={selected.height}    onToggle={(v) => onToggle('height', v)} />
          <MultiFilter label="Container Type" options={CONTAINER_TYPE_OPTIONS} selected={selected.type}      onToggle={(v) => onToggle('type', v)} />
        </>
      )}
    </div>
  )
}

// ─── Filter sidebar ───────────────────────────────────────────────────────────

function FilterSidebar(props: SidebarProps) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-lg border border-theme-border bg-white dark:bg-neutral-900 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between px-4 py-3 text-base font-extrabold transition-colors hover:bg-theme-subtle dark:hover:bg-neutral-800 text-theme-dark dark:text-gray-100 ${open ? 'border-b border-theme-border dark:border-neutral-800' : ''}`}
      >
        Filter
        <ChevronDown size={16} className={`text-theme-muted transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && <FilterContent {...props} />}
    </div>
  )
}

// ─── Mobile filter drawer ─────────────────────────────────────────────────────

type MobileFiltersProps = SidebarProps & {
  zipcode:  string | undefined
  location: string
}

function MobileFilters({ zipcode, location, ...props }: MobileFiltersProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 text-sm font-semibold border border-theme-border dark:border-neutral-700 rounded-lg px-4 py-2 bg-white dark:bg-neutral-900 text-theme-dark dark:text-white hover:border-theme-primary transition-colors mb-4"
      >
        <SlidersHorizontal className="w-4 h-4" /> Filters
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative ml-auto w-80 h-full bg-white dark:bg-neutral-900 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <span className="font-bold text-theme-dark dark:text-white">Filters</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close filters">
                <X className="w-5 h-5 text-theme-muted" />
              </button>
            </div>
            {props.selectedType !== 'accessories' && (
              <div className="px-4 pb-2">
                <ZipLookup initialZip={zipcode} location={location} ptype={props.selectedType} />
              </div>
            )}
            <FilterContent {...props} />
          </div>
        </div>
      )}
    </>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

function parseMulti(raw: string | null): string[] {
  return raw?.split(',').filter(Boolean) ?? []
}

export function InstantSearchSection() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const pathname     = usePathname()

  // All filter state is derived from the URL — no local state for filters
  const selectedType            = (searchParams.get('ptype') as ProductType | null) ?? 'buy'
  const location                = searchParams.get('location') ?? DEFAULT_LOCATION
  const zipcode                 = searchParams.get('zipcode') ?? undefined
  const currentSort             = searchParams.get('isort') ?? 'default'
  const accessoryCategory       = searchParams.get('accat') ?? null
  const selectedSizes           = useMemo(() => parseMulti(searchParams.get('size')),      [searchParams])
  const selectedConditions      = useMemo(() => parseMulti(searchParams.get('condition')), [searchParams])
  const selectedGrades          = useMemo(() => parseMulti(searchParams.get('grade')),     [searchParams])
  const selectedHeights         = useMemo(() => parseMulti(searchParams.get('height')),    [searchParams])
  const selectedTypes           = useMemo(() => parseMulti(searchParams.get('type')),      [searchParams])

  const filtersRef = useRef<AllFilters>({
    productType:       selectedType,
    location,
    sort:              currentSort,
    accessoryCategory,
    sizes:             selectedSizes,
    conditions:        selectedConditions,
    grades:            selectedGrades,
    heights:           selectedHeights,
    containerTypes:    selectedTypes,
  })
  const refreshRef    = useRef<(() => void) | null>(null)
  const isFirstRender = useRef(true)

  const searchClient = useMemo(() => makeSearchClient(filtersRef), [])

  // Sync refs and re-search whenever any URL filter changes (back/forward or updates)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    filtersRef.current = {
      productType:       selectedType,
      location,
      sort:              currentSort,
      accessoryCategory,
      sizes:             selectedSizes,
      conditions:        selectedConditions,
      grades:            selectedGrades,
      heights:           selectedHeights,
      containerTypes:    selectedTypes,
    }
    refreshRef.current?.()
  }, [selectedType, location, currentSort, accessoryCategory, selectedSizes, selectedConditions, selectedGrades, selectedHeights, selectedTypes])

  const updateUrl = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else       params.delete(key)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  const handleTypeSelect = useCallback((type: ProductType) => {
    updateUrl('ptype', type)
  }, [updateUrl])

  const handleAccessoryCategory = useCallback((cat: string | null) => {
    updateUrl('accat', cat)
  }, [updateUrl])

  const handleSortChange = useCallback((sort: string) => {
    updateUrl('isort', sort === 'default' ? null : sort)
  }, [updateUrl])

  const handleToggle = useCallback((param: FilterParam, value: string) => {
    const current = parseMulti(searchParams.get(param))
    const next    = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    updateUrl(param, next.length ? next.join(',') : null)
  }, [searchParams, updateUrl])

  const captureRefresh = useCallback((fn: () => void) => {
    refreshRef.current = fn
  }, [])

  const selected: Record<FilterParam, string[]> = {
    size:      selectedSizes,
    condition: selectedConditions,
    grade:     selectedGrades,
    height:    selectedHeights,
    type:      selectedTypes,
  }

  const sidebarProps: SidebarProps = {
    selectedType,
    onTypeSelect:              handleTypeSelect,
    selected,
    onToggle:                  handleToggle,
    selectedAccessoryCategory: accessoryCategory,
    onAccessoryCategory:       handleAccessoryCategory,
  }

  return (
    <section className="px-4 sm:px-[5%] py-6">
      <InstantSearch
        searchClient={searchClient}
        indexName={INDEX}
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <SearchRefresher onReady={captureRefresh} />
        <Configure hitsPerPage={12} />

        <MobileFilters {...sidebarProps} zipcode={zipcode} location={location} />

        <div className="flex gap-8">
          <div className="hidden lg:block w-80 shrink-0">
            {selectedType !== 'accessories' && (
              <div className="mb-3">
                <ZipLookup initialZip={zipcode} location={location} ptype={selectedType} />
              </div>
            )}
            <FilterSidebar {...sidebarProps} />
          </div>

          <div className="flex-1 min-w-0">
            <InstantSortBar
              currentSort={currentSort}
              onSortChange={handleSortChange}
              sortOptions={selectedType === 'accessories' ? ACCESSORY_SORT_OPTIONS : CONTAINER_SORT_OPTIONS}
            />

            <Hits
              hitComponent={({ hit }) =>
                selectedType === 'accessories'
                  ? <AccessoryCard product={hitToAccessory(hit as unknown as HitData)} />
                  : <ProductHit hit={hit as unknown as HitData} />
              }
              classNames={{
                root: 'mb-6',
                list: selectedType === 'accessories'
                  ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'flex flex-col gap-3',
                item: 'list-none p-0',
              }}
            />

            <Pagination
              classNames={{
                root:         'flex justify-center',
                list:         'flex items-center gap-1.5',
                item:         'list-none',
                link:         'flex h-9 w-9 items-center justify-center rounded-md border border-theme-border dark:border-neutral-700 text-sm font-bold text-theme-dark-2 dark:text-gray-400 hover:border-theme-primary hover:text-theme-primary transition-colors',
                selectedItem: '[&>a]:bg-theme-primary [&>a]:text-white [&>a]:border-theme-primary',
                disabledItem: 'opacity-40 pointer-events-none',
              }}
            />
          </div>
        </div>
      </InstantSearch>
    </section>
  )
}
