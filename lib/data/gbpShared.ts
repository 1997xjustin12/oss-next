/**
 * What every GBP location page shares, extracted from the live WordPress
 * pages on 2026-10-29: identical on all 11 (lib/data/gbpPages.ts holds what
 * differs).
 *
 * `GBP_SHARED_DEFAULTS` is the content: the seed the admin's shared-content
 * screen starts from, and the fallback when Redis has no record. The rest of
 * this file is wiring that is not content (the Zoho forms' CRM fields, head
 * tags, script IDs) and stays in code.
 *
 * Reference: docs/reference/gbp-subdomain-pages.md
 */

import type { GbpSharedContent } from '@/types/gbp'

// Every image is a local copy in public/images/gbp/ (downloaded from WordPress
// and its CDNs on 2026-10-29, converted to WebP): nothing here depends on the
// WordPress media library, which goes away with the headless migration.

export const GBP_SHARED_DEFAULTS: GbpSharedContent = {
  header: {
    announcement: 'Financing available — only $69/month to start! Call now: {phone}',
    logo: { src: '/images/gbp/cropped-OSS-Logo-1.webp', alt: 'On-Site Storage Solutions', width: 500, height: 138 },
    // In-page anchors; "Home" is the site root.
    nav: [
      { label: 'Home', href: '/' },
      { label: 'About Us', href: '#about' },
      { label: 'Types of Container', href: '#types' },
      { label: 'Why Choose Us?', href: '#choose' },
      { label: 'FAQS', href: '#faqs' },
    ],
  },
  hero: {
    tagline: 'Guaranteed Lowest Price – Fast Delivery – 100% Satisfaction',
    bullets: ['Huge Nationwide Inventory', 'Buy, Rent, or Rent-to-Own Options', 'All Container Sizes & Conditions Available'],
    quoteCtaLabel: 'Request a Quote',
    background: '/images/gbp/Untitled-design-5.webp',
    badges: [
      { src: '/images/gbp/1.webp', alt: 'PayPal Verified', width: 500, height: 500 },
      { src: '/images/gbp/3.webp', alt: 'On-Site Storage Satisfaction Guarantee', width: 500, height: 500 },
      { src: '/images/gbp/Untitled-1080-x-1080-px-1500-x-1000-px-e1748450709728-1024x316.png', alt: 'Google Trusted Store', width: 800, height: 247 },
      { src: '/images/gbp/5-e1748450766913.webp', alt: 'Google Reviews', width: 500, height: 192 },
      { src: '/images/gbp/4-e1748450748168.webp', alt: 'BBB Rated', width: 500, height: 191 },
      { src: '/images/gbp/2-e1748450730818.webp', alt: 'SiteTrust', width: 500, height: 238 },
    ],
  },
  // "Trusted By Organizations Like". The heading's wording is per page.
  trustedLogos: [
    { src: '/images/gbp/download-1-150x150-1.webp', alt: 'Toyota' },
    { src: '/images/gbp/download-3-1-150x150-1.webp', alt: 'Walt Disney' },
    { src: '/images/gbp/download-2-1-150x150-1.webp', alt: 'Walmart' },
    { src: '/images/gbp/download-7-150x150-1.webp', alt: 'Air Liquide' },
    { src: '/images/gbp/download-8-150x150-1.webp', alt: 'BNSF Railway' },
    { src: '/images/gbp/download-1-1-150x150-1.webp', alt: 'TruGreen' },
    { src: '/images/gbp/download-6-150x150-1.webp', alt: 'Advance Auto Parts' },
    { src: '/images/gbp/download-9-150x150-1.webp', alt: 'Boeing' },
    { src: '/images/gbp/download-10-150x150-1.webp', alt: 'FedEx' },
  ],
  // The three cards under the products heading. Each CTA dials the page's number.
  productCards: [
    {
      title: 'Rent a Shipping Container',
      features: ['Lowest Price Rate', 'Free Rent', 'Fast Delivery'],
      image: { src: '/images/gbp/Rent-A-Shipping-Container-1024x533.webp', alt: 'find shipping containers for rent', width: 1024, height: 533 },
    },
    {
      title: 'Buy a Shipping Container',
      features: ['Guaranteed Lowest Price', 'Huge Selection', 'Location Near You'],
      image: { src: '/images/gbp/Buy-A-Shipping-Container.webp', alt: 'find shipping containers for sale', width: 330, height: 171 },
    },
    {
      title: 'Rent-To-Own Shipping Container',
      features: ['Affordable Monthly Payment', 'Huge Selection', 'Everyone Qualifies'],
      image: { src: '/images/gbp/Rent-to-Own-Shipping-Container.webp', alt: 'find rent to own shipping containers', width: 342, height: 180 },
    },
  ],
  reviewsHeading: "We've Got a Lot of [[Happy Customers]]",
  // "Types of Shipping Containers…": alternating rows. `accent` is the red first word.
  containerTypes: [
    {
      accent: 'Dry Van',
      rest: 'Shipping Containers',
      body: 'The most common shipping containers you see on ships, in ports, or being carried by trucks are known as dry van shipping containers. They come in different lengths and heights and they may have different door options such as double doors at one end, double doors at both ends, and open side containers with doors on the side.',
      image: { src: '/images/gbp/Dry-Van-Shipping-Containers-for-sale.webp', alt: 'Dry Van Shipping Container For Sale', width: 1872, height: 1404 },
    },
    {
      accent: 'Refrigerated',
      rest: 'Shipping Containers',
      body: 'Refrigerated ISO shipping containers, also known as Reefers, are insulated shipping containers that are used to transport temperature-sensitive cargo. The refrigeration equipment is part of the bulkhead wall and comes with controls allowing you to manage the interior temperature.',
      image: { src: '/images/gbp/Refrigerated-Shipping-Containers-for-sale-1024x674.webp', alt: 'Refrigerated Shipping Container For Sale', width: 1024, height: 674 },
    },
    {
      accent: 'Specialized',
      rest: 'Shipping Containers',
      body: 'Specialized shipping containers are containers that have been adapted to transport unusual cargo that won’t fit inside the typical big metal shipping containers. From transporting oversized machinery to liquids, there’s a special-purpose container for every need.',
      image: { src: '/images/gbp/Specialized-Shipping-Containers-for-Sale-1024x768.webp', alt: 'Specialized Shipping Containers for sale', width: 1024, height: 768 },
    },
  ],
  whyChoose: {
    heading: 'Why Choose Us?',
    // Font Awesome icons on WordPress; named here by meaning.
    items: [
      { icon: 'user-shield', title: 'Experienced Staff', body: 'Founded in 2002, our senior team brings 75+ years of combined industry experience.' },
      { icon: 'medal', title: 'Customer Satisfaction', body: 'We handle everything from selecting to delivering your container. Your satisfaction is guaranteed!' },
      { icon: 'money-bill', title: 'Best Prices', body: 'We offer a Best Price Guarantee—find a lower price, and we’ll try to beat it.' },
      { icon: 'retweet', title: 'Money-Back Guarantee', body: 'Not satisfied? Return the container for a full refund (minus shipping costs).' },
    ],
  },
  about: {
    image: { src: '/images/gbp/Best-Shipping-Container-Store-1024x576.webp', alt: 'Best Shipping Container Store in USA', width: 1024, height: 576 },
    cta: 'Call Us For Assistance',
  },
  quote: { heading: 'Get the [[Best]] Pricing Now!' },
  newsletter: {
    heading: 'Get the Best Deals on Containers – [[Before Anyone Else!]]',
    body: 'Sign up to get insider access to special offers, new container arrivals, and expert tips on container storage and modifications.',
    note: 'We’ll never spam you. Just helpful info and great deals.',
    background: '/images/gbp/Untitled-design-5-1024x534.webp',
  },
  faqHeading: 'Frequently Asked [[Questions]]',
  footer: {
    tagline: 'Trusted Shipping Container Solutions Across America.',
    // WordPress links the footer logo to get.onsitestorage.com.
    logoHref: 'https://get.onsitestorage.com/',
  },
}

