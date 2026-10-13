/**
 * This app's own origin, with **no trailing slash** — always.
 *
 * Every caller joins it as `${BASE_URL}/path`, 58 of them. The fallback used to
 * end in a slash, so wherever `NEXT_PUBLIC_BASE_URL` is unset — the deployed
 * site among them — every one of those produced `//path`. Link enrichment
 * matches on the pathname, and `//sale-shipping-containers/` is not
 * `/sale-shipping-containers/`, so no listing link on the live site ever
 * carried the visitor's ZIP while the same code worked locally, where the env
 * value happens to have no slash. Four call sites had already worked around it
 * by stripping the slash themselves; normalising it here makes that the rule
 * rather than something each caller has to know.
 */
export const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://oss-next.vercel.app').replace(
  /\/+$/,
  '',
);
export const CONTACT_NUMBER = "(888) 977-9085";

/**
 * A dialable `tel:` target for a display number.
 *
 * `tel:` takes digits, not punctuation — "(888) 977-9085" pasted straight into
 * an href is not a valid dial string. The site already carries two
 * hand-written spellings of this number, `tel:18889779085` and
 * `tel:8889779085`, which is how a third gets written; derive it instead.
 *
 * Emits E.164 (`+1…`) for a 10-digit North American number, which is the form
 * that dials correctly from abroad and from a phone roaming outside its home
 * country. Anything else is passed through with its punctuation stripped.
 */
export function telHref(display: string): string {
  const digits = display.replace(/\D/g, "");
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `tel:+${digits}`;
  return `tel:${digits}`;
}