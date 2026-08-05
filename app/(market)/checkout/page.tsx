import { JsonLd } from '@/components/shared/JsonLd';
import { PageHeadScripts } from '@/components/shared/PageHeadScripts';
import { ROUTES } from '@/config/routes';
import { resolvePageMetadata } from '@/lib/seo';
import { CheckoutClient } from './_components/CheckoutClient';

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.CHECKOUT);
}

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
      <PageHeadScripts path={ROUTES.CHECKOUT} />
      <CheckoutClient />
    </>
  );
}
