import { Code2, RotateCcw, Save, Trash2 } from 'lucide-react';
import { resetPageSeoAction, savePageSeoAction } from '@/actions/seo';
import { MAX_PAGE_SCRIPTS } from '@/config/admin';
import type { NativePage } from '@/config/pages';
import { ogImageUrl } from '@/types/seo';
import type { HeadScript, PageSeo, PageSeoDefaults } from '@/types/seo';

// Server Component end to end: a plain <form> posting to a Server Action, with
// no client-side state at all. Adding a script row works because the form always
// renders one blank row past the saved ones — fill it in, save, and the next
// render hands you a fresh blank row.

type Props = {
  page: NativePage;
  seo: PageSeo | null;
  defaults: PageSeoDefaults;
};

const INPUT_CLASS =
  'w-full rounded-md border border-theme-border bg-theme-bg px-3 py-2 text-sm text-theme-dark placeholder:text-theme-muted/70 focus:border-theme-primary focus:ring-1 focus:ring-theme-primary focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600';

const LABEL_CLASS = 'block text-sm font-semibold text-theme-dark dark:text-neutral-200';

const HELP_CLASS = 'mt-1 text-xs text-theme-muted dark:text-neutral-500';

const CARD_CLASS =
  'rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900';

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className={CARD_CLASS}>
      <h2 className="text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
        {title}
      </h2>
      <p className={HELP_CLASS}>{description}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function ScriptRow({ index, script }: { index: number; script?: HeadScript }) {
  const prefix = `script.${index}`;

  return (
    <fieldset className="rounded-md border border-theme-border p-3 dark:border-neutral-800">
      <legend className="px-1 text-xs font-semibold text-theme-muted dark:text-neutral-500">
        {script ? script.name : 'Add a script'}
      </legend>

      {script && <input type="hidden" name={`${prefix}.id`} value={script.id} />}

      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor={`${prefix}.name`}>
              Name
            </label>
            <input
              id={`${prefix}.name`}
              name={`${prefix}.name`}
              type="text"
              defaultValue={script?.name ?? ''}
              placeholder="Meta Pixel"
              className={`mt-1 ${INPUT_CLASS}`}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor={`${prefix}.strategy`}>
              Loading strategy
            </label>
            <select
              id={`${prefix}.strategy`}
              name={`${prefix}.strategy`}
              defaultValue={script?.strategy ?? 'lazyOnload'}
              className={`mt-1 ${INPUT_CLASS}`}
            >
              <option value="lazyOnload">Lazy — during idle time (default)</option>
              <option value="afterInteractive">After interactive — load early</option>
            </select>
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor={`${prefix}.src`}>
            Script URL
          </label>
          <input
            id={`${prefix}.src`}
            name={`${prefix}.src`}
            type="url"
            defaultValue={script?.src ?? ''}
            placeholder="https://example.com/pixel.js"
            className={`mt-1 ${INPUT_CLASS}`}
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor={`${prefix}.code`}>
            Inline code
          </label>
          <textarea
            id={`${prefix}.code`}
            name={`${prefix}.code`}
            rows={4}
            defaultValue={script?.code ?? ''}
            placeholder="console.log('hello')"
            className={`mt-1 font-mono text-xs ${INPUT_CLASS}`}
          />
          <p className={HELP_CLASS}>
            The body only — no <code>&lt;script&gt;</code> tags. Ignored if a script URL is set.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <label className="flex items-center gap-2 text-sm text-theme-mid dark:text-neutral-300">
            <input
              type="checkbox"
              name={`${prefix}.enabled`}
              defaultChecked={script ? script.enabled : true}
              className="h-4 w-4 rounded border-theme-border accent-theme-primary dark:border-neutral-700"
            />
            Enabled
          </label>

          {script && (
            <label className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
              <input
                type="checkbox"
                name={`${prefix}.delete`}
                className="h-4 w-4 rounded border-theme-border accent-red-600 dark:border-neutral-700"
              />
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete on save
            </label>
          )}
        </div>
      </div>
    </fieldset>
  );
}

