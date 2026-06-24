'use client'

import { useState } from 'react'
import {
  Shield, CheckCircle2, Truck, Headphones,
  Heart, Share2, GitCompare, Printer,
  ShoppingCart, ClipboardList, Phone,
} from 'lucide-react'
import type { WpSingleProduct } from '@/types/product'
import { Stars } from './Stars'

type PriceTab = 'buy' | 'rent' | 'rto'

const conditions = [
  { name: 'Used', desc: 'Inspected & weather-tight · Best value' },
  { name: 'New', desc: 'One-trip · Like new condition' },
]

const sizes = [
  { name: "20' Standard", desc: '160 sq ft · Most popular' },
  { name: "40' Standard", desc: '320 sq ft · Double the space' },
  { name: "40' High Cube", desc: '344 sq ft · Extra 1ft height' },
]

const grades = [
  { name: 'AS IS', desc: 'No certification · Sold as-is' },
  { name: 'Wind & Water Tight', desc: 'Weather-sealed · Structurally sound' },
  { name: 'Cargo Worthy', desc: 'IICL certified · Ship-ready' },
  { name: 'IICL', desc: 'Premium grade · Highest standard' },
]

const trustBadges = [
  { Icon: Shield, label: 'Satisfaction Guaranteed' },
  { Icon: CheckCircle2, label: 'No Hidden Fees' },
  { Icon: Truck, label: 'Fast Nationwide Delivery' },
  { Icon: Headphones, label: 'Expert Phone Support' },
]

function sizeToIndex(size: string): number {
  const s = size.toLowerCase()
  if (s.includes('40') && (s.includes('high') || s.includes('hc'))) return 2
  if (s.includes('40')) return 1
  return 0
}

function gradeToConditionIndex(grade: string): number {
  const g = grade.toLowerCase()
  if (g.includes('one') && g.includes('trip')) return 1
  return 0
}

function gradeToGradeIndex(grade: string): number {
  const g = grade.toLowerCase()
  if (g.includes('iicl')) return 3
  if (g.includes('cargo')) return 2
  if (g.includes('wind') || g.includes('wwt') || g.includes('water')) return 1
  return 0
}

type Props = { product: WpSingleProduct }

