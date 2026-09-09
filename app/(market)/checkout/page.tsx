import { Suspense } from 'react';
import { JsonLd } from '@/components/shared/JsonLd';
import { PageHeadScripts } from '@/components/shared/PageHeadScripts';
import { PersistGuestLead } from '@/components/shared/PersistGuestLead';
import { ROUTES } from '@/config/routes';
import { readQuoteDraft } from '@/lib/quoteDraft';
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

/**
 * Writes the quote form's details into the guest store, if a draft is waiting.
 *
 * The delivery-quote form now lands here directly rather than on its review
 * page, and that write only ever happened on the review page — so without this
 * a guest could complete the form and arrive at checkout with nothing filled
 * in, having just typed all of it. The draft cookie is httpOnly, so reading it
 * has to happen on the server and the values are handed down.
 *
 * Renders nothing when there is no draft, which is every other way of reaching
 * checkout.
 */
async function CarryQuoteDetails() {
  const draft = await readQuoteDraft();
  if (!draft?.email) return null;

  return (
    <PersistGuestLead
      fullName={draft.fullName}
      email={draft.email}
      phone={draft.phone}
      address={draft.address}
    />
  );
}

export default function CheckoutPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={ROUTES.CHECKOUT} />
      {/* Reads the draft cookie, so it is request-time data and would otherwise
          stop this route prerendering at all. The fallback is `null` because it
          renders nothing either way — it exists to write to localStorage. */}
      <Suspense fallback={null}>
        <CarryQuoteDetails />
      </Suspense>
      <CheckoutClient />
    </>
  );
}
