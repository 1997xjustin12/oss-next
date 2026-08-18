import { ROUTES } from '@/config/routes';
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
};
