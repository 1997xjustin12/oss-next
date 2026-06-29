'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Shield, CheckCircle2, Truck, Headphones,
  Heart, Share2, GitCompare, Printer,
  ShoppingCart, ClipboardList, Phone,
} from 'lucide-react'
import type { WpSingleProduct, WpApiProduct } from '@/types/product'
import { useCart } from '@/hooks/useCart'
import { Stars } from './Stars'

// ─── option layer types ───────────────────────────────────────────────────────

type PriceTab = 'buy' | 'rent' | 'rto'

type Selection = {
  tab:      PriceTab
  sizeIdx:  number
  condIdx:  number
  gradeIdx: number
  rentTerm: string
  rtoTerm:  string
}

type OptionEntry = {
  key:       string
  label:     string
  sublabel?: string
  active:    boolean
  available: boolean
  onSelect:  () => void
}

type OptionsGroup = {
  id:      string
  title:   string
  layout:  'grid-3' | 'grid-2' | 'flex'
  options: OptionEntry[]
}

// ─── static option definitions ────────────────────────────────────────────────

const sizes = [
  { name: "20' Standard",  sizeKey: '20', highCube: false, desc: '160 sq ft · Most popular'    },
  { name: "40' Standard",  sizeKey: '40', highCube: false, desc: '320 sq ft · Double the space' },
  { name: "40' High Cube", sizeKey: '40', highCube: true,  desc: '344 sq ft · Extra 1ft height' },
]

const conditions = [
  { name: 'Used', desc: 'Inspected & weather-tight · Best value' },
  { name: 'New',  desc: 'One-trip · Like new condition'          },
]

const grades = [
  { name: 'AS IS',              gradeKey: 'AS IS', desc: 'No certification · Sold as-is'       },
  { name: 'Wind & Water Tight', gradeKey: 'Wind',  desc: 'Weather-sealed · Structurally sound' },
  { name: 'Cargo Worthy',       gradeKey: 'Cargo', desc: 'IICL certified · Ship-ready'         },
  { name: 'IICL',               gradeKey: 'IICL',  desc: 'Premium grade · Highest standard'    },
]

const RENT_TERMS = [
  { value: '12', label: '12 Months' },
  { value: '6',  label: '6 Months'  },
  { value: '3',  label: '3 Months'  },
]

const RTO_TERMS = [
  { value: '48', label: '48 Months' },
  { value: '36', label: '36 Months' },
  { value: '24', label: '24 Months' },
  { value: '12', label: '12 Months' },
]

const trustBadges = [
  { Icon: Shield,       label: 'Satisfaction Guaranteed'  },
  { Icon: CheckCircle2, label: 'No Hidden Fees'           },
  { Icon: Truck,        label: 'Fast Nationwide Delivery' },
  { Icon: Headphones,   label: 'Expert Phone Support'     },
]

// ─── index helpers ────────────────────────────────────────────────────────────

function sizeToIndex(size: string, height?: string): number {
  const s = size.toLowerCase()
  const h = (height ?? '').toLowerCase()
  if (s.includes('40') && (h.includes('high') || h.includes('hc') || s.includes('high') || s.includes('hc'))) return 2
  if (s.includes('40')) return 1
  return 0
}

// Condition is its own field — never infer it from grade
function conditionToIndex(condition: string): number {
  const c = (condition ?? '').toLowerCase()
  return c.includes('new') || c.includes('one') || c.includes('trip') ? 1 : 0
}

function gradeToGradeIndex(grade: string): number {
  const g = grade.toLowerCase()
  if (g.includes('iicl'))                                            return 3
  if (g.includes('cargo'))                                           return 2
  if (g.includes('wind') || g.includes('wwt') || g.includes('water')) return 1
  return 0
}

// ─── match predicates ─────────────────────────────────────────────────────────

function matchesSize(p: WpApiProduct, i: number): boolean {
  const entry = sizes[i]
  if (!entry) return false
  const h    = (p.height ?? '').toLowerCase()
  const isHC = h.includes('high') || h.includes('hc')
  const num  = (p.size ?? '').match(/\d+/)?.[0] ?? ''
  return num === entry.sizeKey && isHC === entry.highCube
}

