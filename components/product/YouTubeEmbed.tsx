'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { youTubeEmbedUrl, youTubePoster } from '@/lib/productVideos'
import type { ProductVideo } from '@/config/productVideos'

/**
 * A YouTube video that costs nothing until someone wants to watch it.
 *
 * Renders the poster frame and a play button; the iframe is only created on
 * click. That matters more than it looks: each YouTube embed pulls roughly a
 * megabyte of JavaScript and a dozen requests *on page load*, whether or not
 * anyone plays it. Five of them on a product page would dominate the page's
 * weight and wreck the Core Web Vitals this project treats as non-negotiable.
 *
 * The trade is one extra click before playback starts. The poster is the same
 * image YouTube's own player shows first, so the swap is close to invisible.
 */
export function YouTubeEmbed({ video }: { video: ProductVideo }) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-[10px] bg-black">
        <iframe
          src={youTubeEmbedUrl(video.id)}
          title={video.title}
          // JSX spellings — `allowfullscreen` and `referrerpolicy` are invalid
          // DOM properties and React warns on them at runtime.
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${video.title}`}
      className="group relative aspect-video w-full overflow-hidden rounded-[10px] bg-stone-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
    >
      <Image
        src={youTubePoster(video.id)}
        alt=""
        fill
        // Decorative: the button's aria-label already names the video, so an
        // alt here would have a screen reader announce it twice.
        aria-hidden="true"
        sizes="(max-width: 1024px) 50vw, 320px"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />

      <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />

      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-theme-primary/95 shadow-lg transition-transform group-hover:scale-110">
          <Play className="ml-0.5 h-5 w-5 fill-white text-white" aria-hidden="true" />
        </span>
      </span>
    </button>
  )
}
