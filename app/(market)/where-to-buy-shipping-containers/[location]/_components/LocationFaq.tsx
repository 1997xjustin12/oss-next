import { YouTubeEmbed } from '@/components/product/YouTubeEmbed'
import { LandingFaqSection } from '@/components/shared/LandingFaqSection'
import type { LandingFaq } from '@/lib/data/containerLandingContent'

type Props = {
  heading: string
  faqs: readonly LandingFaq[]
  /** The video beside the questions; without one they take the full width. */
  youtubeId?: string
  videoTitle: string
}

/** The FAQ, with the location's video beside it from `lg` up (under it on phones). */
export function LocationFaq({ heading, faqs, youtubeId, videoTitle }: Props) {
  if (!youtubeId) return <LandingFaqSection faqs={faqs} heading={heading} />

  return (
    <div className="grid items-start gap-8 bg-white px-[5%] py-12 sm:py-16 lg:grid-cols-[3fr_2fr] dark:bg-neutral-950">
      <LandingFaqSection faqs={faqs} heading={heading} bare />
      <div className="lg:sticky lg:top-28">
        <YouTubeEmbed video={{ id: youtubeId, title: videoTitle }} />
      </div>
    </div>
  )
}
