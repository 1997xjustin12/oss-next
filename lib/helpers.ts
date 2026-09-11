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