import Image from 'next/image'
import { AccentText } from '@/components/shared/AccentText'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import type { LocationResource } from '@/types/locationPage'

type Props = {
  heading: string
  resources: readonly LocationResource[]
}

/**
 * "{City} Container Resources": articles about the place, each a picture beside
 * its title and summary, alternating sides as on WordPress. The title links to
 * the article.
 */
export function LocationResources({ heading, resources }: Props) {
  if (resources.length === 0) return null

  return (
    <section aria-labelledby="location-resources" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <h2 id="location-resources" className="text-center text-2xl font-bold text-theme-dark sm:text-3xl dark:text-white">
        <AccentText text={heading} accentClassName="text-theme-primary dark:text-red-400" />
      </h2>
      <ul className="mt-10 space-y-12">
        {resources.map((resource, i) => (
          <li key={resource.href}>
            <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <Image
                src={resource.image.src}
                alt={resource.image.alt}
                width={resource.image.width}
                height={resource.image.height}
                sizes="(max-width: 1024px) 90vw, 45vw"
                className={`h-auto w-full rounded-2xl shadow-md ${i % 2 === 1 ? 'lg:order-2' : ''}`}
              />
              <div>
                <h3 className="text-xl font-bold text-theme-dark sm:text-2xl dark:text-white">
                  <Link href={resource.href} className="hover:text-theme-primary hover:underline dark:hover:text-red-400">
                    {resource.title}
                  </Link>
                </h3>
                <div className="mt-4 space-y-3">
                  {resource.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)} className="text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
