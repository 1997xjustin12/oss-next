'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Wrench, Shield, CheckCircle2, Truck, Headphones,
  Heart, Share2, GitCompare, Printer, MapPin, Calendar, ShoppingCart,
  ClipboardList, Phone, ChevronRight, Plus, Lock, CloudRain, Layers, Hammer,
  Ship, Maximize2, Snowflake, Star,
} from 'lucide-react'
import type { WpSingleProduct } from '@/types/product'
import { ProductImageGallery } from './ProductImageGallery'

const quickSpecs = [
  { label: 'Length', value: '20 ft' },
  { label: 'Width', value: '8 ft' },
  { label: 'Height', value: '8\'6"' },
  { label: 'Cu Ft', value: '1,170', accent: true },
  { label: 'Sq Ft', value: '160', accent: true },
  { label: 'Lbs Tare', value: '4,850', accent: true },
]

type PriceTab = 'buy' | 'rent' | 'rto'

const conditions = [
  { name: 'Wind & Watertight', desc: 'Structurally sound · Best value' },
  { name: 'Cargo Worthy', desc: 'IICL certified · Ship-ready' },
  { name: 'One-Trip', desc: 'Like new · Used once only' },
]

function gradeToConditionIndex(grade: string): number {
  const g = grade.toLowerCase()
  if (g.includes('one') && g.includes('trip')) return 2
  if (g.includes('cargo')) return 1
  return 0
}

const trustBadges = [
  { Icon: Shield, label: 'Satisfaction Guaranteed' },
  { Icon: CheckCircle2, label: 'No Hidden Fees' },
  { Icon: Truck, label: 'Fast Nationwide Delivery' },
  { Icon: Headphones, label: 'Expert Phone Support' },
]

const useCases = [
  'Residential Storage', 'Construction Sites', 'Farm & Agriculture', 'Retail Overflow',
  'Workshop Space', 'Event Storage', 'Moving & Relocation', 'Disaster Relief',
  'Military Storage', 'Pop-up Retail',
]

const features = [
  { Icon: Shield, title: 'Cor-Ten Steel Construction', desc: 'Military-grade weathering steel resists corrosion and withstands extreme climates worldwide.' },
  { Icon: CheckCircle2, title: 'ISO Certified & CSC Plated', desc: 'Meets international shipping standards. CSC safety approval plate included on cargo-worthy units.' },
  { Icon: Lock, title: 'Lockbox Ready & Secure', desc: 'Standard double cargo doors with lockrod system. Compatible with standard container padlocks.' },
  { Icon: CloudRain, title: '100% Wind & Watertight', desc: 'All used containers are inspected and certified wind & watertight before delivery to your site.' },
  { Icon: Layers, title: 'Hardwood Timber Floor', desc: 'Durable tropical hardwood floor supports forklifts up to 9,900 lbs. Easy to clean and replace.' },
  { Icon: Hammer, title: 'Modification Friendly', desc: 'Add doors, windows, ventilation, insulation, shelving, or electrical. We offer custom modifications.' },
]

const specsList = [
  { key: 'External Length', val: '20', unit: 'ft (6.058 m)' },
  { key: 'External Width', val: '8', unit: 'ft (2.438 m)' },
  { key: 'External Height', val: '8\'6"', unit: '(2.591 m)' },
  { key: 'Internal Length', val: '19\'4"', unit: '(5.900 m)' },
  { key: 'Internal Width', val: '7\'8"', unit: '(2.352 m)' },
  { key: 'Internal Height', val: '7\'10"', unit: '(2.393 m)' },
  { key: 'Floor Area', val: '160', unit: 'sq ft (14.87 m²)' },
  { key: 'Volume', val: '1,170', unit: 'cu ft (33.2 m³)' },
  { key: 'Tare Weight', val: '4,850', unit: 'lbs (2,200 kg)' },
  { key: 'Max Payload', val: '47,900', unit: 'lbs (21,727 kg)' },
  { key: 'Door Opening Width', val: '7\'8"', unit: '(2.340 m)' },
  { key: 'Door Opening Height', val: '7\'5"', unit: '(2.280 m)' },
  { key: 'Wall Thickness', val: '2mm', unit: 'Cor-Ten Steel' },
  { key: 'Floor Material', val: '28mm', unit: 'Tropical Hardwood' },
  { key: 'ISO Standard', val: '668', unit: 'Type 1C' },
]