function matchesCondition(p: WpApiProduct, i: number): boolean {
  const cond = conditions[i]?.name
  const pc   = (p.condition ?? '').toLowerCase()
  if (cond === 'New') return pc.includes('new') || pc.includes('one') || pc.includes('trip')
  return !pc.includes('new') && !pc.includes('trip')
}

function matchesGrade(p: WpApiProduct, i: number): boolean {
  const entry = grades[i]
  if (!entry) return false
  const pg = (p.grade ?? '').toLowerCase()
  const gk = entry.gradeKey.toLowerCase()
  if (gk === 'as is') return pg.includes('as is') || pg.includes('as-is') || pg === ''
  if (gk === 'wind')  return pg.includes('wind') || pg.includes('wwt') || pg.includes('water')
  if (gk === 'cargo') return pg.includes('cargo')
  if (gk === 'iicl')  return pg.includes('iicl')
  return false
}

function termMatch(v: WpApiProduct, termValue: string): boolean {
  return (v.payment_term ?? []).some(t => String(t).match(/\d+/)?.[0] === termValue)
}

function findBestMatch(
  pool:     WpApiProduct[],
  sizeIdx:  number,
  condIdx:  number,
  gradeIdx: number,
): WpApiProduct | undefined {
  return (
    pool.find(p => matchesSize(p, sizeIdx) && matchesCondition(p, condIdx) && matchesGrade(p, gradeIdx)) ??
    pool.find(p => matchesSize(p, sizeIdx) && matchesCondition(p, condIdx)) ??
    pool.find(p => matchesSize(p, sizeIdx)) ??
    pool[0]
  )
}

// Prevents downstream dimensions from being left on a now-unavailable option
// when an upstream dimension changes (e.g. size → condition becomes invalid,
// or condition → grade becomes invalid). Runs before setSelection so the first
// click always lands in a consistent state.
function clampSelection(next: Selection, pool: WpApiProduct[]): Selection {
  let { sizeIdx, condIdx, gradeIdx } = next

  const condValid = pool.some(p => matchesSize(p, sizeIdx) && matchesCondition(p, condIdx))
  if (!condValid) {
    condIdx = conditions.findIndex((_, i) => pool.some(p => matchesSize(p, sizeIdx) && matchesCondition(p, i)))
    if (condIdx === -1) condIdx = 0
  }

  const gradeValid = pool.some(p =>
    matchesSize(p, sizeIdx) && matchesCondition(p, condIdx) && matchesGrade(p, gradeIdx)
  )
  if (!gradeValid) {
    gradeIdx = grades.findIndex((_, i) =>
      pool.some(p => matchesSize(p, sizeIdx) && matchesCondition(p, condIdx) && matchesGrade(p, i))
    )
    if (gradeIdx === -1) gradeIdx = 0
  }

  return { ...next, condIdx, gradeIdx }
}

// ─── option button ────────────────────────────────────────────────────────────

function OptionBtn({
  entry,
  className = '',
}: {
  entry:     OptionEntry
  className?: string
}) {
  return (
    <button
      type="button"
      disabled={!entry.available}
      onClick={entry.onSelect}
      className={`text-left border-2 rounded-lg p-3 transition-all ${className} ${
        !entry.available
          ? 'opacity-35 cursor-not-allowed border-theme-border bg-theme-bg'
          : entry.active
            ? 'border-theme-primary bg-theme-primary-light'
            : 'border-theme-border bg-theme-bg hover:border-theme-primary hover:-translate-y-0.5'
      }`}
    >
      <span className={`block font-extrabold text-sm ${entry.active && entry.available ? 'text-theme-primary' : 'text-theme-dark'}`}>
        {entry.label}
      </span>
      {entry.sublabel && (
        <span className="block text-[11px] text-theme-muted mt-0.5">{entry.sublabel}</span>
      )}
    </button>
  )
}

// ─── component ────────────────────────────────────────────────────────────────

