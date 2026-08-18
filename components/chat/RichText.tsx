'use client'

import { Fragment } from 'react'
import { URL_SPLIT, URL_TEST } from '@/lib/chatText'

/**
 * Render an assistant reply as React elements.
 *
 * **Never `dangerouslySetInnerHTML`.** The reply is model output; handing that
 * to innerHTML would turn any future prompt injection into a scripting hole in
 * the storefront. Splitting into elements costs nothing and closes it.
 *
 * Note the two regexes: `URL_SPLIT` is global (it has to be, to split), and
 * `URL_TEST` is a separate non-global pattern. Calling `.test()` on a `/g`
 * regex advances its `lastIndex` between calls, which would match every other
 * link and leave the rest as plain text.
 */
export function RichText({ text }: { text: string }) {
  if (!text) return null

  return (
    <>
      {text.split('\n').map((line, lineIndex, lines) => (
        <Fragment key={lineIndex}>
          {line.split(URL_SPLIT).map((part, partIndex) =>
            URL_TEST.test(part) ? (
              <a
                key={partIndex}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-theme-primary underline underline-offset-2 dark:text-red-400"
              >
                {part}
              </a>
            ) : (
              <Fragment key={partIndex}>{part}</Fragment>
            ),
          )}
          {lineIndex < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  )
}