const conditionTable = [
  { grade: 'One-Trip', badge: 'bg-emerald-600', desc: 'Used once overseas — essentially new', wear: 'None', wwt: true, cw: true, best: 'Modifications, retail, premium use' },
  { grade: 'Cargo Worthy', badge: 'bg-amber-500', desc: 'IICL certified, fully functional', wear: 'Minor', wwt: true, cw: true, best: 'Shipping, international transport' },
  { grade: 'Wind & Watertight', badge: 'bg-neutral-500', desc: 'Structurally sound, weather-tight', wear: 'Moderate', wwt: true, cw: false, best: 'Storage, construction sites, farms' },
]

const deliveryInfo = [
  { Icon: Truck, title: 'Tilt-Bed Delivery', desc: 'We use specialized tilt-bed trucks to place containers precisely where you need them — no crane required in most cases.' },
  { Icon: MapPin, title: '130+ Depot Locations', desc: 'With depots across all 50 states, we always find the closest container to minimize your delivery cost and timeline.' },
  { Icon: Calendar, title: '1–5 Business Days', desc: 'Most orders deliver within 1–5 business days. Rush delivery available. We coordinate a delivery window with you directly.' },
]

const siteTips = [
  'Ensure a flat, level surface (gravel, asphalt, or concrete ideal)',
  'Allow at least 25ft of clearance for the delivery truck',
  'Mark your preferred placement location before delivery day',
  'Check local zoning regulations for container placement rules',
  'Our drivers will call 30–60 minutes before arrival',
]

const relatedProducts = [
  { Icon: Ship, title: '40ft Standard Container', desc: 'Double the space for larger projects and business storage.', price: 'From $2,000', cta: 'View' },
  { Icon: Maximize2, title: '20ft High Cube', desc: 'Extra 1ft of height — perfect for taller inventory and work spaces.', price: 'From $1,850', cta: 'View' },
  { Icon: Snowflake, title: '20ft Refrigerated', desc: 'Temperature-controlled for food, pharma, and sensitive goods.', price: 'Call for Price', cta: 'Inquire' },
  { Icon: Wrench, title: 'Container Accessories', desc: 'Locks, ramps, vents, shelving, lighting kits, and more.', price: 'From $29', cta: 'Shop' },
]

const ratingBars = [
  { stars: 5, pct: 88, count: 189 },
  { stars: 4, pct: 8, count: 17 },
  { stars: 3, pct: 3, count: 6 },
  { stars: 2, pct: 1, count: 2 },
  { stars: 1, pct: 0, count: 0 },
]

const reviewsList = [
  { initials: 'MJ', color: 'bg-theme-primary', name: 'Mark J.', role: 'Construction Manager · Texas', date: 'March 2025', text: 'Ordered a WWT 20ft for a job site — arrived in 3 days, exactly as described. The delivery driver was incredibly professional and placed it perfectly on our gravel pad. Will be ordering again.' },
  { initials: 'ST', color: 'bg-theme-dark-2', name: 'Sarah T.', role: 'Farm Owner · Missouri', date: 'January 2025', text: "This is my third container from Onsite Storage. The price is always the lowest I can find, and the quality has been consistent every time. My 20ft is now a tack room and I couldn't be happier." },
  { initials: 'RK', color: 'bg-theme-accent', name: 'Robert K.', role: 'Retail Store Owner · California', date: 'November 2024', text: 'Bought a one-trip unit and had it modified with a roll-up door and shelving. The team was super helpful throughout the whole process. Container looks brand new.' },
]

