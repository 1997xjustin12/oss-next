import Image from 'next/image'
import { SectionTagline2 } from '@/components/shared/SectionTagline2'
import { FAQS_IMAGE, type FaqGroup } from '@/lib/data/faqsContent'
import { FaqEntryCard } from './FaqEntryCard'

type Props = {
  group: FaqGroup
  /** The first group opens with WordPress's banner image beside its first answers. */
  withImage?: boolean
}

/** One FAQ group: its heading on the blue band, then its questions and answers. */
export function FaqGroupSection({ group, withImage = false }: Props) {
  return (
    <div id={group.id} className="scroll-mt-24">
      <SectionTagline2 bg="blue" text={group.heading} />
      <section aria-label={group.heading} className="bg-white px-[5%] py-10 sm:py-14 dark:bg-neutral-950">
        {withImage && (
          <div className="mb-8 flex justify-center">
            <Image
              src={FAQS_IMAGE.src}
              alt={FAQS_IMAGE.alt}
              width={FAQS_IMAGE.width}
              height={FAQS_IMAGE.height}
              sizes="300px"
              className="h-auto w-full max-w-[300px] rounded-lg bg-white"
            />
          </div>
        )}
        <div className="space-y-5">
          {group.entries.map((entry) => (
            <FaqEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>
    </div>
  )
}
