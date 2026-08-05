import { RotateCcw, Save } from 'lucide-react';
import { resetPageContentAction, savePageContentAction } from '@/actions/content';
import type { ContentPage, HeadingField } from '@/config/homeContent';
import type { PageContent } from '@/types/content';

// Server Component end to end: a plain <form> posting to a Server Action, no
// client-side state. Mirrors the Page Configurator's form.

type Props = {
  page: ContentPage;
  content: PageContent | null;
};

const INPUT_CLASS =
  'w-full rounded-md border border-theme-border bg-theme-bg px-3 py-2 text-sm text-theme-dark placeholder:text-theme-muted/70 focus:border-theme-primary focus:ring-1 focus:ring-theme-primary focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600';

const HELP_CLASS = 'mt-1 text-xs text-theme-muted dark:text-neutral-500';

/** Longer headings get a textarea so the whole string is visible while editing. */
const LONG_HEADING = 60;

function HeadingInput({ field, value }: { field: HeadingField; value: string | undefined }) {
  const shared = {
    id: field.key,
    name: field.key,
    defaultValue: value ?? '',
    placeholder: field.default,
    className: `mt-1 ${INPUT_CLASS}`,
  };

  return (
    <div>
      <label className="flex flex-wrap items-center gap-2 text-sm font-semibold text-theme-dark dark:text-neutral-200" htmlFor={field.key}>
        {field.label}
        <span className="rounded bg-theme-subtle px-1.5 py-0.5 font-mono text-[11px] font-semibold text-theme-muted uppercase dark:bg-neutral-800 dark:text-neutral-400">
          {field.element}
        </span>
        {value !== undefined && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400">
            Custom
          </span>
        )}
      </label>

      {field.default.length > LONG_HEADING ? (
        <textarea {...shared} rows={3} />
      ) : (
        <input {...shared} type="text" />
      )}

      {(field.help || field.accent) && (
        <p className={HELP_CLASS}>
          {field.help}
          {field.help && field.accent ? ' ' : ''}
          {field.accent && (
            <>
              Text inside <code>[[double brackets]]</code> is shown in the section&apos;s accent
              colour.
            </>
          )}
        </p>
      )}
    </div>
  );
}

export function ContentForm({ page, content }: Props) {
  const saved = content?.headings ?? {};

  // Group by section so the form reads top-to-bottom like the page does.
  const sections = [...new Set(page.headings.map((h) => h.section))];

  return (
    <>
      <form action={savePageContentAction} className="space-y-5">
        <input type="hidden" name="pageId" value={page.id} />

        {sections.map((section) => (
          <section
            key={section}
            className="rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h2 className="text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
              {section}
            </h2>
            <div className="mt-4 space-y-4">
              {page.headings
                .filter((h) => h.section === section)
                .map((field) => (
                  <HeadingInput key={field.key} field={field} value={saved[field.key]} />
                ))}
            </div>
          </section>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-theme-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-theme-primary-dark focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-neutral-950"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Save changes
          </button>

          {content?.updatedAt && (
            <span className="text-xs text-theme-muted dark:text-neutral-500">
              Last saved {new Date(content.updatedAt).toLocaleString('en-US')}
            </span>
          )}
        </div>
      </form>

      {/* Separate form so a stray Enter in the editor can't reset the page. */}
      <form
        action={resetPageContentAction}
        className="mt-8 border-t border-theme-border pt-5 dark:border-neutral-800"
      >
        <input type="hidden" name="pageId" value={page.id} />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md border border-theme-border px-3 py-2 text-sm font-semibold text-theme-mid transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-red-900 dark:hover:bg-red-950/40 dark:hover:text-red-400"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset all headings
        </button>
        <p className={HELP_CLASS}>
          Clears every heading override on this page. The copy reverts to what&apos;s defined in{' '}
          <code>config/homeContent.ts</code>.
        </p>
      </form>
    </>
  );
}