type Props = {
  product:         WpSingleProduct
  categoryLabel:   string
  relatedProducts: WpApiProduct[]
  onVariantChange?: (product: WpApiProduct) => void
}

export function ProductInfoPanel({ product, categoryLabel, relatedProducts, onVariantChange }: Props) {

  const { addItem } = useCart()

  // The currently matched product — starts as the page product, updates on every option change
  const [activeProduct, setActiveProduct] = useState<WpApiProduct>(product)

  const [selection, setSelection] = useState<Selection>(() => ({
    tab:      product.payment_type === 'rental' ? 'rent' : (product.payment_type as PriceTab) ?? 'buy',
    sizeIdx:  sizeToIndex(product.size ?? '', product.height),
    condIdx:  conditionToIndex(product.condition),
    gradeIdx: gradeToGradeIndex(product.grade),
    rentTerm: RENT_TERMS[0].value,
    rtoTerm:  RTO_TERMS[0].value,
  }))

  const [zip,            setZip]            = useState('')
  const [deliveryResult, setDeliveryResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [added,          setAdded]          = useState(false)

  // When the shell swaps to a different product, reset both states
  useEffect(() => {
    setActiveProduct(product)
    setSelection(prev => ({
      ...prev,
      tab:      product.payment_type === 'rental' ? 'rent' : (product.payment_type as PriceTab) ?? 'buy',
      sizeIdx:  sizeToIndex(product.size ?? '', product.height),
      condIdx:  conditionToIndex(product.condition),
      gradeIdx: gradeToGradeIndex(product.grade),
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.productID])

  // ── derived pools ───────────────────────────────────────────────────────────

  const rentVariants = useMemo(
    () => relatedProducts.filter(p => p.payment_type === 'rental'),
    [relatedProducts]
  )
  const rtoVariants = useMemo(
    () => relatedProducts.filter(p => p.payment_type === 'rto'),
    [relatedProducts]
  )
  const candidates = useMemo(() => {
    const type = selection.tab === 'rent' ? 'rental' : selection.tab
    return relatedProducts.filter(p => p.payment_type === type)
  }, [selection.tab, relatedProducts])

  // ── cascading availability ──────────────────────────────────────────────────

  const availableSizes = useMemo(
    () => sizes.map((_, i) => candidates.some(p => matchesSize(p, i))),
    [candidates]
  )

  const availableConditions = useMemo(
    () => conditions.map((_, i) =>
      candidates.some(p => matchesSize(p, selection.sizeIdx) && matchesCondition(p, i))
    ),
    [candidates, selection.sizeIdx]
  )

  const availableGrades = useMemo(
    () => grades.map((_, i) =>
      candidates.some(p =>
        matchesSize(p, selection.sizeIdx) &&
        matchesCondition(p, selection.condIdx) &&
        matchesGrade(p, i)
      )
    ),
    [candidates, selection.sizeIdx, selection.condIdx]
  )

  const rentTermOptions = useMemo(
    () => RENT_TERMS.map(term => ({
      ...term,
      available: rentVariants.some(v => termMatch(v, term.value)),
      variant:
        rentVariants.find(v => termMatch(v, term.value) && matchesSize(v, selection.sizeIdx)) ??
        rentVariants.find(v => termMatch(v, term.value)),
    })),
    [rentVariants, selection.sizeIdx]
  )

  const rtoTermOptions = useMemo(
    () => RTO_TERMS.map(term => ({
      ...term,
      available: rtoVariants.some(v => termMatch(v, term.value)),
      variant:
        rtoVariants.find(v => termMatch(v, term.value) && matchesSize(v, selection.sizeIdx)) ??
        rtoVariants.find(v => termMatch(v, term.value)),
    })),
    [rtoVariants, selection.sizeIdx]
  )

  // ── unified handler ─────────────────────────────────────────────────────────

  const handleSelect = useCallback((patch: Partial<Selection>) => {
    const type = ({ ...selection, ...patch } as Selection).tab
    const poolType = type === 'rent' ? 'rental' : type
    const pool = relatedProducts.filter(p => p.payment_type === poolType)

    // Clamp before setting state — keeps downstream dimensions valid on the first click
    const next = clampSelection({ ...selection, ...patch }, pool)
    setSelection(next)

    let match: WpApiProduct | undefined

    if (next.tab === 'rent') {
      match =
        pool.find(v => termMatch(v, next.rentTerm) && matchesSize(v, next.sizeIdx) && matchesCondition(v, next.condIdx)) ??
        pool.find(v => termMatch(v, next.rentTerm) && matchesSize(v, next.sizeIdx)) ??
        pool.find(v => termMatch(v, next.rentTerm)) ??
        pool[0]
    } else if (next.tab === 'rto') {
      match =
        pool.find(v => termMatch(v, next.rtoTerm) && matchesSize(v, next.sizeIdx) && matchesCondition(v, next.condIdx)) ??
        pool.find(v => termMatch(v, next.rtoTerm) && matchesSize(v, next.sizeIdx)) ??
        pool.find(v => termMatch(v, next.rtoTerm)) ??
        pool[0]
    } else {
      match = findBestMatch(pool, next.sizeIdx, next.condIdx, next.gradeIdx)
    }

    if (match) {
      setActiveProduct(match)
      onVariantChange?.(match)
    }
  }, [selection, relatedProducts, onVariantChange])

  // ── product options object ──────────────────────────────────────────────────
  // Regenerates on every selection change. Each group describes one row of UI:
  // which buttons to render, which are active, which are disabled, and the callback.

  const productOptions = useMemo((): OptionsGroup[] => {
    const groups: OptionsGroup[] = []

    groups.push({
      id:     'size',
      title:  'Select Size',
      layout: 'grid-3',
      options: sizes.map((s, i) => ({
        key:      s.name,
        label:    s.name,
        sublabel: s.desc,
        active:   selection.sizeIdx === i,
        available: availableSizes[i],
        onSelect: () => handleSelect({ sizeIdx: i }),
      })),
    })

    if (selection.tab === 'buy' || selection.tab === 'rto') {
      groups.push({
        id:     'condition',
        title:  'Select Condition',
        layout: 'flex',
        options: conditions.map((c, i) => ({
          key:      c.name,
          label:    c.name,
          sublabel: c.desc,
          active:   selection.condIdx === i,
          available: availableConditions[i],
          onSelect: () => handleSelect({ condIdx: i }),
        })),
      })

      groups.push({
        id:     'grade',
        title:  'Select Grade',
        layout: 'grid-2',
        options: grades.map((g, i) => ({
          key:      g.name,
          label:    g.name,
          sublabel: g.desc,
          active:   selection.gradeIdx === i,
          available: availableGrades[i],
          onSelect: () => handleSelect({ gradeIdx: i }),
        })),
      })
    }

    if (selection.tab === 'rent') {
      groups.push({
        id:     'rentTerm',
        title:  'Select Payment Term',
        layout: 'flex',
        options: rentTermOptions.map(term => ({
          key:      term.value,
          label:    term.label,
          sublabel: term.variant ? `$${term.variant.sale_price || term.variant.product_price}/mo` : undefined,
          active:   selection.rentTerm === term.value,
          available: term.available,
          onSelect: () => handleSelect({ rentTerm: term.value }),
        })),
      })
    }

    if (selection.tab === 'rto') {
      groups.push({
        id:     'rtoTerm',
        title:  'Select Payment Term',
        layout: 'flex',
        options: rtoTermOptions.map(term => ({
          key:      term.value,
          label:    term.label,
          sublabel: term.variant ? `$${term.variant.sale_price || term.variant.product_price}/mo` : undefined,
          active:   selection.rtoTerm === term.value,
          available: term.available,
          onSelect: () => handleSelect({ rtoTerm: term.value }),
        })),
      })
    }

    return groups
  }, [
    selection,
    availableSizes, availableConditions, availableGrades,
    rentTermOptions, rtoTermOptions,
    handleSelect,
  ])

  // ── price display ───────────────────────────────────────────────────────────

  const priceDisplay = useMemo(() => ({
    price:  `$${activeProduct.sale_price || activeProduct.product_price}`,
    suffix: selection.tab === 'buy' ? '' : '/mo',
    note: {
      buy:  '+ Delivery fee based on your location · No sales tax in most states',
      rent: 'Delivery & pickup included · Flexible terms',
      rto:  'Own it at end of term · No credit check required',
    }[selection.tab],
  }), [activeProduct.sale_price, activeProduct.product_price, selection.tab])

  const rating = parseFloat(product.ratings) || 0

  function checkDelivery() {
    setDeliveryResult(
      /^\d{5}$/.test(zip)
        ? { ok: true,  msg: `Delivery available to ${zip} — estimated 2–3 business days` }
        : { ok: false, msg: 'Please enter a valid 5-digit ZIP code' }
    )
  }

  function handleAddToCart() {
    const orderType =
      selection.tab === 'rent' ? `Rental · ${selection.rentTerm} Months` :
      selection.tab === 'rto'  ? `Rent-to-Own · ${selection.rtoTerm} Months` :
      'Purchase'

    addItem({
      id:        String(activeProduct.productID),
      name:      activeProduct.container_title,
      price:     parseFloat(activeProduct.sale_price || activeProduct.product_price) || 0,
      quantity:  1,
      sku:       activeProduct.sku,
      size:      sizes[selection.sizeIdx]?.name ?? activeProduct.size,
      condition: activeProduct.condition,
      orderType,
      image:     activeProduct.thumbnail_url,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // ── render ──────────────────────────────────────────────────────────────────

  const layoutClass: Record<OptionsGroup['layout'], string> = {
    'grid-3': 'grid grid-cols-3 gap-2',
    'grid-2': 'grid grid-cols-2 gap-2',
    'flex':   'flex flex-wrap gap-2',
  }

  return (
    <div className="w-full">
      {/* Category label */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-theme-primary whitespace-nowrap">
          {categoryLabel}
        </span>
        <span className="flex-1 h-px bg-theme-primary-light" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none mb-2">
        {product.container_title}
      </h1>
      <p className="text-xs text-theme-muted mb-3">
        SKU: {product.sku} · {product.location}
      </p>

      <div className="flex items-center gap-2 mb-5">
        <Stars count={Math.round(rating)} />
        <span className="text-sm text-theme-muted">
          {product.ratings} · <a href="#reviews" className="text-theme-primary underline underline-offset-2">{product.review_count} Reviews</a>
        </span>
      </div>

      {/* Availability */}
      <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-md px-4 py-2.5 mb-5">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
        <span className="text-sm font-bold text-emerald-700">In Stock — Ready to Ship</span>
        <span className="text-xs text-emerald-600/80 ml-auto hidden sm:inline">Delivers in 1–5 business days</span>
      </div>

      {/* Price tabs */}
      <div className="grid grid-cols-3 border border-theme-border rounded-t-md overflow-hidden">
        {(['buy', 'rent', 'rto'] as PriceTab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSelect({ tab: key })}
            className={`py-2.5 px-1 text-center border-r last:border-r-0 border-theme-border transition-colors
              ${selection.tab === key ? 'bg-theme-primary text-white' : 'bg-theme-bg text-theme-muted hover:bg-theme-subtle'}`}
          >
            <span className="block font-bold text-sm">
              {key === 'buy' ? 'Purchase' : key === 'rent' ? 'Rent' : 'Rent-to-Own'}
            </span>
            <span className="block text-[10px] opacity-75 mt-0.5">
              {key === 'buy' ? 'Own outright' : key === 'rent' ? 'Monthly flex' : 'Build equity'}
            </span>
          </button>
        ))}
      </div>

      {/* Price display — driven by activeProduct */}
      <div className="bg-theme-subtle border border-t-0 border-theme-border rounded-b-lg p-4 sm:p-5 mb-5">
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          <strong className="text-3xl sm:text-4xl font-extrabold tracking-tight">{priceDisplay.price}</strong>
          {priceDisplay.suffix && <span className="text-lg text-theme-muted">{priceDisplay.suffix}</span>}
        </div>
        <p className="text-xs text-theme-muted">{priceDisplay.note}</p>
      </div>

      {/* Option groups — generated from productOptions */}
      {productOptions.map((group) => (
        <div key={group.id} className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wide text-theme-mid mb-2">{group.title}</p>
          <div className={layoutClass[group.layout]}>
            {group.options.map((entry) => (
              <OptionBtn
                key={entry.key}
                entry={entry}
                className={group.layout === 'flex' ? 'flex-1 min-w-27.5' : ''}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Delivery ZIP */}
      <div className="bg-theme-subtle border border-theme-border rounded-lg p-4 mb-5 focus-within:border-theme-primary transition-colors">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-theme-mid mb-2.5">
          <Truck className="w-3.5 h-3.5 text-theme-primary" />
          Check Delivery to Your ZIP Code
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            onKeyDown={(e) => e.key === 'Enter' && checkDelivery()}
            placeholder="Enter ZIP code"
            className="flex-1 min-w-0 border border-theme-border rounded px-3 py-2 text-sm bg-theme-bg text-theme-dark outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/10 transition-colors"
          />
          <button
            type="button"
            onClick={checkDelivery}
            className="bg-theme-primary hover:bg-theme-primary-dark text-white text-sm font-bold px-4 sm:px-5 rounded transition-colors whitespace-nowrap"
          >
            Check
          </button>
        </div>
        {deliveryResult && (
          <p className={`flex items-center gap-1.5 text-xs font-semibold mt-2 ${deliveryResult.ok ? 'text-emerald-600' : 'text-theme-primary'}`}>
            {deliveryResult.ok ? '✓' : '⚠'} {deliveryResult.msg}
          </p>
        )}
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-2.5 mb-5">
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full py-3.5 rounded-md text-lg sm:text-xl font-extrabold text-white bg-theme-primary hover:bg-theme-primary-dark hover:-translate-y-0.5 active:translate-y-0 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {added
            ? <>✓ Added to Cart!</>
            : <><ShoppingCart className="w-5 h-5" /> Add to Cart — ${activeProduct.sale_price || activeProduct.product_price}</>
          }
        </button>
        <button type="button" className="w-full py-3 rounded-md text-base sm:text-lg font-bold border-2 border-theme-border hover:border-theme-primary hover:text-theme-primary transition-colors flex items-center justify-center gap-2">
          <ClipboardList className="w-4.5 h-4.5" /> Request a Free Quote
        </button>
        <button type="button" className="w-full py-3 rounded-md text-base sm:text-lg font-bold text-white bg-theme-dark hover:bg-black transition-colors flex items-center justify-center gap-2">
          <Phone className="w-4.5 h-4.5" /> Call (888) 977-9085 — Talk to an Expert
        </button>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap gap-2 mb-5">
        {trustBadges.map((b) => (
          <span
            key={b.label}
            className="flex items-center gap-1.5 text-xs text-theme-muted bg-theme-subtle border border-theme-border rounded px-2.5 py-1.5 hover:border-theme-primary hover:text-theme-primary transition-colors"
          >
            <b.Icon className="w-3.5 h-3.5" /> {b.label}
          </span>
        ))}
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-4 sm:gap-5 pt-3.5 border-t border-theme-border text-xs text-theme-muted flex-wrap">
        <button type="button" className="flex items-center gap-1.5 hover:text-theme-primary transition-colors"><Heart className="w-3.5 h-3.5" /> Save to Wishlist</button>
        <button type="button" className="flex items-center gap-1.5 hover:text-theme-primary transition-colors"><Share2 className="w-3.5 h-3.5" /> Share</button>
        <button type="button" className="flex items-center gap-1.5 hover:text-theme-primary transition-colors"><GitCompare className="w-3.5 h-3.5" /> Compare</button>
        <button type="button" className="flex items-center gap-1.5 hover:text-theme-primary transition-colors"><Printer className="w-3.5 h-3.5" /> Print Spec Sheet</button>
      </div>
    </div>
  )
}
