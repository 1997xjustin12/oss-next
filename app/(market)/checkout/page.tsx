import type { Metadata } from 'next';
import { CheckoutClient } from './_components/CheckoutClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Checkout',
  description:
    'Complete your shipping container reservation with On-Site Storage Solutions. No commitment required — we confirm all details before finalizing your order.',
  alternates: { canonical: '/checkout' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Checkout | On-Site Storage Solutions',
    description: 'Reserve your shipping container today. No deposit, no commitment.',
    type: 'website',
    url: 'https://onsitestorage.com/checkout',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://onsitestorage.com' },
    { '@type': 'ListItem', position: 2, name: 'Checkout', item: 'https://onsitestorage.com/checkout' },
  ],
};

export default function CheckoutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CheckoutClient />
    </>
  );
}
