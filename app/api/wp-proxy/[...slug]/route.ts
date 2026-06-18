import { type NextRequest } from 'next/server'
import { fetchWordPressPage } from '@/services/wp-proxy.service'

const WP_ORIGIN = 'https://onsitestorage.com'

// Replace the WordPress origin with the local origin ONLY inside <script> tags
// so that AJAX calls (ajaxurl, wp-json fetch, etc.) route through our Next.js
// rewrites instead of hitting the WordPress site cross-origin (CORS).
// We leave src/href attributes untouched — those point to the CDN directly.
function proxyScriptUrls(html: string, localOrigin: string): string {
  return html.replace(
    /(<script(?:\s[^>]*)?>)([\s\S]*?)(<\/script>)/gi,
    (_, open: string, body: string, close: string) => {
      // Skip external scripts — they have no inline body to rewrite
      if (/\bsrc\s*=/i.test(open)) return _
      const rewritten = body
        // JSON-escaped variant: https:\/\/onsitestorage.com
        .replace(/https:\\\/\\\/onsitestorage\.com/g,
          localOrigin.replace(/\//g, '\\/'))
        // Plain variant: https://onsitestorage.com
        .replace(/https:\/\/onsitestorage\.com/g, localOrigin)
      return open + rewritten + close
    },
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params
  const search = request.nextUrl.search
  const localOrigin = request.nextUrl.origin // e.g. http://localhost:3000

  const data = await fetchWordPressPage(slug.join('/'), search)
  if (!data) return new Response('Not found', { status: 404 })

  const headElements  = proxyScriptUrls(data.headElements,  localOrigin)
  const preScripts    = proxyScriptUrls(data.preScripts,    localOrigin)
  const elementorHtml = proxyScriptUrls(data.elementorHtml, localOrigin)
  const footerScripts = proxyScriptUrls(data.footerScripts, localOrigin)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${headElements}
</head>
<body class="${data.bodyClass}">
${preScripts}
${elementorHtml}
${footerScripts}
<script>
(function () {
  var origin = window.location.origin;
  var wpOrigin = '${WP_ORIGIN}';

  // Resolve any URL (relative, absolute local, or absolute WP) to a local path.
  // Returns null for truly external URLs that should navigate normally.
  function toLocalPath(url) {
    if (!url) return null;
    var a = document.createElement('a');
    a.href = url;
    var abs = a.href;
    if (abs === origin || abs === origin + '/') return '/';
    if (abs.startsWith(origin + '/')) return abs.slice(origin.length);
    if (abs === wpOrigin || abs === wpOrigin + '/') return '/';
    if (abs.startsWith(wpOrigin + '/')) return '/' + abs.slice(wpOrigin.length + 1);
    return null;
  }

  function interceptNav(url) {
    var path = toLocalPath(url);
    if (path) {
      window.parent.postMessage({ type: 'wp-proxy-navigate', href: path }, origin);
      return true;
    }
    return false;
  }

  // ── Intercept window.location.href = url ─────────────────────────────────
  try {
    var locProto = Object.getPrototypeOf(window.location);
    var hrefDesc = Object.getOwnPropertyDescriptor(locProto, 'href');
    if (hrefDesc && hrefDesc.set) {
      var _origSet = hrefDesc.set;
      Object.defineProperty(locProto, 'href', {
        get: hrefDesc.get,
        set: function (url) { if (!interceptNav(url)) _origSet.call(window.location, url); },
        configurable: true,
        enumerable: hrefDesc.enumerable,
      });
    }
  } catch (e) {}

  // ── Intercept location.assign() and location.replace() ───────────────────
  try {
    var _origAssign = Location.prototype.assign;
    Location.prototype.assign = function (url) {
      if (!interceptNav(url)) _origAssign.call(this, url);
    };
    var _origReplace = Location.prototype.replace;
    Location.prototype.replace = function (url) {
      if (!interceptNav(url)) _origReplace.call(this, url);
    };
  } catch (e) {}

  // ── Height reporting ──────────────────────────────────────────────────────
  function reportHeight() {
    var h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    window.parent.postMessage({ type: 'wp-proxy-height', height: h }, origin);
  }
  window.addEventListener('load', reportHeight);
  new MutationObserver(reportHeight).observe(document.body, {
    childList: true, subtree: true, attributes: true,
  });

  // ── Intercept <a> clicks (covers both relative and absolute WP URLs) ──────
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
    var path = toLocalPath(href);
    if (path) {
      e.preventDefault();
      window.parent.postMessage({ type: 'wp-proxy-navigate', href: path }, origin);
    }
  });
}());
</script>
</body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
