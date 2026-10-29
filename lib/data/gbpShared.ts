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

const CDN = 'https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads'
/**
 * Images still served by WordPress itself, not the CDN. They break when
 * WordPress is retired, so they move to the CDN before the pages go live (see
 * the reference doc, "Before go-live").
 */
const WP = 'https://onsitestorage.com/wp-content/uploads'

export const GBP_SHARED_DEFAULTS: GbpSharedContent = {
  header: {
    announcement: 'Financing available — only $69/month to start! Call now: {phone}',
    logo: { src: `${CDN}/2021/11/27100041/cropped-OSS-Logo-1.webp`, alt: 'On-Site Storage Solutions', width: 500, height: 138 },
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
    background: `${WP}/2025/08/Untitled-design-5.jpg`,
    badges: [
      { src: `${WP}/2025/08/1.webp`, alt: 'PayPal Verified', width: 500, height: 500 },
      { src: `${WP}/2025/08/3.webp`, alt: 'On-Site Storage Satisfaction Guarantee', width: 500, height: 500 },
      { src: `${WP}/2025/08/Untitled-1080-x-1080-px-1500-x-1000-px-e1748450709728-1024x316.png`, alt: 'Google Trusted Store', width: 800, height: 247 },
      { src: `${WP}/2025/08/5-e1748450766913.webp`, alt: 'Google Reviews', width: 500, height: 192 },
      { src: `${WP}/2025/08/4-e1748450748168.webp`, alt: 'BBB Rated', width: 500, height: 191 },
      { src: `${WP}/2025/08/2-e1748450730818.webp`, alt: 'SiteTrust', width: 500, height: 238 },
    ],
  },
  // "Trusted By Organizations Like". The heading's wording is per page.
  trustedLogos: [
    { src: `${CDN}/2025/08/21054023/download-1-150x150-1.webp`, alt: 'Toyota' },
    { src: `${CDN}/2025/08/21054024/download-3-1-150x150-1.webp`, alt: 'Walt Disney' },
    { src: `${CDN}/2025/08/21054024/download-2-1-150x150-1.webp`, alt: 'Walmart' },
    { src: `${CDN}/2025/08/21054025/download-7-150x150-1.webp`, alt: 'Air Liquide' },
    { src: `${CDN}/2025/08/21054026/download-8-150x150-1.webp`, alt: 'BNSF Railway' },
    { src: `${CDN}/2025/08/21054027/download-1-1-150x150-1.webp`, alt: 'TruGreen' },
    { src: `${CDN}/2025/08/21054027/download-6-150x150-1.webp`, alt: 'Advance Auto Parts' },
    { src: `${CDN}/2025/08/21054028/download-9-150x150-1.webp`, alt: 'Boeing' },
    { src: `${CDN}/2025/08/21054029/download-10-150x150-1.webp`, alt: 'FedEx' },
  ],
  // The three cards under the products heading. Each CTA dials the page's number.
  productCards: [
    {
      title: 'Rent a Shipping Container',
      features: ['Lowest Price Rate', 'Free Rent', 'Fast Delivery'],
      image: { src: `${CDN}/2025/08/25071618/Rent-A-Shipping-Container-1024x533.webp`, alt: 'find shipping containers for rent', width: 1024, height: 533 },
    },
    {
      title: 'Buy a Shipping Container',
      features: ['Guaranteed Lowest Price', 'Huge Selection', 'Location Near You'],
      image: { src: `${CDN}/2025/08/25071725/Buy-A-Shipping-Container.webp`, alt: 'find shipping containers for sale', width: 330, height: 171 },
    },
    {
      title: 'Rent-To-Own Shipping Container',
      features: ['Affordable Monthly Payment', 'Huge Selection', 'Everyone Qualifies'],
      image: { src: `${CDN}/2025/08/25071813/Rent-to-Own-Shipping-Container.webp`, alt: 'find rent to own shipping containers', width: 342, height: 180 },
    },
  ],
  reviewsHeading: "We've Got a Lot of [[Happy Customers]]",
  // "Types of Shipping Containers…": alternating rows. `accent` is the red first word.
  containerTypes: [
    {
      accent: 'Dry Van',
      rest: 'Shipping Containers',
      body: 'The most common shipping containers you see on ships, in ports, or being carried by trucks are known as dry van shipping containers. They come in different lengths and heights and they may have different door options such as double doors at one end, double doors at both ends, and open side containers with doors on the side.',
      image: { src: `${CDN}/2025/08/25080311/Dry-Van-Shipping-Containers-for-sale.webp`, alt: 'Dry Van Shipping Container For Sale', width: 1872, height: 1404 },
    },
    {
      accent: 'Refrigerated',
      rest: 'Shipping Containers',
      body: 'Refrigerated ISO shipping containers, also known as Reefers, are insulated shipping containers that are used to transport temperature-sensitive cargo. The refrigeration equipment is part of the bulkhead wall and comes with controls allowing you to manage the interior temperature.',
      image: { src: `${CDN}/2025/08/25080731/Refrigerated-Shipping-Containers-for-sale-1024x674.webp`, alt: 'Refrigerated Shipping Container For Sale', width: 1024, height: 674 },
    },
    {
      accent: 'Specialized',
      rest: 'Shipping Containers',
      body: 'Specialized shipping containers are containers that have been adapted to transport unusual cargo that won’t fit inside the typical big metal shipping containers. From transporting oversized machinery to liquids, there’s a special-purpose container for every need.',
      image: { src: `${CDN}/2025/08/25080911/Specialized-Shipping-Containers-for-Sale-1024x768.webp`, alt: 'Specialized Shipping Containers for sale', width: 1024, height: 768 },
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
    image: { src: `${CDN}/2025/08/25082037/Best-Shipping-Container-Store-1024x576.webp`, alt: 'Best Shipping Container Store in USA', width: 1024, height: 576 },
    cta: 'Call Us For Assistance',
  },
  quote: { heading: 'Get the [[Best]] Pricing Now!' },
  newsletter: {
    heading: 'Get the Best Deals on Containers – [[Before Anyone Else!]]',
    body: 'Sign up to get insider access to special offers, new container arrivals, and expert tips on container storage and modifications.',
    note: 'We’ll never spam you. Just helpful info and great deals.',
    background: `${WP}/2025/08/Untitled-design-5-1024x534.jpg`,
  },
  faqHeading: 'Frequently Asked [[Questions]]',
  footer: {
    tagline: 'Trusted Shipping Container Solutions Across America.',
    // WordPress links the footer logo to get.onsitestorage.com.
    logoHref: 'https://get.onsitestorage.com/',
  },
}

/**
 * The two Zoho CRM web-to-contact forms' wiring, the same on every page. Not
 * content: the hidden values identify the form to Zoho and the field names are
 * Zoho's API names, so a submission lands in the same CRM fields as today.
 * They are public (in every page's HTML). The forms' visible copy is in
 * GBP_SHARED_DEFAULTS.
 */
export const GBP_ZOHO_FORMS = {
  quote: {
    anchor: 'request_quote',
    action: 'https://crm.zoho.com/crm/WebToContactForm',
    hidden: {
      xnQsjsdp: 'ba855d1d474179ecfe2c84a0deca923fe375978a51af4252d4276a7ceab13b7a',
      xmIwtLD: '9805cfa7fb65bef5be2e5079ef5722d2473f265ad63883da9080fdea3023c9a18251f415be3b42febd6b648cdc6e86d4',
      actionType: 'Q29udGFjdHM=',
      returnURL: 'null',
      zc_gad: '',
      /** Honeypot: must stay empty. */
      aG9uZXlwb3Q: '',
    },
    fields: [
      { name: 'First Name', label: 'First Name', required: true, maxLength: 40 },
      { name: 'Last Name', label: 'Last Name', required: true, maxLength: 80 },
      { name: 'Phone', label: 'Phone', required: true, maxLength: 50 },
      { name: 'Email', label: 'Email', required: true, maxLength: 100, type: 'email' },
      { name: 'CONTACTCF7', label: 'Shipping Zip', required: true, maxLength: 255 },
      {
        name: 'CONTACTCF23',
        label: 'Container Size',
        required: true,
        options: [
          '20ft Container',
          '40ft Container',
          '40ft High Cube Container',
          '45ft Container',
          '20ft Refrigerated Container',
          '40ft Refrigerated Container',
          'Other Size or Type',
        ],
      },
      { name: 'CONTACTCF30', label: 'Comments', required: false, maxLength: 255 },
    ],
    /**
     * Zoho's image captcha: the image comes from here, the answer goes in
     * `enterdigest`. Reload appends `&d<timestamp>`, as Zoho's own script does.
     * Loaded straight from Zoho (never through an image proxy): the answer is
     * checked against the image the visitor's browser was served.
     */
    captcha: {
      imageUrl:
        'https://crm.zoho.com/crm/CaptchaServlet?formId=9805cfa7fb65bef5be2e5079ef5722d2473f265ad63883da9080fdea3023c9a18251f415be3b42febd6b648cdc6e86d4&grpid=ba855d1d474179ecfe2c84a0deca923fe375978a51af4252d4276a7ceab13b7a',
      field: 'enterdigest',
    },
  },
  newsletter: {
    action: 'https://crm.zoho.com/crm/WebToContactForm',
    hidden: {
      xnQsjsdp: '85905851531a3da2ed4dc5227fc2ef5a9dfd7c9c3bac16738c267e18094e46d2',
      xmIwtLD: 'f5391198eccf7e3cb0651c1aec64fdb099998dec93534d6ea887853ceb392978b24da7b9583368657f02a1554a3699ce',
      actionType: 'Q29udGFjdHM=',
      returnURL: 'https://onsitestorage.com/thank-you-newsletter',
      zc_gad: '',
    },
    /** "Full Name" is sent as Zoho's Last Name. */
    fields: [
      { name: 'Last Name', label: 'Full Name', required: true, maxLength: 80 },
      { name: 'Email', label: 'Email', required: true, maxLength: 100, type: 'email' },
    ],
    /** Google reCAPTCHA v2 (not Zoho's image captcha). */
    recaptchaSiteKey: '6Lda2_chAAAAAHcDQfLME3EAFPRxWLvaWFl62TaG',
  },
} as const

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
