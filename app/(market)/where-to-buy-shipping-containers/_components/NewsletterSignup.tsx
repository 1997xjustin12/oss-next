import { NewsletterForm } from "@/components/shared/NewsletterForm";

/**
 * The newsletter band. The form is the shared `NewsletterForm`, which sends a
 * signup to Zoho CRM (as the WordPress page's embedded Zoho form did) and to
 * the Django backend, through `subscribeToNewsletter`.
 */
export function NewsletterSignup() {
  return (
    <section aria-labelledby="newsletter-heading" className="bg-theme-dark px-4 py-12 text-white sm:px-[5%] sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h2 id="newsletter-heading" className="text-center text-2xl font-extrabold uppercase leading-tight sm:text-3xl">
          Subscribe to our newsletter to receive the latest news and exclusive offers
        </h2>
        <div className="mt-8">
          <NewsletterForm tone="dark" />
        </div>
      </div>
    </section>
  );
}
