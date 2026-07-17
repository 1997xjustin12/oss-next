import type { Metadata } from 'next';
import { JsonLd } from '@/components/shared/JsonLd';
import { ROUTES } from '@/config/routes';
import { CheckoutClient } from './_components/CheckoutClient';


export const metadata: Metadata = {
  title: 'Checkout',
  description:
    'Complete your shipping container purchase securely with On-Site Storage Solutions. Enter your details and payment information to finalize your order.',
  alternates: { canonical: ROUTES.CHECKOUT },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Checkout | On-Site Storage Solutions',
    description: 'Complete your shipping container order — secure checkout, fast nationwide delivery.',
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
      <JsonLd data={jsonLd} />
      <CheckoutClient />
    </>
  );
}
