import Script from 'next/script'
import { GTM_ENV_PARAMS, GTM_ENVIRONMENT, GTM_ID } from '@/config/googleTag'

/**
 * The GTM loader script for this deployment's environment (see
 * config/googleTag.ts). Renders nothing where no environment matches.
 *
 * The snippet is GTM's own, unchanged apart from the environment parameters.
 * Through next/script with `lazyOnload`, per the project's rule for analytics:
 * the container loads once the page is idle instead of competing with it.
 * Events pushed to `dataLayer` before then are queued and still sent.
 */
export function GoogleTagManager() {
  if (!GTM_ENVIRONMENT) return null
  const env = GTM_ENV_PARAMS[GTM_ENVIRONMENT]

  return (
    <Script id="google-tag-manager" strategy="lazyOnload">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl+'${env}';f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  )
}

/** GTM's no-JavaScript fallback. Goes immediately after the opening <body> tag. */
export function GoogleTagManagerNoScript() {
  if (!GTM_ENVIRONMENT) return null
  const src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}${GTM_ENV_PARAMS[GTM_ENVIRONMENT]}`

  return (
    <noscript>
      <iframe src={src} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="Google Tag Manager" />
    </noscript>
  )
}
