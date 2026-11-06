import type { FaqEntry } from '@/lib/data/faqsContent'
import { FaqRichText } from './FaqRichText'

type Props = { entry: FaqEntry }

const TEXT = 'text-base leading-relaxed text-theme-mid dark:text-neutral-300'

/**
 * One question and its whole answer, always open: WordPress shows these as
 * headings with their answers beneath, not as an accordion.
 */
export function FaqEntryCard({ entry }: Props) {
  return (
    <article
      id={entry.id}
      aria-labelledby={`${entry.id}-question`}
      className="scroll-mt-28 rounded-xl border border-theme-border border-l-4 border-l-theme-primary bg-white p-5 shadow-sm sm:p-7
                 dark:border-neutral-800 dark:border-l-theme-primary dark:bg-neutral-900"
    >
      <h3 id={`${entry.id}-question`} className="text-lg font-extrabold leading-snug text-theme-dark sm:text-xl dark:text-white">
        {entry.question}
      </h3>
      <div className="mt-3 space-y-3">
        {entry.blocks.map((block, i) => {
          if (block.kind === 'subheading') {
            return (
              <h4 key={i} className="pt-2 text-base font-bold text-theme-dark sm:text-lg dark:text-white">
                <FaqRichText content={block.content} />
              </h4>
            )
          }
          if (block.kind === 'list') {
            return (
              <ul
                key={i}
                className={`${TEXT} ${block.columns ? 'grid gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-2'} list-disc pl-5 marker:text-theme-primary dark:marker:text-red-400`}
              >
                {block.items.map((item, j) => (
                  <li key={j}>
                    <FaqRichText content={item} />
                  </li>
                ))}
              </ul>
            )
          }
          return (
            <p key={i} className={TEXT}>
              <FaqRichText content={block.content} />
            </p>
          )
        })}
      </div>
    </article>
  )
}
