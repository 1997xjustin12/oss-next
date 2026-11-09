import { LocationRichText } from './LocationRichText'

type Props = {
  text: string
  phone: string
  /** `call`: the mid-page "Ready to Buy…" band (yellow accent). `closing`: the last band (accent on a red tape). */
  variant: 'call' | 'closing'
}

const STYLES = {
  call: {
    section: 'bg-[#0F3A59] px-[5%] py-6 text-center',
    heading: 'text-2xl font-semibold leading-snug text-white sm:text-3xl',
    accent: 'text-yellow-300',
    link: 'text-yellow-300 underline-offset-4 hover:underline',
  },
  closing: {
    section: 'bg-[#0F3A59] bg-linear-to-r from-[#0F3A59] to-[#16466b] px-[5%] py-10',
    heading: 'max-w-xl text-3xl font-extrabold leading-tight text-white sm:text-4xl',
    accent: 'inline-block -rotate-1 bg-theme-primary px-2',
    link: 'text-white underline-offset-4 hover:underline',
  },
} as const

/**
 * A full-width blue band with one line. WordPress's closing band was a picture
 * of its words; here they are text.
 */
export function LocationBand({ text, variant, phone }: Props) {
  const style = STYLES[variant]
  return (
    <section className={style.section}>
      <h2 className={style.heading}>
        <LocationRichText text={text} accentClassName={style.accent} linkClassName={style.link} phone={phone} />
      </h2>
    </section>
  )
}