const faqs = [
  { q: 'How much does it cost to deliver a 20ft container?', a: 'Delivery costs vary based on your ZIP code and distance from our nearest depot. Most deliveries range from $150–$500. Enter your ZIP code above to get an estimated delivery fee. We always quote delivery costs upfront with no hidden charges.' },
  { q: 'Do I need a permit to place a shipping container on my property?', a: "Permit requirements vary by city, county, and state. Temporary use (under 30–90 days) typically doesn't require a permit. Permanent placement often does. We recommend checking with your local zoning office. Our team can guide you through this process." },
  { q: "What's the difference between Wind & Watertight and Cargo Worthy?", a: 'Wind & Watertight (WWT) containers are structurally sound and fully weather-sealed but may have cosmetic wear. Cargo Worthy (CW) containers meet IICL standards for international shipping, with less wear and a safety certification plate. For storage purposes, WWT is often the best value.' },
  { q: 'How long does delivery take?', a: "Most containers deliver within 1–5 business days of your order. We'll contact you to schedule a delivery window that works for you. Rush delivery is available in many areas. With 130+ depot locations, we're likely already near you." },
  { q: 'Can I modify my shipping container?', a: 'Absolutely. We offer custom modifications including doors, windows, ventilation, insulation, electrical, roll-up doors, shelving, and more. We recommend starting with a One-Trip or Cargo Worthy unit for modifications. Contact our team to discuss your project.' },
]

const bodyTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'specs', label: 'Specifications' },
  { id: 'conditions', label: 'Container Conditions' },
  { id: 'delivery', label: 'Delivery Info' },
] as const

type BodyTab = typeof bodyTabs[number]['id']

type Props = { product: WpSingleProduct }

