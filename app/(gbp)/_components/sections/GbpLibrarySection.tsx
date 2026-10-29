import Image from 'next/image'
import { AccentText } from '@/components/shared/AccentText'
import { YouTubeEmbed } from '@/components/product/YouTubeEmbed'
import { GbpCallButton } from '../GbpCallButton'
import { GBP_ACCENT, GBP_BG_RED, GBP_BG_WHITE, GBP_CONTAINER, GBP_H2, GBP_HEADING, sectionPadding, sectionVars } from '../gbpStyles'
import type { GbpLibraryProps, GbpLibrarySectionType, GbpPage, GbpSectionStyle } from '@/types/gbp'

/**
 * The sections an admin can add to the template from the library. Each is a
 * pre-coded component with its own small content form in the admin; placing
 * one is data, adding a new kind is code (register it here, in
 * GbpLibraryProps, and in lib/gbpValidate.ts).
 *
 * Their text is shared by every GBP page, so `{city}`, `{state}` and
 * `{phone}` are filled in per page.
 */

type Props<T extends GbpLibrarySectionType> = {
  type: T
  props: GbpLibraryProps[T]
  page: GbpPage
  telHref: string
  style?: GbpSectionStyle
}

/** `{city}`, `{state}` and `{phone}` → the page's own. */
export function fillPlaceholders(text: string, page: GbpPage): string {
  return text
    .replaceAll('{city}', page.location.city)
    .replaceAll('{state}', page.location.stateCode)
    .replaceAll('{phone}', page.contact.phone)
}

function Paragraphs({ text, page }: { text: string; page: GbpPage }) {
  return (
    <>
      {fillPlaceholders(text, page)
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((para) => (
          <p key={para}>{para}</p>
        ))}
    </>
  )
}

export function GbpLibrarySection<T extends GbpLibrarySectionType>({ type, props, page, telHref, style }: Props<T>) {
  const vars = sectionVars(style)
  const call = { phone: page.contact.phone, telHref }

  if (type === 'spacer') {
    const { size } = props as GbpLibraryProps['spacer']
    return <div aria-hidden className={`${GBP_BG_WHITE} ${{ sm: 'h-6', md: 'h-12', lg: 'h-24' }[size]}`} style={vars} />
  }

  if (type === 'ctaBand') {
    const { heading, body } = props as GbpLibraryProps['ctaBand']
    return (
      <section className={`${GBP_BG_RED} ${sectionPadding(style, 'py-10 sm:py-12')}`} style={vars}>
        <div className={`${GBP_CONTAINER} text-center`}>
          {heading && (
            <h2 className="text-2xl font-bold leading-[1.1] text-[var(--gbp-heading,#ffffff)] md:text-[30px] dark:text-[var(--gbp-heading-dark,#ffffff)]">
              <AccentText text={fillPlaceholders(heading, page)} accentClassName="text-[var(--gbp-accent,#ffffff)]" />
            </h2>
          )}
          {body && (
            <div className="mx-auto mt-4 max-w-3xl space-y-3 text-base leading-normal text-white md:text-lg">
              <Paragraphs text={body} page={page} />
            </div>
          )}
          {/* White on the red band, like the band's headings. */}
          <a
            href={telHref}
            className="mt-6 inline-flex min-w-44 items-center justify-center rounded-none bg-white px-6 py-3 text-xl font-semibold leading-none text-[var(--gbp-brand,#C60C29)] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {page.contact.phone}
          </a>
        </div>
      </section>
    )
  }

  if (type === 'video') {
    const { heading, youtubeId } = props as GbpLibraryProps['video']
    return (
      <section className={`${GBP_BG_WHITE} ${sectionPadding(style, 'py-10 sm:py-12')}`} style={vars}>
        <div className={GBP_CONTAINER}>
          {heading && (
            <h2 className={GBP_H2}>
              <AccentText text={fillPlaceholders(heading, page)} accentClassName={GBP_ACCENT} />
            </h2>
          )}
          <div className="mx-auto mt-8 max-w-3xl">
            <YouTubeEmbed video={{ id: youtubeId, title: fillPlaceholders(heading, page) || `On-Site Storage Solutions in ${page.location.city}` }} />
          </div>
        </div>
      </section>
    )
  }

  // textImage
  const { heading, body, image, imageSide, showCall } = props as GbpLibraryProps['textImage']
  return (
    <section className={`${GBP_BG_WHITE} ${sectionPadding(style, 'py-10 sm:py-12')}`} style={vars}>
      <div className={`${GBP_CONTAINER} grid items-center gap-8 ${image ? 'md:grid-cols-2' : ''}`}>
        <div className={`text-center md:text-left ${image && imageSide === 'left' ? 'md:order-2' : ''}`}>
          {heading && (
            <h2 className={`text-2xl font-bold leading-[1.1] md:text-[30px] ${GBP_HEADING}`}>
              <AccentText text={fillPlaceholders(heading, page)} accentClassName={GBP_ACCENT} />
            </h2>
          )}
          {body && (
            <div className="mt-5 space-y-3 text-base font-normal leading-normal text-black md:text-lg dark:text-neutral-200">
              <Paragraphs text={body} page={page} />
            </div>
          )}
          {showCall && <GbpCallButton {...call} className="mt-6 min-w-44 text-xl" />}
        </div>
        {image && (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(max-width: 768px) 92vw, 640px"
            className={`h-auto w-full rounded-sm ${imageSide === 'left' ? 'md:order-1' : ''}`}
          />
        )}
      </div>
    </section>
  )
}