export function ProductInfoPanel({ product }: Props) {
  const priceData: Record<PriceTab, { price: string; was: string; save: string; suffix: string; note: string }> = {
    buy: { price: `$${product.product_price}`, was: '', save: '', suffix: '', note: '+ Delivery fee based on your location · No sales tax in most states' },
    rent: { price: '$95', was: '', save: '', suffix: '/mo', note: '3-month minimum · Month-to-month after · Delivery & pickup included' },
    rto: { price: '$79.99', was: '', save: '', suffix: '/mo', note: '36-month term · Own it at end of term · No credit check required' },
  }

  const [priceTab, setPriceTab] = useState<PriceTab>('buy')
  const [selectedSize, setSelectedSize] = useState(sizeToIndex(product.size ?? ''))
  const [condition, setCondition] = useState(gradeToConditionIndex(product.grade))
  const [grade, setGrade] = useState(gradeToGradeIndex(product.grade))
  const [zip, setZip] = useState('')
  const [deliveryResult, setDeliveryResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [added, setAdded] = useState(false)

  const price = priceData[priceTab]
  const rating = parseFloat(product.ratings) || 0

  function checkDelivery() {
    if (/^\d{5}$/.test(zip)) {
      setDeliveryResult({ ok: true, msg: `Delivery available to ${zip} — estimated 2–3 business days` })
    } else {
      setDeliveryResult({ ok: false, msg: 'Please enter a valid 5-digit ZIP code' })
    }
  }

  function handleAddToCart() {
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="w-full">
      {/* Category label */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-theme-primary whitespace-nowrap">
          Shipping Containers For Sale
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
        {(Object.keys(priceData) as PriceTab[]).map((key) => (
          <button
            key={key}
            onClick={() => setPriceTab(key)}
            className={`py-2.5 px-1 text-center border-r last:border-r-0 border-theme-border transition-colors
              ${priceTab === key ? 'bg-theme-primary text-white' : 'bg-theme-bg text-theme-muted hover:bg-theme-subtle'}`}
          >
            <span className="block font-bold text-sm">{key === 'buy' ? 'Purchase' : key === 'rent' ? 'Rent' : 'Rent-to-Own'}</span>
            <span className="block text-[10px] opacity-75 mt-0.5">{key === 'buy' ? 'Own outright' : key === 'rent' ? 'Monthly flex' : 'Build equity'}</span>
          </button>
        ))}
      </div>
      <div className="bg-theme-subtle border border-t-0 border-theme-border rounded-b-lg p-4 sm:p-5 mb-5">
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          <strong className="text-3xl sm:text-4xl font-extrabold tracking-tight">{price.price}</strong>
          {price.suffix && <span className="text-lg text-theme-muted">{price.suffix}</span>}
          {price.was && <span className="text-lg text-theme-muted line-through">{price.was}</span>}
          {price.save && <span className="text-xs bg-theme-primary text-white px-2 py-0.5 rounded font-bold">{price.save}</span>}
        </div>
        <p className="text-xs text-theme-muted">{price.note}</p>
      </div>

      {/* Size selector */}
      <p className="text-xs font-bold uppercase tracking-wide text-theme-mid mb-2">Select Size</p>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {sizes.map((s, i) => (
          <button
            key={s.name}
            onClick={() => setSelectedSize(i)}
            className={`text-left border-2 rounded-lg p-3 transition-all hover:-translate-y-0.5
              ${selectedSize === i ? 'border-theme-primary bg-theme-primary-light' : 'border-theme-border bg-theme-bg hover:border-theme-primary'}`}
          >
            <span className={`block font-extrabold text-sm ${selectedSize === i ? 'text-theme-primary' : 'text-theme-dark'}`}>
              {s.name}
            </span>
            <span className="block text-[11px] text-theme-muted mt-0.5">{s.desc}</span>
          </button>
        ))}
      </div>

      {/* Condition selector */}
      <p className="text-xs font-bold uppercase tracking-wide text-theme-mid mb-2">Select Condition</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {conditions.map((c, i) => (
          <button
            key={c.name}
            onClick={() => setCondition(i)}
            className={`flex-1 min-w-27.5 text-left border-2 rounded-lg p-3 transition-all hover:-translate-y-0.5
              ${condition === i ? 'border-theme-primary bg-theme-primary-light' : 'border-theme-border bg-theme-bg hover:border-theme-primary'}`}
          >
            <span className={`block font-extrabold text-sm ${condition === i ? 'text-theme-primary' : 'text-theme-dark'}`}>
              {c.name}
            </span>
            <span className="block text-[11px] text-theme-muted mt-0.5">{c.desc}</span>
          </button>
        ))}
      </div>

      {/* Grade selector */}
      <p className="text-xs font-bold uppercase tracking-wide text-theme-mid mb-2">Select Grade</p>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {grades.map((g, i) => (
          <button
            key={g.name}
            onClick={() => setGrade(i)}
            className={`text-left border-2 rounded-lg p-3 transition-all hover:-translate-y-0.5
              ${grade === i ? 'border-theme-primary bg-theme-primary-light' : 'border-theme-border bg-theme-bg hover:border-theme-primary'}`}
          >
            <span className={`block font-extrabold text-sm ${grade === i ? 'text-theme-primary' : 'text-theme-dark'}`}>
              {g.name}
            </span>
            <span className="block text-[11px] text-theme-muted mt-0.5">{g.desc}</span>
          </button>
        ))}
      </div>

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
            onClick={checkDelivery}
            className="bg-theme-primary hover:bg-theme-primary-dark text-white text-sm font-bold px-4 sm:px-5 rounded transition-colors whitespace-nowrap"
          >
            Check
          </button>
        </div>
        {deliveryResult && (
          <div className={`flex items-center gap-1.5 text-xs font-semibold mt-2 ${deliveryResult.ok ? 'text-emerald-600' : 'text-theme-primary'}`}>
            {deliveryResult.ok ? '✓' : '⚠'} {deliveryResult.msg}
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-2.5 mb-5">
        <button
          onClick={handleAddToCart}
          className="w-full py-3.5 rounded-md text-lg sm:text-xl font-extrabold text-white bg-theme-primary hover:bg-theme-primary-dark hover:-translate-y-0.5 active:translate-y-0 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {added ? (
            <>✓ Added to Cart!</>
          ) : (
            <><ShoppingCart className="w-5 h-5" /> Add to Cart — ${product.product_price}</>
          )}
        </button>
        <button className="w-full py-3 rounded-md text-base sm:text-lg font-bold border-2 border-theme-border hover:border-theme-primary hover:text-theme-primary transition-colors flex items-center justify-center gap-2">
          <ClipboardList className="w-4.5 h-4.5" /> Request a Free Quote
        </button>
        <button className="w-full py-3 rounded-md text-base sm:text-lg font-bold text-white bg-theme-dark hover:bg-black transition-colors flex items-center justify-center gap-2">
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
        <button className="flex items-center gap-1.5 hover:text-theme-primary transition-colors"><Heart className="w-3.5 h-3.5" /> Save to Wishlist</button>
        <button className="flex items-center gap-1.5 hover:text-theme-primary transition-colors"><Share2 className="w-3.5 h-3.5" /> Share</button>
        <button className="flex items-center gap-1.5 hover:text-theme-primary transition-colors"><GitCompare className="w-3.5 h-3.5" /> Compare</button>
        <button className="flex items-center gap-1.5 hover:text-theme-primary transition-colors"><Printer className="w-3.5 h-3.5" /> Print Spec Sheet</button>
      </div>
    </div>
  )
}
