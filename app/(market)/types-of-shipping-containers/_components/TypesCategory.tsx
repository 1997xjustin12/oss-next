import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import type { ContainerTypeCategory } from '@/lib/data/containerTypesContent'

type Props = { category: ContainerTypeCategory; shaded?: boolean }

const LINK = 'hover:text-theme-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary dark:hover:text-red-400'

/**
 * One container family (dry van, refrigerated, specialty): its overview beside
 * a photo, then a card per type. As on WordPress, each title links to that
 * type's page.
 */
export function TypesCategory({ category, shaded = false }: Props) {
  const { id, title, href, body, image, items } = category
  const headingId = `types-${id}`

  return (
    <section
      aria-labelledby={headingId}
      className={`px-[5%] py-12 sm:py-16 ${shaded ? 'bg-theme-subtle dark:bg-neutral-900' : 'bg-white dark:bg-neutral-950'}`}
    >
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-12">
        <div className="min-w-0">
          <h2 id={headingId} className="text-2xl font-extrabold leading-tight text-theme-dark sm:text-3xl dark:text-white">
            <Link href={href} className={`inline-flex items-center gap-2 ${LINK}`}>
              {title}
              <ArrowRight aria-hidden className="h-6 w-6 shrink-0 text-theme-primary dark:text-red-400" />
            </Link>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">{body}</p>
        </div>
        <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl bg-white ring-1 ring-theme-border dark:ring-neutral-800">
          <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 1024px) 90vw, 416px" className="h-auto w-full" />
        </div>
      </div>

      <ul className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <li key={item.title}>
            <article className="flex h-full flex-col overflow-hidden rounded-xl border border-theme-border bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
              <div className="relative aspect-4/3 bg-theme-subtle dark:bg-neutral-800">
                <Image src={item.image.src} alt={item.image.alt} fill sizes="(max-width: 768px) 90vw, (max-width: 1280px) 45vw, 30vw" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="text-base font-extrabold leading-snug text-theme-dark dark:text-white">
                  <Link href={item.href} className={LINK}>
                    {item.title}
                  </Link>
                </h3>
                <p className="text-[15px] leading-relaxed text-theme-mid dark:text-neutral-300">{item.body}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