/** The Zoho forms, now in lib/data/zohoForms.ts (shared with the homepage). */
export { ZOHO_FORMS as GBP_ZOHO_FORMS } from '@/lib/data/zohoForms'

/** Site-wide head tags every GBP page carries. Per-page SEO is in gbpPages.ts. */
export const GBP_HEAD = {
  googleSiteVerification: ['MiN4PJOfc2016bzuHs8_IckA86cSwzlMBEbZTc2XWWY', '59WM8VCznfigmB982XQ_GHURbVwfVAoGrvbraH7PGwM'],
  twitterSite: '@onsite_storage',
  facebookPublisher: 'https://www.facebook.com/OnsiteStorageSolutions/',
  siteName: 'OnsiteStorage',
  themeColor: '#FFFFFF',
} as const

/**
 * Third-party scripts on every GBP page. GTM is already in the root layout
 * (config/googleTag.ts, the same container); the others are not in the app.
 */
export const GBP_SCRIPTS = {
  gtmId: 'GTM-5X9C5P6',
  /**
   * Zoho SalesIQ chat widget ("Everyone Qualifies!" bubble), as WordPress loads
   * it. Recorded only: the GBP pages deliberately don't load it (2026-10-29).
   */
  zohoSalesIq: {
    src: 'https://salesiq.zohopublic.com/widget',
    widgetCode: 'siq5653ae22387671d972ab9ed19491efe5e4478724bfefa2f62964fa5740b75521',
  },
  /** Meta pixel, inline on WordPress. Check whether GTM already fires it before adding it again. */
  metaPixelId: '657052321598228',
} as const