function Stars({ count, className = 'w-4 h-4' }: { count: number; className?: string }) {
  return (
    <div className="flex items-center gap-0.5 text-theme-primary">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${className} ${i < count ? 'fill-current' : 'fill-none opacity-30'}`} />
      ))}
    </div>
  )
}

export function ProductDetail({ product }: Props) {
  const allImages = [product.thumbnail_url, ...product.galleries].filter(Boolean)

  const priceData: Record<PriceTab, { price: string; was: string; save: string; suffix: string; note: string }> = {
    buy: { price: `$${product.product_price}`, was: '', save: '', suffix: '', note: '+ Delivery fee based on your location · No sales tax in most states' },
    rent: { price: '$95', was: '', save: '', suffix: '/mo', note: '3-month minimum · Month-to-month after · Delivery & pickup included' },
    rto: { price: '$79.99', was: '', save: '', suffix: '/mo', note: '36-month term · Own it at end of term · No credit check required' },
  }

  const [priceTab, setPriceTab] = useState<PriceTab>('buy')
  const [condition, setCondition] = useState(gradeToConditionIndex(product.grade))
  const [zip, setZip] = useState('')
  const [deliveryResult, setDeliveryResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [bodyTab, setBodyTab] = useState<BodyTab>('overview')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
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
    <main className="bg-theme-bg text-theme-dark">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 flex-wrap px-4 sm:px-[5%] py-3 text-xs sm:text-sm text-theme-muted bg-theme-subtle border-b border-theme-border">
        <Link href="/" className="hover:text-theme-primary transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
        <Link href="/product" className="hover:text-theme-primary transition-colors">Shipping Containers For Sale</Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
        <span className="text-theme-dark font-semibold">{product.container_title}</span>
      </div>

      {/* PRODUCT GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-10 px-4 sm:px-[5%] py-8 sm:py-10">
        {/* GALLERY */}
        <div className="lg:sticky lg:top-6 self-start w-full">
          <ProductImageGallery
            images={allImages}
            title={product.container_title}
            tag={product.tag}
          />

          {/* QUICK SPECS */}
          <div className="grid grid-cols-3 gap-3 mt-5 bg-theme-dark rounded-lg p-4 sm:p-5 text-center">
            {quickSpecs.map((s) => (
              <div key={s.label}>
                <div className={`text-lg sm:text-2xl font-extrabold tracking-tight ${s.accent ? 'text-theme-primary' : 'text-white'}`}>
                  {s.value}
                </div>
                <div className="text-[10px] sm:text-[11px] text-white/45 uppercase tracking-wide mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PRODUCT INFO */}
        <div className="w-full">
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

          {/* AVAILABILITY */}
          <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-md px-4 py-2.5 mb-5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse flex-shrink-0" />
            <span className="text-sm font-bold text-emerald-700">In Stock — Ready to Ship</span>
            <span className="text-xs text-emerald-600/80 ml-auto hidden sm:inline">Delivers in 1–5 business days</span>
          </div>

          {/* PRICE TABS */}
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

          {/* CONDITION */}
          <p className="text-xs font-bold uppercase tracking-wide text-theme-mid mb-2">Select Condition</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {conditions.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setCondition(i)}
                className={`flex-1 min-w-[110px] text-left border-2 rounded-lg p-3 transition-all hover:-translate-y-0.5
                  ${condition === i ? 'border-theme-primary bg-theme-primary-light' : 'border-theme-border bg-theme-bg hover:border-theme-primary'}`}
              >
                <span className={`block font-extrabold text-sm ${condition === i ? 'text-theme-primary' : 'text-theme-dark'}`}>
                  {c.name}
                </span>
                <span className="block text-[11px] text-theme-muted mt-0.5">{c.desc}</span>
              </button>
            ))}
          </div>

          {/* DELIVERY ZIP */}
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
              <button onClick={checkDelivery} className="bg-theme-primary hover:bg-theme-primary-dark text-white text-sm font-bold px-4 sm:px-5 rounded transition-colors whitespace-nowrap">
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

          {/* TRUST MINI */}
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

          {/* ACTIONS ROW */}
          <div className="flex items-center gap-4 sm:gap-5 pt-3.5 border-t border-theme-border text-xs text-theme-muted flex-wrap">
            <button className="flex items-center gap-1.5 hover:text-theme-primary transition-colors"><Heart className="w-3.5 h-3.5" /> Save to Wishlist</button>
            <button className="flex items-center gap-1.5 hover:text-theme-primary transition-colors"><Share2 className="w-3.5 h-3.5" /> Share</button>
            <button className="flex items-center gap-1.5 hover:text-theme-primary transition-colors"><GitCompare className="w-3.5 h-3.5" /> Compare</button>
            <button className="flex items-center gap-1.5 hover:text-theme-primary transition-colors"><Printer className="w-3.5 h-3.5" /> Print Spec Sheet</button>
          </div>
        </div>
      </section>

      {/* PRODUCT BODY TABS */}
      <section className="px-4 sm:px-[5%] py-10 sm:py-16">
        <div className="flex gap-1 overflow-x-auto border-b-2 border-theme-border mb-8 -mx-1 px-1 scrollbar-none">
          {bodyTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setBodyTab(t.id)}
              className={`relative font-bold text-sm sm:text-base px-3 sm:px-5 py-3.5 whitespace-nowrap transition-colors
                ${bodyTab === t.id ? 'text-theme-primary' : 'text-theme-muted hover:text-theme-dark'}`}
            >
              {t.label}
              {bodyTab === t.id && <span className="absolute bottom-[-2px] left-0 right-0 h-[2.5px] bg-theme-primary rounded-t" />}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {bodyTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3.5">
                  The Most Versatile Container in Our Lineup
                </h2>
                <p className="text-sm sm:text-base text-theme-muted leading-relaxed mb-3.5">
                  Our 20ft standard shipping containers are the workhorse of the storage world. Compact enough to fit in most residential driveways, yet spacious enough for serious storage — 160 square feet of secure, lockable, weather-tight space.
                </p>
                <p className="text-sm sm:text-base text-theme-muted leading-relaxed">
                  Built from Cor-Ten steel to ISO specifications, these containers are designed to withstand the harshest conditions — from coastal salt spray to scorching desert heat. Whether you need temporary construction-site storage or a permanent solution, the 20ft delivers.
                </p>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight mb-3.5">Ideal For</h3>
                <div className="flex flex-wrap gap-2">
                  {useCases.map((u) => (
                    <span
                      key={u}
                      className="bg-theme-subtle border border-theme-border text-theme-accent px-3 py-1.5 rounded text-xs sm:text-sm font-semibold cursor-pointer hover:bg-theme-accent hover:text-white transition-colors"
                    >
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4">Key Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group flex gap-3.5 items-start p-4 sm:p-4.5 rounded-lg border border-theme-border bg-theme-subtle hover:border-theme-primary hover:-translate-y-0.5 transition-all"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-theme-primary-light flex items-center justify-center flex-shrink-0 group-hover:bg-theme-primary transition-colors">
                    <f.Icon className="w-4.5 h-4.5 text-theme-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base mb-1">{f.title}</h4>
                    <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SPECS */}
        {bodyTab === 'specs' && (
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4">Full Technical Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-theme-border rounded-lg overflow-hidden">
              {specsList.map((s, i) => (
                <div key={s.key} className={`p-4 sm:p-5 ${i % 2 === 0 ? 'bg-theme-bg' : 'bg-theme-subtle'}`}>
                  <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-theme-muted mb-1">{s.key}</div>
                  <div className="font-extrabold text-base sm:text-lg">
                    {s.val} <span className="text-xs font-normal text-theme-muted">{s.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONDITIONS */}
        {bodyTab === 'conditions' && (
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-2">Understanding Container Conditions</h3>
            <p className="text-sm sm:text-base text-theme-muted mb-6 leading-relaxed">
              All our containers are graded by condition. Choose the grade that matches your use case and budget.
            </p>
            <div className="overflow-x-auto rounded-lg border border-theme-border">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-theme-dark text-white text-left">
                    <th className="px-4 py-3 font-extrabold text-sm">Grade</th>
                    <th className="px-4 py-3 font-extrabold text-sm">Description</th>
                    <th className="px-4 py-3 font-extrabold text-sm">Wear</th>
                    <th className="px-4 py-3 font-extrabold text-sm">W&amp;T</th>
                    <th className="px-4 py-3 font-extrabold text-sm">Cargo Worthy</th>
                    <th className="px-4 py-3 font-extrabold text-sm">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {conditionTable.map((c, i) => (
                    <tr key={c.grade} className={`${i % 2 === 1 ? 'bg-theme-subtle' : 'bg-theme-bg'} hover:bg-theme-primary-light transition-colors`}>
                      <td className="px-4 py-3 border-t border-theme-border">
                        <span className={`text-white text-[11px] font-bold uppercase px-2 py-1 rounded ${c.badge}`}>{c.grade}</span>
                      </td>
                      <td className="px-4 py-3 border-t border-theme-border text-theme-mid">{c.desc}</td>
                      <td className="px-4 py-3 border-t border-theme-border text-theme-mid">{c.wear}</td>
                      <td className="px-4 py-3 border-t border-theme-border">
                        <span className={c.wwt ? 'text-emerald-600 font-bold' : 'text-theme-muted'}>{c.wwt ? '✓ Yes' : '✗ No'}</span>
                      </td>
                      <td className="px-4 py-3 border-t border-theme-border">
                        <span className={c.cw ? 'text-emerald-600 font-bold' : 'text-theme-muted'}>{c.cw ? '✓ Yes' : '✗ No'}</span>
                      </td>
                      <td className="px-4 py-3 border-t border-theme-border text-theme-mid">{c.best}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DELIVERY */}
        {bodyTab === 'delivery' && (
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4">Delivery Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 bg-theme-dark rounded-xl p-6 sm:p-8 mb-6 text-white">
              {deliveryInfo.map((d) => (
                <div key={d.title} className="text-center">
                  <d.Icon className="w-7 h-7 mx-auto mb-2.5 text-theme-primary" />
                  <div className="font-extrabold text-base sm:text-lg mb-1">{d.title}</div>
                  <p className="text-xs sm:text-sm text-white/55 leading-relaxed">{d.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-theme-primary-light border border-theme-border rounded-lg p-4 sm:p-5">
              <h4 className="text-base sm:text-lg font-extrabold text-theme-primary mb-2">Site Preparation Tips</h4>
              <ul className="text-sm text-theme-mid leading-relaxed space-y-1.5 list-disc pl-5">
                {siteTips.map((tip) => <li key={tip}>{tip}</li>)}
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* RELATED PRODUCTS */}
      <section className="px-4 sm:px-[5%] py-10 sm:py-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">You May Also Need</h2>
          <Link href="/product" className="text-xs sm:text-sm font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors whitespace-nowrap">
            View All Containers →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedProducts.map((p) => (
            <div
              key={p.title}
              className="rounded-lg border border-theme-border bg-theme-bg overflow-hidden cursor-pointer hover:border-theme-primary hover:-translate-y-1 hover:shadow-lg transition-all"
            >
              <div className="h-32 flex items-center justify-center bg-theme-subtle">
                <p.Icon className="w-10 h-10 text-theme-muted" strokeWidth={1.5} />
              </div>
              <div className="p-3.5">
                <h4 className="font-extrabold text-base mb-1">{p.title}</h4>
                <p className="text-xs text-theme-muted mb-3 leading-relaxed">{p.desc}</p>
                <div className="flex items-center justify-between pt-2.5 border-t border-theme-border">
                  <span className="font-extrabold text-base">{p.price}</span>
                  <button className="bg-theme-dark text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-theme-primary transition-colors">
                    {p.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="px-4 sm:px-[5%] py-10 sm:py-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Customer Reviews</h2>
          <a href="#" className="text-xs sm:text-sm font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors whitespace-nowrap">
            Write a Review →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-6 sm:gap-8 items-center bg-theme-subtle border border-theme-border rounded-xl p-6 sm:p-7 mb-7">
          <div className="text-center">
            <div className="text-5xl sm:text-6xl font-extrabold tracking-tight">4.9</div>
            <Stars count={5} className="w-5 h-5" />
            <div className="text-xs text-theme-muted mt-1">214 verified reviews</div>
          </div>
          <div className="flex flex-col gap-2">
            {ratingBars.map((r) => (
              <div key={r.stars} className="flex items-center gap-2.5 text-sm">
                <span className="w-8 text-right font-semibold text-theme-mid">{r.stars}★</span>
                <div className="flex-1 h-2 bg-theme-border rounded-full overflow-hidden">
                  <div className="h-full bg-theme-primary rounded-full transition-all duration-700" style={{ width: `${r.pct}%` }} />
                </div>
                <span className="w-7 text-theme-muted text-xs">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          {reviewsList.map((rev) => (
            <div
              key={rev.name}
              className="bg-theme-bg border border-theme-border rounded-lg p-4 sm:p-5 hover:border-theme-primary hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2.5 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0 ${rev.color}`}>
                    {rev.initials}
                  </div>
                  <div>
                    <span className="block font-bold text-sm">{rev.name}</span>
                    <span className="block text-xs text-theme-muted">{rev.role}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Stars count={5} className="w-3.5 h-3.5" />
                  <div className="text-[11px] text-theme-muted mt-0.5">{rev.date}</div>
                </div>
              </div>
              <p className="text-sm text-theme-mid italic leading-relaxed">&ldquo;{rev.text}&rdquo;</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded mt-2.5">
                <CheckCircle2 className="w-3 h-3" /> Verified Purchase
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-[5%] py-10 sm:py-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
          <a href="#" className="text-xs sm:text-sm font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors whitespace-nowrap">
            View All FAQs →
          </a>
        </div>
        <div className="border border-theme-border rounded-lg overflow-hidden divide-y divide-theme-border">
          {faqs.map((f, i) => {
            const open = openFaq === i
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className={`w-full text-left flex items-center justify-between gap-4 px-4 sm:px-5 py-4 transition-colors
                    ${open ? 'bg-theme-primary-light text-theme-primary' : 'bg-theme-bg hover:bg-theme-primary-light hover:text-theme-primary'}`}
                >
                  <span className="font-bold text-sm sm:text-[15px]">{f.q}</span>
                  <Plus className={`w-4.5 h-4.5 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-45 text-theme-primary' : 'text-theme-muted'}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60' : 'max-h-0'}`}>
                  <p className="text-sm text-theme-muted leading-relaxed px-4 sm:px-5 pb-4">{f.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
