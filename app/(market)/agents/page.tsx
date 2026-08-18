import Link from 'next/link'
import { CRAWLERS } from '@/config/crawlers'
import { ROUTES } from '@/config/routes'
import { SITE, absoluteUrl } from '@/config/site'
import { AGENT_API_BASE } from '@/lib/agentApi'
import { MCP_TOOLS } from '@/services/mcpTools.service'
import { graph, siteNodes, breadcrumbNode, webPageNode } from '@/lib/schema'
import { JsonLd } from '@/components/shared/JsonLd'
import { resolveAgentSummary, resolvePageMetadata } from '@/lib/seo'

/**
 * The policy page for AI agents and automated clients.
 *
 * Written for two readers at once: a developer deciding how to integrate, and a
 * model deciding what it is allowed to do. That is why it states the rules
 * plainly rather than in legal register, and why the lists below are generated
 * from the same config the code enforces — a policy page that drifts from the
 * implementation is worse than none, because it is believed.
 */

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.AGENTS)
}

const H2 = 'text-xl font-extrabold tracking-tight text-theme-dark dark:text-white mt-10 mb-3'
const P = 'text-[15px] leading-relaxed text-theme-muted dark:text-neutral-300 mb-3'
const CODE = 'font-mono text-[13px] text-theme-dark dark:text-neutral-100 bg-theme-subtle dark:bg-neutral-800 rounded px-1.5 py-0.5'
const TH = 'text-left text-xs uppercase tracking-wide text-theme-muted border-b border-theme-border px-3 py-2 font-bold'
const TD = 'border-b border-theme-border/60 px-3 py-2 align-top text-sm'