export function SeoForm({ page, seo, defaults }: Props) {
  const scripts = seo?.scripts ?? [];
  const robotsValue = seo?.robots
    ? `${seo.robots.index ? 'index' : 'noindex'},${seo.robots.follow ? 'follow' : 'nofollow'}`
    : 'default';

  const defaultRobotsLabel = defaults.robots
    ? `${defaults.robots.index ? 'index' : 'noindex'}, ${defaults.robots.follow ? 'follow' : 'nofollow'}`
    : 'index, follow';

  // One blank row past the saved ones, capped so the form can never render a
  // row the save action wouldn't scan.
  const showBlankRow = scripts.length < MAX_PAGE_SCRIPTS;

  return (
    <>
      <form action={savePageSeoAction} className="space-y-5">
        <input type="hidden" name="pageId" value={page.id} />

        <Section
          title="Search engine"
          description="Left blank, each field falls back to the value shown as its placeholder — the page's built-in default."
        >
          <div>
            <label className={LABEL_CLASS} htmlFor="title">
              Meta title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={seo?.title ?? ''}
              placeholder={defaults.title}
              className={`mt-1 ${INPUT_CLASS}`}
            />
            <p className={HELP_CLASS}>Aim for 50–60 characters before truncation.</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="description">
              Meta description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={seo?.description ?? ''}
              placeholder={defaults.description}
              className={`mt-1 ${INPUT_CLASS}`}
            />
            <p className={HELP_CLASS}>Aim for 140–160 characters.</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="agentSummary">
              Agent summary
            </label>
            <textarea
              id="agentSummary"
              name="agentSummary"
              rows={3}
              defaultValue={seo?.agentSummary ?? ''}
              placeholder={defaults.agentSummary ?? defaults.description}
              className={`mt-1 ${INPUT_CLASS}`}
            />
            <p className={HELP_CLASS}>
              Plain-language description of what this page covers, for AI assistants — it
              feeds <code>/llms.txt</code> and the page&apos;s structured data. Unlike the meta
              description this is not competing for clicks, so write two or three plain
              sentences that actually explain the page. Length is not constrained.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="keywords">
              Keywords
            </label>
            <input
              id="keywords"
              name="keywords"
              type="text"
              defaultValue={seo?.keywords?.join(', ') ?? ''}
              placeholder="shipping containers, 40ft container, container delivery"
              className={`mt-1 ${INPUT_CLASS}`}
            />
            <p className={HELP_CLASS}>
              Comma-separated. Rendered as <code>&lt;meta name=&quot;keywords&quot;&gt;</code>.
              Google ignores this tag; Bing and some internal tools still read it.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="canonical">
              Canonical URL
            </label>
            <input
              id="canonical"
              name="canonical"
              type="text"
              defaultValue={seo?.canonical ?? ''}
              placeholder={defaults.canonical}
              className={`mt-1 ${INPUT_CLASS}`}
            />
            <p className={HELP_CLASS}>
              Root-relative (<code>/cart</code>) or absolute. Relative paths resolve against the
              site&apos;s <code>metadataBase</code>.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="robots">
              Robots
            </label>
            <select
              id="robots"
              name="robots"
              defaultValue={robotsValue}
              className={`mt-1 ${INPUT_CLASS}`}
            >
              <option value="default">Page default ({defaultRobotsLabel})</option>
              <option value="index,follow">index, follow</option>
              <option value="index,nofollow">index, nofollow</option>
              <option value="noindex,follow">noindex, follow</option>
              <option value="noindex,nofollow">noindex, nofollow</option>
            </select>
            {!page.indexable && (
              <p className={HELP_CLASS}>
                This page is intentionally kept out of the index — setting it to{' '}
                <code>index</code> will expose it to search engines.
              </p>
            )}
          </div>
        </Section>

        <Section
          title="Social sharing"
          description="Open Graph tags — what Facebook, LinkedIn, Slack and iMessage show when the page is shared. Falls back to the meta title and description above."
        >
          <div>
            <label className={LABEL_CLASS} htmlFor="ogTitle">
              OG title
            </label>
            <input
              id="ogTitle"
              name="ogTitle"
              type="text"
              defaultValue={seo?.openGraph?.title ?? ''}
              placeholder={defaults.openGraph?.title ?? defaults.title}
              className={`mt-1 ${INPUT_CLASS}`}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ogDescription">
              OG description
            </label>
            <textarea
              id="ogDescription"
              name="ogDescription"
              rows={3}
              defaultValue={seo?.openGraph?.description ?? ''}
              placeholder={defaults.openGraph?.description ?? defaults.description}
              className={`mt-1 ${INPUT_CLASS}`}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ogImage">
              OG image
            </label>
            <input
              id="ogImage"
              name="ogImage"
              type="text"
              defaultValue={seo?.openGraph?.image ?? ''}
              placeholder={ogImageUrl(defaults.openGraph?.images?.[0]) ?? '/images/logo/oss-logo.webp'}
              className={`mt-1 ${INPUT_CLASS}`}
            />
            <p className={HELP_CLASS}>1200×630 recommended. Root-relative path or absolute URL.</p>
          </div>
        </Section>

        <Section
          title="Page scripts"
          description="Third-party snippets loaded on this page only. Each runs through next/script, so the loading strategy is honoured."
        >
          {scripts.map((script, index) => (
            <ScriptRow key={script.id} index={index} script={script} />
          ))}

          {showBlankRow && <ScriptRow index={scripts.length} />}

          {scripts.length === 0 && (
            <p className="flex items-center gap-2 text-xs text-theme-muted dark:text-neutral-500">
              <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
              No scripts on this page yet.
            </p>
          )}
        </Section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-theme-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-theme-primary-dark focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-neutral-950"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Save changes
          </button>

          {seo?.updatedAt && (
            <span className="text-xs text-theme-muted dark:text-neutral-500">
              Last saved {new Date(seo.updatedAt).toLocaleString('en-US')}
            </span>
          )}
        </div>
      </form>

      {/* Separate form so a stray Enter in the editor can't reset the page, and
          so the reset POST carries nothing but the page id. */}
      <form action={resetPageSeoAction} className="mt-8 border-t border-theme-border pt-5 dark:border-neutral-800">
        <input type="hidden" name="pageId" value={page.id} />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md border border-theme-border px-3 py-2 text-sm font-semibold text-theme-mid transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-red-900 dark:hover:bg-red-950/40 dark:hover:text-red-400"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset to defaults
        </button>
        <p className={HELP_CLASS}>
          Deletes every override saved for this page, including its scripts. The page reverts to the
          copy defined in <code>config/pageSeoDefaults.ts</code>.
        </p>
      </form>
    </>
  );
}
