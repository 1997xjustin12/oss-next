import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'

type Props = { heading: string; href: string; id?: string }

/** The slanted red ribbon WordPress opens each container group with; its heading links to the group's page. */
export function CategoryRibbon({ heading, href, id }: Props) {
  return (
    <h2 id={id} className="text-2xl font-bold text-white sm:text-3xl">
      <Link
        href={href}
        className="inline-block bg-theme-primary py-3 pl-[5vw] pr-14 transition-colors [clip-path:polygon(0_0,100%_0,calc(100%-2.5rem)_100%,0_100%)] hover:bg-theme-primary-dark
                   focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary sm:pr-20"
      >
        {heading}
      </Link>
    </h2>
  )
}