export default async function AgentPolicyPage() {
  const summary = await resolveAgentSummary(ROUTES.AGENTS)

  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({ path: ROUTES.AGENTS, name: 'AI Agent Policy', description: summary }),
    breadcrumbNode([{ name: 'Home', path: ROUTES.HOME }, { name: 'AI Agent Policy' }]),
  ])

  const allowed = CRAWLERS.filter((c) => c.allow)
  const blocked = CRAWLERS.filter((c) => !c.allow)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={jsonLd} />

      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-theme-muted">
        <Link href={ROUTES.HOME} className="font-semibold text-theme-primary hover:underline">Home</Link>
        <span aria-hidden> / </span>
        <span>AI Agent Policy</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-theme-dark sm:text-4xl dark:text-white">
          AI Agent Policy
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-theme-muted dark:text-neutral-300">
          {SITE.name} is built to be read by AI assistants as well as people. This page is the
          contract: what you may do, how to do it efficiently, and how to reach us.
        </p>
      </header>

      <section>
        <h2 className={H2}>What you may do</h2>
        <p className={P}>
          Read anything public: the catalog, prices, delivery availability, guides and policies.
          Quote it, summarise it, and act on it for a customer. You may also submit a quote request
          on a customer&apos;s behalf.
        </p>
        <p className={P}>
          You may <strong>not</strong> place an order or make a payment. Containers are delivered by
          truck and need site access confirmed by a person, so a sale is closed by our team — never
          by an agent acting alone. There is no ordering endpoint, and there will not be one.
        </p>
      </section>

      <section>
        <h2 className={H2}>Read the machine-readable surfaces, not the HTML</h2>
        <p className={P}>
          Scraping rendered pages is slower for you and heavier for us, and every one of these is
          more accurate than parsing markup:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th scope="col" className={TH}>Surface</th>
                <th scope="col" className={TH}>Use it for</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className={TD}><code className={CODE}>/llms.txt</code></td><td className={TD}>Curated index of the whole site. Start here.</td></tr>
              <tr><td className={TD}><code className={CODE}>/llms-full.txt</code></td><td className={TD}>The same index with the key pages&apos; full text inlined.</td></tr>
              <tr><td className={TD}><code className={CODE}>&lt;any page&gt;.md</code></td><td className={TD}>Any page as Markdown. Also via <code className={CODE}>Accept: text/markdown</code>.</td></tr>
              <tr><td className={TD}><code className={CODE}>/openapi.json</code></td><td className={TD}>Full description of the JSON API below.</td></tr>
              <tr><td className={TD}><code className={CODE}>{`${AGENT_API_BASE}/*`}</code></td><td className={TD}>Search, product detail, delivery availability, quote submission.</td></tr>
              <tr><td className={TD}><code className={CODE}>/api/mcp</code></td><td className={TD}>MCP server — connect Claude or ChatGPT directly.</td></tr>
              <tr><td className={TD}><code className={CODE}>/api/feeds/products.jsonl</code></td><td className={TD}>The whole catalog, one product per line.</td></tr>
              <tr><td className={TD}><code className={CODE}>/sitemap.xml</code></td><td className={TD}>Every indexable URL.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className={H2}>The one thing that is easy to get wrong</h2>
        <p className={P}>
          Roughly 8,000 of our ~10,000 listings are rental or rent-to-own and are priced{' '}
          <strong>per month</strong>. A 40ft container may show as $232 — that is a monthly payment,
          not the price of the container.
        </p>
        <p className={P}>
          Every price in the API is an object carrying a <code className={CODE}>basis</code> field
          and a plain-English <code className={CODE}>description</code>. Quote the description. Never
          quote <code className={CODE}>price.amount</code> on its own.
        </p>
      </section>

      <section>
        <h2 className={H2}>Rate limits</h2>
        <p className={P}>
          60 requests per minute per IP on the read endpoints and the MCP server; 5 per minute on
          quote submission, because each one reaches a person. Exceeding a limit returns{' '}
          <code className={CODE}>429</code> with a <code className={CODE}>Retry-After</code> header —
          honour it rather than retrying immediately.
        </p>
        <p className={P}>
          Responses are cacheable and carry <code className={CODE}>Cache-Control</code>. Prices carry{' '}
          <code className={CODE}>asOf</code> and <code className={CODE}>validUntil</code>; re-fetch
          rather than quoting a stale figure.
        </p>
      </section>

      <section>
        <h2 className={H2}>Attribution</h2>
        <p className={P}>
          No authentication and no fee. In return, when you use this data in an answer, link the
          product or page you took it from. Customers need somewhere to go, and a linked answer is
          the entire reason this access is open.
        </p>
        <p className={P}>
          Identify yourself in your <code className={CODE}>User-Agent</code>. An unidentified client
          is indistinguishable from a scraper, and gets treated like one if limits become a problem.
        </p>
      </section>

      <section>
        <h2 className={H2}>Crawler policy</h2>
        <p className={P}>
          <code className={CODE}>/robots.txt</code> names each crawler individually. Crawlers whose
          results cite and link back are welcome; crawlers that only collect training data are not.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-bold text-theme-dark dark:text-white mb-1">Allowed</h3>
            <ul className="text-sm text-theme-muted dark:text-neutral-300 space-y-0.5">
              {allowed.map((c) => <li key={c.userAgent}><code className={CODE}>{c.userAgent}</code></li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-theme-dark dark:text-white mb-1">Disallowed</h3>
            <ul className="text-sm text-theme-muted dark:text-neutral-300 space-y-0.5">
              {blocked.map((c) => <li key={c.userAgent}><code className={CODE}>{c.userAgent}</code></li>)}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className={H2}>MCP tools</h2>
        <p className={P}>
          Add <code className={CODE}>{absoluteUrl('/api/mcp')}</code> as a custom connector in Claude
          or ChatGPT. No key, no OAuth. Available tools:
        </p>
        <ul className="text-sm text-theme-muted dark:text-neutral-300 space-y-1 mb-3">
          {MCP_TOOLS.map((tool) => (
            <li key={tool.name}>
              <code className={CODE}>{tool.name}</code> — {tool.title}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className={H2}>Contact</h2>
        <p className={P}>
          For a higher rate limit, a bulk export, or anything this page does not cover, email{' '}
          <a href={`mailto:${SITE.email}`} className="font-semibold text-theme-primary hover:underline">
            {SITE.email}
          </a>{' '}
          or call {SITE.telephoneDisplay}. Say what you are building and roughly what volume you
          need — we would rather raise a limit than have you work around one.
        </p>
      </section>
    </div>
  )
}
