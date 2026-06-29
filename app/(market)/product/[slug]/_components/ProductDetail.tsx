import Link from 'next/link'
import { Wrench, Ship, Maximize2, Snowflake, CheckCircle2 } from 'lucide-react'
import type { WpSingleProduct, WpApiProduct } from '@/types/product'
import { ProductVariantShell } from './ProductVariantShell'
import { AccessoryDetail } from './AccessoryDetail'
import { BodyTabsSection } from './BodyTabsSection'
import { FaqAccordion } from './FaqAccordion'
import { Stars } from './Stars'

const CONTAINER_CATEGORIES = ['shipping-containers', 'generic-product-page']

const staticRelatedProducts = [
  { Icon: Ship,     title: '40ft Standard Container',   desc: 'Double the space for larger projects and business storage.',        price: 'From $2,000',   cta: 'View' },
  { Icon: Maximize2, title: '20ft High Cube',            desc: 'Extra 1ft of height — perfect for taller inventory and work spaces.', price: 'From $1,850',  cta: 'View' },
  { Icon: Snowflake, title: '20ft Refrigerated',         desc: 'Temperature-controlled for food, pharma, and sensitive goods.',      price: 'Call for Price', cta: 'Inquire' },
  { Icon: Wrench,   title: 'Container Accessories',     desc: 'Locks, ramps, vents, shelving, lighting kits, and more.',            price: 'From $29',      cta: 'Shop' },
]

const ratingBars = [
  { stars: 5, pct: 88, count: 189 },
  { stars: 4, pct: 8,  count: 17  },
  { stars: 3, pct: 3,  count: 6   },
  { stars: 2, pct: 1,  count: 2   },
  { stars: 1, pct: 0,  count: 0   },
]

const reviewsList = [
  { initials: 'MJ', color: 'bg-theme-primary',  name: 'Mark J.',   role: 'Construction Manager · Texas',    date: 'March 2025',    text: 'Ordered a WWT 20ft for a job site — arrived in 3 days, exactly as described. The delivery driver was incredibly professional and placed it perfectly on our gravel pad. Will be ordering again.' },
  { initials: 'ST', color: 'bg-theme-dark-2',   name: 'Sarah T.',  role: 'Farm Owner · Missouri',           date: 'January 2025',  text: "This is my third container from Onsite Storage. The price is always the lowest I can find, and the quality has been consistent every time. My 20ft is now a tack room and I couldn't be happier." },
  { initials: 'RK', color: 'bg-theme-accent',   name: 'Robert K.', role: 'Retail Store Owner · California', date: 'November 2024', text: 'Bought a one-trip unit and had it modified with a roll-up door and shelving. The team was super helpful throughout the whole process. Container looks brand new.' },
]

type Props = { product: WpSingleProduct; relatedProducts: WpApiProduct[] }

export function ProductDetail({ product, relatedProducts }: Props) {
  const isContainer = CONTAINER_CATEGORIES.some(c => product.categories.includes(c))

  if (!isContainer) {
    return <AccessoryDetail product={product} />
  }

  return (
    <main className="bg-theme-bg text-theme-dark">
      {/* Breadcrumb + product grid — client-driven, updates on variant change */}
      <ProductVariantShell initialProduct={product} relatedProducts={relatedProducts} />

      {/* BODY TABS */}
      <BodyTabsSection />

      {/* RELATED PRODUCTS */}
      <section className="px-4 sm:px-[5%] py-10 sm:py-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">You May Also Need</h2>
          <Link href="/product" className="text-xs sm:text-sm font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors whitespace-nowrap">
            View All Containers →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {staticRelatedProducts.map((p) => (
            <div key={p.title} className="rounded-lg border border-theme-border bg-theme-bg overflow-hidden cursor-pointer hover:border-theme-primary hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="h-32 flex items-center justify-center bg-theme-subtle">
                <p.Icon className="w-10 h-10 text-theme-muted" strokeWidth={1.5} />
              </div>
              <div className="p-3.5">
                <h4 className="font-extrabold text-base mb-1">{p.title}</h4>
                <p className="text-xs text-theme-muted mb-3 leading-relaxed">{p.desc}</p>
                <div className="flex items-center justify-between pt-2.5 border-t border-theme-border">
                  <span className="font-extrabold text-base">{p.price}</span>
                  <button className="bg-theme-dark text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-theme-primary transition-colors">{p.cta}</button>
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
          <a href="#" className="text-xs sm:text-sm font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors whitespace-nowrap">Write a Review →</a>
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
                  <div className="h-full bg-theme-primary rounded-full" style={{ width: `${r.pct}%` }} />
                </div>
                <span className="w-7 text-theme-muted text-xs">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3.5">
          {reviewsList.map((rev) => (
            <div key={rev.name} className="bg-theme-bg border border-theme-border rounded-lg p-4 sm:p-5 hover:border-theme-primary hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between gap-3 mb-2.5 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-extrabold shrink-0 ${rev.color}`}>{rev.initials}</div>
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
          <a href="#" className="text-xs sm:text-sm font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors whitespace-nowrap">View All FAQs →</a>
        </div>
        <FaqAccordion />
      </section>
    </main>
  )
}
