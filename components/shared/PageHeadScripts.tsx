import Script from 'next/script';
import { getPageSeo } from '@/services/seo.service';

// Renders the third-party scripts attached to a page in the admin Page
// Configurator. Server Component — the only client cost is the scripts an
// author actually adds.
//
// Everything goes through next/script rather than a raw <script> tag so the
// strategy is honoured and the storefront keeps the loading behaviour AGENTS.md
// asks for. `beforeInteractive` isn't offered: next/script only honours it from
// the root layout, so a per-page one would quietly downgrade itself.
//
// Note: the script bodies come from Redis and execute on the page. Only the
// admin writes them, and the admin is unreachable in production — treat write
// access to this Redis namespace as equivalent to script access to the site.

type Props = {
  /** The live path of the page, matching its entry in config/pages.ts. */
  path: string;
};

export async function PageHeadScripts({ path }: Props) {
  const seo = await getPageSeo(path);
  const scripts = seo?.scripts?.filter((script) => script.enabled) ?? [];

  if (scripts.length === 0) return null;

  return (
    <>
      {scripts.map((script) =>
        script.src ? (
          <Script key={script.id} id={script.id} src={script.src} strategy={script.strategy} />
        ) : (
          <Script
            key={script.id}
            id={script.id}
            strategy={script.strategy}
            dangerouslySetInnerHTML={{ __html: script.code ?? '' }}
          />
        ),
      )}
    </>
  );
}
