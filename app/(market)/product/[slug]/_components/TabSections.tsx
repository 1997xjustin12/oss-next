import type { ContentSection } from '@/lib/data/pdpShippingContainers'

type Props = {
  heading: string
  sections: ContentSection[]
}

/**
 * Prose for a body tab whose copy comes from the data rather than from a
 * component of its own.
 *
 * `ContentSection` is a heading, paragraphs and a bullet list, which is what
 * most of this page's tab copy is made of. A tab that needs more than that —
 * a table, a gallery, a price list — should get its own component instead of
 * this one growing a variant for it.
 */
export function TabSections({ heading, sections }: Props) {
  return (
    <section>
      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4">{heading}</h3>

      {sections.map((section, i) => (
        <div key={section.heading ?? `section-${i}`} className={i > 0 ? 'mt-6' : undefined}>
          {section.heading && (
            <h4 className="text-base sm:text-lg font-extrabold tracking-tight mb-2">
              {section.heading}
            </h4>
          )}

          {section.body?.map((paragraph, p) => (
            <p
              key={`p-${p}`}
              className="text-sm sm:text-base text-theme-mid leading-relaxed mb-3 last:mb-0"
            >
              {paragraph}
            </p>
          ))}

          {section.bullets?.length ? (
            <ul className="mt-3 space-y-1.5">
              {section.bullets.map((bullet, b) => (
                <li
                  key={`b-${b}`}
                  className="relative pl-5 text-sm sm:text-base text-theme-mid leading-relaxed
                             before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5
                             before:rounded-full before:bg-theme-primary"
                >
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </section>
  )
}
