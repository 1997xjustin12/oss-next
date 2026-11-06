/**
 * Copy and media for /reefer-refrigerated-container, carried over from the
 * WordPress page it replaced (2026-11-06): its visible sections, in its order,
 * word for word. Edit here; the components only lay it out.
 *
 * Corrected from WordPress (2026-11-06): the rental card showed (888) 632-9390
 * while dialling (888) 977-9085, and "6, 12 18" lacked its comma.
 *
 * Still as WordPress has it, for the content owner: "Wide Temperature Range"
 * repeats the humidity paragraph.
 *
 * Not carried over: the sections WordPress hides on every device (the 3-step
 * ZIP box, the store locator, financing, cities and the FAQ). See
 * docs/reference/wordpress-to-next-pages.md.
 */

const CDN = 'https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads'

export type ReeferImage = { src: string; alt: string; width: number; height: number }

/** Root-relative paths of pages that are still WordPress's (listed in the migration doc). */
export const REEFER_LINKS = {
  pricing: '/shipping-containers-for-sale',
  morePhotos: '/shipping-container-pictures-by-type/refrigerated-shipping-container',
  rental: '/shipping-container-rental',
  reviews: '/review-of-shipping-containers',
} as const

export const REEFER_HERO = {
  heading: 'Refrigerated Containers',
  subheading: 'New and Used Shipping Containers at Best Prices!',
  cta: 'GET PRICING',
  background: { src: `${CDN}/2022/03/27100616/20-foot-header-img.png`, alt: '' },
  image: { src: `${CDN}/2023/11/21055609/banner-reefer-655c44c1ba35a.webp`, alt: 'Refrigerated container', width: 800, height: 481 },
} as const

export const REEFER_INTRO = {
  heading: 'Refrigerated Shipping container for sale',
  body: 'Reefer Containers (aka Refrigerated Containers) are temperature-controlled containers that have a temperature range of -15°F to 65°F. They have a stainless steel interior and exterior with an aluminum T floor and R30 insulation. They are recommended to transport and store perishable goods that require definite temperature control.',
  dimensionsHeading: "Dimensions of a 40' Standard Shipping Container",
  dimensionsImage: { src: `${CDN}/2023/08/25014711/refrigerated-shipping-container-dimensions.webp`, alt: 'Refrigerated Shipping Container Dimensions', width: 419, height: 338 },
  guideHeading: 'Not sure Which shipping container will fulfill your storage or modification needs? This guide might help you out!',
  guideCta: 'READ THE GUIDE',
  guideHref: 'https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/pdf/A%20Quick%20&%20Easy%20Guide%20On%20How%20To%20Choose%20the%20Right%20Shipping%20Container%20(Buyers%20Guide).pdf',
  tableImage: { src: `${CDN}/2023/11/21055550/40-reefer-655c44c08d324-730x1024.webp`, alt: 'Container Dimensions', width: 730, height: 1024 },
} as const

export const REEFER_POWER_BAND = 'REEFERS POWER REQUIREMENTS'

export const REEFER_POWER = {
  heading: 'How does reefer container work?',
  body: 'Working refrigerated units run at 50-60 Hz and require three-phase power supply that’s suitable for 440/460 volts. If the Reefer site does not have the required voltage, we can provide transformers for an additional cost that can increase the 3-phase power voltage from 220/240 volts to 440/460 volts. Keep in mind that customers are responsible for grounding the power supply and providing a circuit breaker of 30 amp prior to use.',
  cta: 'Download Reefer Specifications',
  ctaHref: `${CDN}/2026/08/17083120/REFRIGERATED-CONTAINER-GUIDE.pdf`,
  image: { src: `${CDN}/2023/08/25014734/refrigerated-shipping-containers-for-sale.webp`, alt: 'Refrigerated Shipping Containers For Sale', width: 441, height: 335 },
} as const

export const REEFER_QUOTE_CTA = {
  heading: 'Ready to buy a shipping container? Contact one of our shipping container professionals now for a quote.',
  cta: 'CALL NOW (888)977-9085',
} as const

export type ReeferFeatureIcon = 'temperature' | 'cooling' | 'range' | 'humidity' | 'monitoring' | 'security'

