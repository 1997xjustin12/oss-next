/**
 * Holds a third-party snippet back until the visitor does something, or a few
 * seconds have passed, whichever comes first.
 *
 * Tag Manager and what it pulls in (two Analytics tags, Meta, Clarity, Bing) and
 * the Zoho chat cost a phone about 700 ms of blocked main thread and 850 KiB.
 * `lazyOnload` alone moved that work after the load event but still inside the
 * first seconds someone is trying to read and tap the page.
 *
 * The cost is measurement: a visitor who leaves without touching the page inside
 * the delay is not counted by those tags. A longer delay loses more of them.
 */
export const DEFERRED_SCRIPT_DELAY_MS = 5000

const ENGAGEMENT_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart']

/** `code` wrapped so it runs once, when the page is next idle after the first engagement or the delay. */
export function runOnEngagement(code: string): string {
  return `(function(){var e=${JSON.stringify(ENGAGEMENT_EVENTS)},o={passive:true},f=false,t;
function g(){if(f)return;f=true;clearTimeout(t);e.forEach(function(n){removeEventListener(n,g,o)});
(window.requestIdleCallback||setTimeout)(function(){${code}},{timeout:2000})}
e.forEach(function(n){addEventListener(n,g,o)});t=setTimeout(g,${DEFERRED_SCRIPT_DELAY_MS})})();`
}
