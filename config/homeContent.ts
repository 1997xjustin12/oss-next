import { ROUTES } from '@/config/routes';
import type { HeadingLevel } from '@/types/content';

// Every heading element rendered on the live homepage, with its shipped text.
// One source of truth: the components render from these defaults, and the admin
// Content Editor shows them as the placeholder behind each field.
//
// Deliberately excludes headings inside HeroSection, TrustStrip, ContainerTypes,
// WhyUs and Reviews — those components are commented out in (home)/page.tsx, so
// listing their 8 headings would make the editor claim control over copy that
// never reaches a visitor. Uncomment a section, add its headings here.
//
// The three Hero layout variants share one set of headings: their wording is
// identical today and only the layout differs, which keeps the A/B test
// measuring one thing. Editing hero.h1 changes all three.

export type HeadingField = {
  /** Stable key — the Redis field name and the form input name. */
  key: string;
  /** Which section of the page this heading sits in, for grouping in the UI. */
  section: string;
  label: string;
  element: HeadingLevel;
  /** The text as shipped in the component source. */
  default: string;
  /** Whether `[[...]]` accent markers do anything in this heading. */
  accent?: boolean;
  /** Shown under the field in the admin. */
  help?: string;
};

export const HOME_HEADINGS: readonly HeadingField[] = [
  {
    key: 'hero.h1',
    section: 'Hero',
    label: 'Main headline',
    element: 'h1',
    default: 'Local Shipping Containers Delivered Nationwide & Canada',
    help: 'The page’s only H1. Shared by all three layout variants.',
  },
  {
    key: 'hero.h2',
    section: 'Hero',
    label: 'Sub-headline',
    element: 'h2',
    accent: true,
    default:
      'Whether You Want to [[Buy]], [[Rent]], Or [[Rent-To-Own]], We Deliver From A Local Hub To Save You Money On Mileage.',
    help: 'Shared by all three layout variants.',
  },

  {
    key: 'rightContainer.h2',
    section: 'Find The Right Container',
    label: 'Section heading',
    element: 'h2',
    default: 'Find The Right Container For Your Needs',
  },

  {
    key: 'howItWorks.h2',
    section: 'How It Works',
    label: 'Section heading',
    element: 'h2',
    default: 'How It Works',
  },
  { key: 'howItWorks.step1', section: 'How It Works', label: 'Step 1', element: 'h4', default: 'Choose Your Container' },
  { key: 'howItWorks.step2', section: 'How It Works', label: 'Step 2', element: 'h4', default: 'Get a Free Quote' },
  { key: 'howItWorks.step3', section: 'How It Works', label: 'Step 3', element: 'h4', default: 'Confirm Your Order' },
  { key: 'howItWorks.step4', section: 'How It Works', label: 'Step 4', element: 'h4', default: 'We Deliver to You' },

  {
    key: 'onsiteDifference.h2',
    section: 'The On-Site Difference',
    label: 'Section heading',
    element: 'h2',
    default: 'The On-Site Storage Difference',
  },
  { key: 'onsiteDifference.item1', section: 'The On-Site Difference', label: 'Point 1', element: 'h3', default: 'No Hidden Fees' },
  { key: 'onsiteDifference.item2', section: 'The On-Site Difference', label: 'Point 2', element: 'h3', default: '70+ Strategic Hubs' },
  { key: 'onsiteDifference.item3', section: 'The On-Site Difference', label: 'Point 3', element: 'h3', default: '75+ Years Experience' },
  { key: 'onsiteDifference.item4', section: 'The On-Site Difference', label: 'Point 4', element: 'h3', default: 'Flexible Options' },

  {
    key: 'trustedBy.h2',
    section: 'Trusted By',
    label: 'Section heading',
    element: 'h2',
    accent: true,
    default: '[[Trusted By ]]Organizations Like',
  },

  {
    key: 'quoteForm.h2',
    section: 'Quote Form',
    label: 'Section heading',
    element: 'h2',
    default: 'Get Your Free Container Quote in Minutes',
  },

  {
    key: 'reviews.h2',
    section: 'Customer Reviews',
    label: 'Section heading',
    element: 'h2',
    accent: true,
    default: 'What Our [[Customers]] Say',
    help: 'Used by both the static and the live reviews section.',
  },

  {
    key: 'states.h2',
    section: 'States We Serve',
    label: 'Section heading',
    element: 'h2',
    default: 'Delivering Across All 50 States',
  },
];

/** Section order for the admin UI, matching top-to-bottom page order. */
export const HOME_HEADING_SECTIONS: readonly string[] = [
  ...new Set(HOME_HEADINGS.map((h) => h.section)),
];

/** Every heading's shipped text, keyed — the fallback layer under Redis. */
export const HOME_HEADING_DEFAULTS: Record<string, string> = Object.fromEntries(
  HOME_HEADINGS.map((h) => [h.key, h.default]),
);

/** Pages the Content Editor can edit. Only the homepage for now. */
export type ContentPage = {
  id: string;
  path: string;
  label: string;
  headings: readonly HeadingField[];
};

export const CONTENT_PAGES: readonly ContentPage[] = [
  { id: 'home', path: ROUTES.HOME, label: 'Homepage', headings: HOME_HEADINGS },
];

export function findContentPageById(id: string): ContentPage | undefined {
  return CONTENT_PAGES.find((page) => page.id === id);
}
