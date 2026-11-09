import { GBP_ROUTE_SEGMENTS, ROUTES } from '@/config/routes';
import { gbpSeoDefaults, requireGbpPage } from '@/lib/gbp';
import { LOCATION_PAGES } from '@/lib/data/locationPages';
import { locationPath, locationSeoDefaults } from '@/lib/locationPage';
import type { PageSeoDefaults } from '@/types/seo';

// The built-in SEO copy for every page in config/pages.ts, moved out of the
// individual page.tsx files so there is exactly one source of truth: the page
// renders from it, and the admin Page Configurator shows it as the placeholder
// behind each field, so an author can see what they're overriding.
//
// Changing a value here changes the live default. Overrides saved in Redis
// still win — see lib/seo.ts for the precedence rules.

const ACCOUNT_OG_IMAGE = '/images/logo/oss-logo.webp';

/** Account pages: real content, but never worth indexing. */
function accountPage(title: string, description: string, canonical: string): PageSeoDefaults {
  return {
    title,
    description,
    canonical,
    robots: { index: false, follow: true },
    openGraph: { title, description, images: [ACCOUNT_OG_IMAGE] },
  };
}

export const PAGE_SEO_DEFAULTS: Record<string, PageSeoDefaults> = {
  [ROUTES.HOME]: {
    title: 'Shipping Containers For Sale | Lowest Price Shipping Containers',
    description:
      'Buy or rent new and used shipping containers across the USA & Canada. 20ft, 40ft, high cube, reefer & more. 130+ depots, nationwide delivery, lowest prices guaranteed since 2002.',
    canonical: ROUTES.HOME,
    openGraph: {
      title: 'Shipping Containers For Sale | Lowest Price Shipping Containers',
      description:
        'We have the biggest range of shipping containers for sale and rent in the USA and Canada. Call us now for the best pricing and fast delivery.',
      type: 'website',
      url: 'https://onsitestorage.com/',
      images: [{ url: '/images/og-home.jpg', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
  },

  // The PLP and blog index compute their own title/description from the current
  // location or search term. These entries are the un-filtered baseline: they
  // are what the configurator shows as the placeholder, and what a saved
  // override replaces.
  [ROUTES.PLP]: {
    title: 'Shipping Containers for Sale Near You',
    description:
      'Buy used and new shipping containers near you. 20ft, 40ft, high cube, and more. Best prices guaranteed — no tax, fast delivery.',
    canonical: ROUTES.PLP,
    openGraph: { images: ['/images/og-containers.jpg'] },
  },

  [ROUTES.WHERE_TO_BUY]: {
    title: 'Where to Buy Shipping Containers Near You | 130+ US & Canada Depots',
    description:
      'Find shipping containers for sale near you. On-Site Storage Solutions delivers new and used 20ft, 40ft and high cube containers from 130+ depots across the USA and Canada.',
    canonical: ROUTES.WHERE_TO_BUY,
    openGraph: { type: 'website', images: ['/images/og-containers.jpg'] },
  },

  // Carried over from the WordPress page this replaced.
  [ROUTES.ACCESSORY_PRODUCTS]: {
    title: 'Shipping Container Accessory Products',
    description:
      'Upgrade your shipping container with essential accessories like ramps, shelving, LED lights and locks. These add-ons boost functionality, safety and organization while protecting your cargo.',
    canonical: ROUTES.ACCESSORY_PRODUCTS,
    openGraph: { type: 'website', images: ['/images/home-banners/hero-image.webp'] },
  },

  // Carried over from the WordPress page this replaced. WordPress's title ends in
  // " | On-Site Storage Solutions", which the site's title template adds.
  [ROUTES.RENT_TO_OWN]: {
    title: 'Rent to Own Shipping Container',
    description:
      'Rent to Own shipping container no credit check required and everyone qualifies. Call or visit our website for instant pricing!',
    canonical: ROUTES.RENT_TO_OWN,
    openGraph: {
      type: 'website',
      images: ['https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/callbuttonpngbv_YmgEPBO.webp'],
    },
  },

  // Carried over from the WordPress page (title kept whole; og:image the same
  // banner from the CDN, at full size rather than WordPress's 300px thumbnail).
  // Carried over from WordPress (titles without a site ending, so absoluteTitle).
  // Both declared the same og:image, here from the CDN.
  [ROUTES.FOR_SALE]: {
    title: 'Shipping Containers for Sale | Shop Now for Quality and Value',
    absoluteTitle: true,
    description: 'Get high-quality shipping containers for sale at unbeatable prices. Buy now and secure your storage solution!',
    canonical: ROUTES.FOR_SALE,
    openGraph: { type: 'article', images: ['https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp'] },
  },
  [ROUTES.RENTAL]: {
    title: 'Shipping Container for Rent | From $95 + 6 Months Free',
    absoluteTitle: true,
    description: 'Rent a shipping container starting at just $95 and enjoy 6 months of free rent! Get affordable, secure storage for your home or job site.',
    canonical: ROUTES.RENTAL,
    openGraph: { type: 'article', images: ['https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp'] },
  },

  [ROUTES.FAQS]: {
    title: 'How Much Is A Shipping Container | Frequently Asked Questions',
    absoluteTitle: true,
    description:
      'Wondering how much is a shipping container? Check out these frequently asked questions for your quick guide.',
    canonical: ROUTES.FAQS,
    openGraph: { type: 'article', images: ['https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2022/01/27100828/onsite-container-banner-size.png'] },
  },

  // The next three: carried over from WordPress, whose titles have no site
  // ending (absoluteTitle). og:image is the same file from the CDN.
  [ROUTES.REFURBISHED_CONTAINERS]: {
    title: 'Refurbished Shipping Container | Lowest Price Guaranteed',
    absoluteTitle: true,
    description:
      'A refurbished Shipping Container is a used Wind and Water container or better that has been prepped, primed and repainted. Read more here.',
    canonical: ROUTES.REFURBISHED_CONTAINERS,
    openGraph: { type: 'article', images: ['https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2023/08/16064053/refurbished-shipping-containers-for-sale.webp'] },
  },

  [ROUTES.CARGO_WORTHY_CONTAINERS]: {
    title: 'Cargo Worthy Shipping Container | Lowest Price Guaranteed',
    absoluteTitle: true,
    description:
      'Buy cargo worthy shipping container. Best pricing. Sturdy and reliable containers. Delivered in 2-7 business days. Call us now!',
    canonical: ROUTES.CARGO_WORTHY_CONTAINERS,
    openGraph: { type: 'article', images: ['https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2023/11/28071532/cw-sample-1-65658e58ae5ed.webp'] },
  },

  [ROUTES.CONTAINER_DIMENSIONS]: {
    title: 'Shipping Container Dimensions Guide: All Sizes Compared',
    absoluteTitle: true,
    description:
      'Compare shipping container dimensions for 10, 20, and 40 foot shipping containers side by side. Find the right size before you buy or rent.',
    canonical: ROUTES.CONTAINER_DIMENSIONS,
    openGraph: { type: 'article', images: ['https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2022/08/27100145/Header-2.png'] },
  },

  // The next four: carried over from the WordPress pages they replaced. Their
  // titles have no site ending there, so they are kept whole (absoluteTitle);
  // og:image is the same file from the CDN (special promotions' WordPress
  // banner has no CDN copy, so it takes the site default).
  [ROUTES.CONTAINER_TYPES]: {
    title: 'Different Types Of Shipping Containers | Container Guide & Uses',
    absoluteTitle: true,
    description:
      'Learn more about the different types of the shipping containers: dry van, refrigerated, flat rack, open side container, and more.',
    canonical: ROUTES.CONTAINER_TYPES,
    openGraph: { type: 'article', images: ['https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2023/08/17055329/who-invented-the-shipping-container.webp'] },
  },

  [ROUTES.CONTAINER_CONDITIONS]: {
    title: 'Shipping Container Conditions | Differences & Advantages',
    absoluteTitle: true,
    description:
      'There is a variety of shipping containers conditions: new, used, refurbished, one trip & as is. They are classified based on their condition.',
    canonical: ROUTES.CONTAINER_CONDITIONS,
    openGraph: { type: 'article', images: ['https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2023/08/23063201/one-trip-shipping-containers-for-sale-1-e1708320972146.webp'] },
  },

  [ROUTES.SPECIAL_PROMOTIONS]: {
    title: 'Container Promotion | Quality Shipping Containers & Best Prices',
    absoluteTitle: true,
    description:
      'Check out our special shipping container promotions! Choose from a variety of sizes & customization options. Call us now!',
    canonical: ROUTES.SPECIAL_PROMOTIONS,
    openGraph: { type: 'article', images: ['/images/og-containers.jpg'] },
  },

  [ROUTES.WHY_ONSITE]: {
    title: 'Onsite Storage Solutions | Leading Shipping Container Wholesaler',
    absoluteTitle: true,
    description:
      'Onsite storage has been selling and renting new and used shipping containers throughout America since 2002. Learn more about us here.',
    canonical: ROUTES.WHY_ONSITE,
    openGraph: { type: 'article', images: ['https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2023/08/18050108/buy-shipping-container.webp'] },
  },

  // Carried over from the WordPress page this replaced: its title has no site
  // ending there, so it is kept whole (absoluteTitle). Its social image is the
  // same banner, from the CDN rather than the WordPress media library.
  [ROUTES.REEFER]: {
    title: 'Reefer Refrigerated Container | Fast, Reliable Cold Storage',
    absoluteTitle: true,
    description:
      'Buy or rent reefer refrigerated containers with fast delivery, 24/7 support & the best prices. Ideal for food, pharma, events & more!',
    canonical: ROUTES.REEFER,
    openGraph: {
      type: 'article',
      images: [{ url: 'https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2023/11/21055609/banner-reefer-655c44c1ba35a.webp', width: 800, height: 481 }],
    },
  },

  // Carried over from the WordPress page this replaced, including its article
  // type. It had no social image, so this adds the site's containers one.
  [ROUTES.TAX_EXEMPTION]: {
    title: 'Sales Tax Exemption Request',
    description:
      'Learn how Onsite Storage Sales Tax Exemption Form saves you money on storage services. Get full details & maximize your savings.',
    canonical: ROUTES.TAX_EXEMPTION,
    openGraph: { type: 'article', images: ['/images/og-containers.jpg'] },
  },

  // Only meaningful straight after the form, so unlike WordPress's copy it stays
  // out of search results, as the other post-action pages here do.
  [ROUTES.TAX_EXEMPTION_THANK_YOU]: {
    title: 'Sales Tax Exemption Request Thank You',
    description:
      'Thank You for Your Sales Tax Exemption Request! We have received your sales tax exemption request. Our team is currently reviewing it and we will notify you once a decision has been made.',
    canonical: ROUTES.TAX_EXEMPTION_THANK_YOU,
    robots: { index: false, follow: true },
    openGraph: { type: 'article', images: ['/images/og-containers.jpg'] },
  },

  [ROUTES.BLOGS]: {
    title: 'Blog',
    description:
      'Guides, tips, and updates on shipping containers, storage, and delivery from On-Site Storage Solutions.',
    canonical: ROUTES.BLOGS,
    openGraph: { type: 'website' },
  },

  [ROUTES.AGENTS]: {
    title: 'AI Agent Policy and Developer Access',
    description:
      'How AI assistants and automated clients may use On-Site Storage Solutions: crawler policy, machine-readable endpoints, the agent API, the MCP server, rate limits and attribution.',
    canonical: ROUTES.AGENTS,
    agentSummary:
      'Policy and access documentation for AI agents. Lists every machine-readable surface (llms.txt, per-page Markdown, the JSON agent API, the MCP server, the product feeds), the crawler policy, rate limits, attribution expectations, and how to request a higher limit. Read this before building an integration against this site.',
    openGraph: { type: 'website' },
  },

  [ROUTES.CART]: {
    title: 'Shopping Cart',
    description:
      'Review your shipping containers and accessories before checkout on On-Site Storage Solutions.',
    canonical: ROUTES.CART,
    robots: { index: false, follow: true },
    openGraph: {
      title: 'Shopping Cart',
      description:
        'Review your shipping containers and accessories before checkout on On-Site Storage Solutions.',
      images: [ACCOUNT_OG_IMAGE],
    },
  },

  [ROUTES.CHECKOUT]: {
    title: 'Checkout',
    description:
      'Complete your shipping container purchase securely with On-Site Storage Solutions. Enter your details and payment information to finalize your order.',
    canonical: ROUTES.CHECKOUT,
    robots: { index: false, follow: false },
    openGraph: {
      title: 'Checkout | On-Site Storage Solutions',
      description:
        'Complete your shipping container order — secure checkout, fast nationwide delivery.',
      type: 'website',
      url: 'https://onsitestorage.com/checkout',
      images: [ACCOUNT_OG_IMAGE],
    },
  },

  [ROUTES.SAVED_QUOTES]: {
    title: 'Saved Quotes',
    description:
      "Quotes you've saved from container pages, with the price and delivery each had at the time.",
    canonical: ROUTES.SAVED_QUOTES,
    // Per-browser content with nothing to rank on, same as the wishlist.
    robots: { index: false, follow: true },
    openGraph: {
      title: 'Saved Quotes',
      description:
        "Quotes you've saved from container pages, with the price and delivery each had at the time.",
      images: [ACCOUNT_OG_IMAGE],
    },
  },

  [ROUTES.DELIVERY_QUOTE]: {
    title: 'Get Your Exact Delivery Quote | On Site Storage Solutions',
    description:
      'Tell us where your container is going and how to reach you, and we will come back with the exact delivery price for your address — usually within 15 minutes during business hours.',
    canonical: ROUTES.DELIVERY_QUOTE,
    openGraph: {
      title: 'Get Your Exact Delivery Quote',
      description:
        'Delivery is priced per address. Send us your details and we will quote yours exactly.',
      images: [ACCOUNT_OG_IMAGE],
    },
  },

  [ROUTES.DELIVERY_QUOTE_REVIEW]: {
    title: 'Your Delivery Quote | On Site Storage Solutions',
    description:
      'The quote your details bought, with the container, delivery estimate and what happens next.',
    canonical: ROUTES.DELIVERY_QUOTE_REVIEW,
    // The far side of a form submission: personalised, reached by redirect, and
    // nothing to rank on.
    robots: { index: false, follow: true },
    openGraph: {
      title: 'Your Delivery Quote',
      description: 'The quote your details bought.',
      images: [ACCOUNT_OG_IMAGE],
    },
  },

  [ROUTES.WISHLIST]: {
    title: 'My Wishlist',
    description:
      "Containers and accessories you've saved for later on On-Site Storage Solutions.",
    canonical: ROUTES.WISHLIST,
    robots: { index: false, follow: true },
    openGraph: {
      title: 'My Wishlist',
      description:
        "Containers and accessories you've saved for later on On-Site Storage Solutions.",
      images: [ACCOUNT_OG_IMAGE],
    },
  },

  [ROUTES.ACCOUNT.ROOT]: accountPage(
    'My Account',
    'Log in to your On-Site Storage Solutions account or register for exclusive discounts, live inventory access, and dedicated support.',
    ROUTES.ACCOUNT.ROOT,
  ),
  [ROUTES.ACCOUNT.ORDERS]: accountPage(
    'Orders',
    'View your recent orders with On-Site Storage Solutions.',
    ROUTES.ACCOUNT.ORDERS,
  ),
  [ROUTES.ACCOUNT.NEWSLETTER]: accountPage(
    'Newsletter',
    'Manage your newsletter subscription with On-Site Storage Solutions.',
    ROUTES.ACCOUNT.NEWSLETTER,
  ),
  [ROUTES.ACCOUNT.EDIT_ACCOUNT]: accountPage(
    'Account Details',
    'Edit your profile and password on On-Site Storage Solutions.',
    ROUTES.ACCOUNT.EDIT_ACCOUNT,
  ),
  [ROUTES.ACCOUNT.EDIT_ADDRESS]: accountPage(
    'Addresses',
    'Manage your billing and shipping addresses on On-Site Storage Solutions.',
    ROUTES.ACCOUNT.EDIT_ADDRESS,
  ),
  [ROUTES.ACCOUNT.DOWNLOADS]: accountPage(
    'Downloads',
    'Access your downloadable files from On-Site Storage Solutions.',
    ROUTES.ACCOUNT.DOWNLOADS,
  ),
  [ROUTES.ACCOUNT.PAYMENT_METHODS]: accountPage(
    'Payment Methods',
    'Manage your saved payment methods on On-Site Storage Solutions.',
    ROUTES.ACCOUNT.PAYMENT_METHODS,
  ),
  [ROUTES.ACCOUNT.LOGOUT]: accountPage(
    'Logout',
    'Log out of your On-Site Storage Solutions account.',
    ROUTES.ACCOUNT.LOGOUT,
  ),
  [ROUTES.ACCOUNT.LOST_PASSWORD]: accountPage(
    'Lost Password',
    'Reset your On-Site Storage Solutions account password. Enter your username or email address and we will send you a link to create a new password.',
    ROUTES.ACCOUNT.LOST_PASSWORD,
  ),
  [ROUTES.ACCOUNT.RESET_PASSWORD]: accountPage(
    'Reset Password',
    'Create a new password for your On-Site Storage Solutions account.',
    ROUTES.ACCOUNT.RESET_PASSWORD,
  ),

  // GBP location pages: their SEO is part of each page's data (lib/data/gbpPages.ts).
  ...Object.fromEntries(GBP_ROUTE_SEGMENTS.map((slug) => [`/${slug}`, gbpSeoDefaults(requireGbpPage(slug))])),

  // Native location pages: their SEO is part of each record (lib/data/locationPages.ts).
  ...Object.fromEntries(LOCATION_PAGES.map((page) => [locationPath(page.slug), locationSeoDefaults(page)])),
};
