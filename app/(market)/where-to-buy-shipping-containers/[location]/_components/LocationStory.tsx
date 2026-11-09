import Image from 'next/image'
import type { LocationStory as Story } from '@/types/locationPage'

type Props = {
  id: string
  label: string
  story: Story
  readMore: string
  readLess: string
  /** Image on the left (Featured) or the right (News & Updates), as WordPress alternates them. */
  imageSide: 'left' | 'right'
}

/**
 * A local story: its first paragraph shown, the rest behind "Read More". A
 * <details>, so it opens without JavaScript and the whole story stays in the
 * HTML for search engines.
 */
export function LocationStory({ id, label, story, readMore, readLess, imageSide }: Props) {
  const [lead, ...rest] = story.paragraphs

  return (
    <section aria-labelledby={id} className="bg-white px-[5%] py-12 sm:py-14 dark:bg-neutral-950">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <Image
          src={story.image.src}
          alt={story.image.alt}
          width={story.image.width}
          height={story.image.height}
          sizes="(max-width: 1024px) 90vw, 45vw"
          className={`h-auto w-full rounded-2xl shadow-md ${imageSide === 'right' ? 'lg:order-2' : ''}`}
        />
        <div>
          <p className="text-3xl font-medium uppercase text-theme-primary sm:text-4xl dark:text-red-400">{label}</p>
          <h2 id={id} className="mt-3 text-xl font-bold text-theme-dark sm:text-2xl dark:text-white">
            {story.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">{lead}</p>
          {rest.length > 0 && (
            <details className="group mt-3">
              <summary
                className="inline-flex min-h-11 cursor-pointer list-none items-center font-semibold text-theme-primary hover:underline
                           focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary dark:text-red-400 [&::-webkit-details-marker]:hidden"
              >
                <span className="group-open:hidden">{readMore}</span>
                <span className="hidden group-open:inline">{readLess}</span>
              </summary>
              <div className="space-y-4">
                {rest.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">
                    {paragraph}
                  </p>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </section>
  )
}