export const REEFER_FEATURES = {
  heading: 'Features and Benefits:',
  items: [
    { icon: 'temperature', title: 'Temperature Control:', body: 'Our refrigerated containers offer precise temperature control, allowing you to set and maintain the desired temperature range for your perishable goods. Whether you’re shipping fresh produce, pharmaceuticals, or other temperature-sensitive products, our containers ensure that your cargo remains in optimal condition.' },
    { icon: 'cooling', title: 'Advance Cooling Technology', body: 'Equipped with state-of-the-art cooling systems, our refrigerated containers utilize advanced technology to regulate the internal temperature effectively. This ensures a consistent and stable environment for your goods, regardless of external conditions.' },
    { icon: 'range', title: 'Wide Temperature Range:', body: 'Maintaining the right humidity level is vital for certain goods, such as fruits, vegetables, and flowers. Our refrigerated containers feature humidity control systems, ensuring the ideal moisture levels to preserve the quality and freshness of your cargo.' },
    { icon: 'humidity', title: 'Precise Humidity Control:', body: 'Maintaining the right humidity level is vital for certain goods, such as fruits, vegetables, and flowers. Our refrigerated containers feature humidity control systems, ensuring the ideal moisture levels to preserve the quality and freshness of your cargo.' },
    { icon: 'monitoring', title: 'Remote Monitoring and Alarms:', body: 'To provide you with peace of mind during transit, our refrigerated containers are equipped with remote monitoring capabilities. You can track and monitor temperature, humidity, and other vital parameters in real time. In case of any deviations or issues, alarms will alert you promptly, allowing for immediate action to safeguard your cargo.' },
    { icon: 'security', title: 'Robust Insulation and Security:', body: 'Our refrigerated containers are designed with robust insulation to minimize temperature fluctuations and maintain a stable environment. The containers also feature sturdy locks and security measures to protect your cargo from unauthorized access and ensure its safety throughout the shipping process.' },
  ] satisfies readonly { icon: ReeferFeatureIcon; title: string; body: string }[],
} as const

export const REEFER_GALLERY = {
  images: [
    { src: `${CDN}/2023/11/21055623/used-20-reefer-3-655c44c67292b.webp`, alt: 'Used 20 ft reefer container', width: 422, height: 316 },
    { src: `${CDN}/2023/11/21055554/40-reefer-doors-655c44c88a00e.webp`, alt: '40 ft reefer container doors', width: 423, height: 315 },
    { src: `${CDN}/2023/11/21055615/img-0428-1-655c44c77e2b8.webp`, alt: 'Reefer Refrigerated Container', width: 420, height: 315 },
    { src: `${CDN}/2023/11/21055613/how-does-reefer-work-image-655c44c39b540.webp`, alt: 'Refrigeration unit of a reefer container', width: 659, height: 501 },
  ] satisfies readonly ReeferImage[],
  cta: 'SEE MORE PHOTOS',
} as const

export const REEFER_VIDEO = { id: 'Q-BfZU7NJ4w', title: 'Refrigerated shipping containers from On-Site Storage Solutions' } as const

export const REEFER_NON_WORKING = {
  heading: 'We ALSO HAVE NON-Working REEFER Available',
  question: 'What is non-working refrigerated container?',
  body: 'A non-working reefer refers to a refrigerated container or transport unit that is not functioning properly or has stopped cooling. It typically indicates a failure in the refrigeration system, resulting in the inability to maintain the desired temperature for perishable goods. While it may not actively cool or provide temperature control, a non-working reefer can still serve as an insulated storage solution, offering a secure environment with insulation to protect items from temperature variations. Additional heating elements, such as an electric space heater, may be used to help maintain the internal temperature if necessary.',
  image: { src: `${CDN}/2023/11/21055618/non-working-reefer-655c44c509b5f.webp`, alt: 'Non-working reefer container', width: 656, height: 707 },
} as const

export const REEFER_BUY = {
  heading: 'BUY FROM US',
  body: 'We offer a wide selection of specialty storage containers for all your needs. From reefer, and flat rack to tank containers, we have the right option for you – no matter the size or purpose. Our purchasing power ensures that you’re always getting the best price available.',
  cta: 'LEARN MORE',
} as const

export const REEFER_OPTIONS = {
  heading: 'LOW-COST ON-SITE STORAGE SOLUTIONS',
  rental: {
    title: 'RENTAL',
    before: 'On-Site Storage Solutions is a leader in providing rental shipping containers for temporary or long-term needs at the lowest rates available. Rental rates start as low as $99 a month(some areas may require sale tax), just give us a call at',
    phoneText: '(888) 977-9085',
    after: ', and we’ll walk you through the container rental process',
  },
  rentToOwn: {
    title: 'RENT-TO-OWN',
    before: 'On-Site Storage Solutions proudly presents a Rent-To-Own Option in partnership with My Container Rental. Call us at',
    phoneText: '(888) 977-9085',
    after: ' or select from our website the payment plans that suit you best – including 6, 12, 18, and 24 Months, as well as long-term programs.',
  },
  cta: 'LEARN MORE',
} as const

export const REEFER_HELP = {
  before: 'If You Need Help In Choosing Your Container, Our Team Is Standing By.',
  link: 'Call us now! (888)977-9085',
} as const

export const REEFER_TESTIMONIALS_HEADING = 'We’ve Got A lot of Happy Customers'

export const REEFER_NEWSLETTER_HEADING = 'SUBSCRIBE TO OUR NEWSLETTER TO RECEIVE THE LATEST NEWS AND EXCLUSIVE OFFERS'
