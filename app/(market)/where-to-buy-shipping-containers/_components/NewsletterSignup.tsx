"use client";

import { useState } from "react";
import { subscribeToNewsletter } from "@/lib/newsletter";
import { getRecaptchaToken, preloadRecaptcha } from "@/lib/recaptchaClient";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done" } | { kind: "error"; message: string };

/**
 * Newsletter signup. Replaces the WordPress page's embedded Zoho form: posts
 * to /api/subscribers/subscribe (the backend list), with a reCAPTCHA token
 * when a site key is configured.
 */
export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "sending" });
    const token = RECAPTCHA_SITE_KEY ? await getRecaptchaToken(RECAPTCHA_SITE_KEY, "newsletter").catch(() => null) : null;
    const result = await subscribeToNewsletter(email.trim(), token);
    if (result.ok) {
      setStatus({ kind: "done" });
      setEmail("");
    } else {
      setStatus({ kind: "error", message: result.error });
    }
  }

  return (
    <section aria-labelledby="newsletter-heading" className="bg-theme-dark px-4 py-12 text-white sm:px-[5%] sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 id="newsletter-heading" className="text-2xl font-extrabold uppercase leading-tight sm:text-3xl">
          Subscribe to our newsletter to receive the latest news and exclusive offers
        </h2>
        <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row" noValidate>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // Load reCAPTCHA when someone starts on the form, not with the page:
            // it gets time to observe the visitor, and nobody else downloads it.
            onFocus={() => RECAPTCHA_SITE_KEY && preloadRecaptcha(RECAPTCHA_SITE_KEY)}
            placeholder="Your email address"
            aria-invalid={status.kind === "error" || undefined}
            aria-describedby="newsletter-status"
            className="min-h-12 w-full flex-1 rounded-md border border-white/30 bg-white px-4 text-theme-dark placeholder:text-theme-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          />
          <button
            type="submit"
            disabled={status.kind === "sending"}
            className="min-h-12 rounded-md border border-theme-primary bg-theme-primary px-8 font-bold text-white transition-colors hover:bg-white hover:text-theme-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-theme-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status.kind === "sending" ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
        <p id="newsletter-status" role="status" className="mt-4 min-h-6 text-sm text-gray-200">
          {status.kind === "done" && "Thanks! You're subscribed."}
          {status.kind === "error" && <span className="text-red-300">{status.message}</span>}
        </p>
      </div>
    </section>
  );
}
