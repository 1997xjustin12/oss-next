import type { Metadata } from 'next';
import { CheckCircle2, Globe, Lock, MessagesSquare } from 'lucide-react';
import { setChatCountriesAction } from '@/actions/chatRegion';
import { CHAT_COUNTRIES_RELAXED, CHAT_COUNTRIES_STRICT } from '@/config/chat';
import { readChatStrictFlag } from '@/lib/chatCountries';
import { isRegionLocked } from '@/lib/chatRegion';

/**
 * Admin → AI Assistant. Which countries the chat is offered in.
 *
 * ## Why this screen exists
 *
 * This was `CHAT_ALLOWED_COUNTRIES`, an environment variable. Changing it meant
 * editing it in the Vercel dashboard and redeploying — so the person who wanted
 * the change could not make it, and the person who could had to run a deploy to
 * flip a boolean. It is now a Redis flag, live in seconds, same arrangement the
 * maintenance wall already uses.
 *
 * The two options are fixed sets rather than an editable country list, because
 * the thing being chosen between is not really "which countries" — it is "are
 * we serving customers, or are we also letting the team test from Manila". A
 * free-text field would answer a question nobody asked and accept `US,CANADA`
 * while it did.
 *
 * The switch changes who may *use* the assistant. It does not change where the
 * catalogue ships, and turning the Philippines on does not open a market.
 */

export const metadata: Metadata = { title: 'AI Assistant' };

type Props = {
  searchParams: Promise<{ saved?: string }>;
};

const CARD =
  'rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900';

const OPTIONS = [
  {
    mode: 'strict' as const,
    label: 'On — sales markets only',
    countries: CHAT_COUNTRIES_STRICT,
    description:
      'The assistant answers visitors in the US and Canada, the markets the catalogue ships to. Everyone else is told it is unavailable. This is the setting to run on.',
  },
  {
    mode: 'relaxed' as const,
    label: 'Off — also allow the Philippines',
    countries: CHAT_COUNTRIES_RELAXED,
    description:
      'Adds the Philippines so the team can use the assistant on the live site without a VPN. Every message still costs a model call, so this is a wider spend — not a wider market.',
  },
];

export default async function ChatSettingsPage({ searchParams }: Props) {
  const [{ saved }, strict] = await Promise.all([searchParams, readChatStrictFlag()]);
  const locked = isRegionLocked();
  const current = strict ? CHAT_COUNTRIES_STRICT : CHAT_COUNTRIES_RELAXED;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-xl font-extrabold tracking-tight text-theme-dark dark:text-white">
          AI Assistant
        </h1>
        <p className="mt-1 text-sm text-theme-muted dark:text-neutral-400">
          Where the shopping assistant is offered. Every message costs a model call, so this points
          that spend at the people you can actually sell to.
        </p>
      </header>

      {saved && (
        <p
          role="status"
          className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          Saved. The assistant is now offered in {current.join(', ')}. It can take up to 20 seconds
          to apply everywhere.
        </p>
      )}

      {/* Stated before the choice, because otherwise the screen reads as though
          it has no effect and the switch looks broken. */}
      {!locked && (
        <p className="mb-6 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            <strong className="font-bold">Not being enforced here.</strong> The country restriction
            only applies on the production site, so on this environment the assistant answers
            everyone whichever option is selected. Your choice is still saved and does apply in
            production.
          </span>
        </p>
      )}

      <section className={CARD}>
        <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
          <MessagesSquare className="h-4 w-4 text-theme-primary" aria-hidden />
          Country restriction
        </h2>

        <ul className="mt-4 space-y-3">
          {OPTIONS.map((option) => {
            const active = (option.mode === 'strict') === strict;

            return (
              <li
                key={option.mode}
                className={[
                  'rounded-md border p-4 transition-colors',
                  active
                    ? 'border-theme-primary bg-theme-primary/5 dark:bg-theme-primary/10'
                    : 'border-theme-border dark:border-neutral-700',
                ].join(' ')}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="flex flex-wrap items-center gap-2 text-sm font-bold text-theme-dark dark:text-neutral-100">
                      {option.label}
                      {active && (
                        <span className="rounded-full bg-theme-primary px-2 py-0.5 text-[11px] font-bold text-white">
                          Current
                        </span>
                      )}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-theme-muted dark:text-neutral-400">
                      {option.description}
                    </p>
                    {/* The country codes spelled out, so nobody has to infer
                        which way round "on" and "off" run. */}
                    <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-theme-muted/80 dark:text-neutral-500">
                      <Globe className="h-3 w-3" aria-hidden />
                      {option.countries.join(', ')}
                    </p>
                  </div>

                  {!active && (
                    <form action={setChatCountriesAction} className="shrink-0">
                      <input type="hidden" name="mode" value={option.mode} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-md bg-theme-primary px-3.5 py-2 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
                      >
                        Switch to this
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="mt-8 rounded-lg border border-dashed border-theme-border p-4 text-xs leading-relaxed text-theme-muted dark:border-neutral-700 dark:text-neutral-500">
        <p>
          <strong className="font-semibold">If this setting cannot be read</strong> — Redis
          unreachable, say — the assistant falls back to US and Canada rather than switching itself
          off. Customers keep their assistant; only testing from the Philippines stops until it
          recovers.
        </p>
        <p className="mt-2">
          This is a usage control, not a security boundary. It reads the visitor&rsquo;s country from
          the hosting platform, which a VPN defeats in both directions. Nothing behind it should
          treat the country as proven.
        </p>
      </footer>
    </div>
  );
}
