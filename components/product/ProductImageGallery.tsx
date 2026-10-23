'use client'

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Play, X, ZoomIn, Maximize2 } from 'lucide-react'
import type { ContainerVideo } from '@/config/containerVideos'

type Props = {
  images: string[]
  title: string
  tag?: string
  // Undefined/omitted (not the same as false) means the source data simply
  // didn't carry a qty field — defaults to showing "In Stock" rather than a
  // false "Out of Stock", since a missing field is far more likely than a
  // genuinely sold-out product across this site's real catalog.
  inStock?: boolean
  /**
   * A walkaround video, shown first when the product has one.
   *
   * Null is the ordinary case — most products have no video, and resolving it
   * against a checked-in manifest means that is known before anything renders.
   * So the absence costs a falsy check here rather than an empty player, a
   * broken poster or a request for a file that is not there. See
   * lib/containerVideo.ts.
   */
  video?: ContainerVideo | null
}

/**
 * One thing the gallery can show. The video is always first when present, so
 * everything downstream — counters, arrows, thumbnails, dots — counts slides
 * rather than images and needs no special case beyond how each one renders.
 */
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function getReducedMotion() {
  return window.matchMedia(REDUCED_MOTION).matches
}

type Slide =
  | { kind: 'video'; src: string; poster: string; label: string }
  | { kind: 'image'; src: string }

export function ProductImageGallery({ images, title, tag, inStock = true, video }: Props) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const touchStartX = useRef<number | null>(null)

  // The poster falls back to the product's own first photograph, so a video
  // shipped without one still has something on screen before playback rather
  // than a black rectangle.
  const slides: Slide[] = [
    ...(video ? [{ kind: 'video' as const, src: video.src, poster: video.poster ?? images[0] ?? '', label: video.title }] : []),
    ...images.map((src) => ({ kind: 'image' as const, src })),
  ]
  const total = slides.length
  const current = slides[active]
  const isVideo = current?.kind === 'video'
  /**
   * Honoured in the lightbox player, which plays on its own and never stops.
   *
   * An autoplaying loop with no controls is the exact thing "reduce motion"
   * asks us not to do, and WCAG 2.2.2 wants anything moving for more than five
   * seconds to be stoppable. So for those visitors it does not start itself and
   * gets its control bar back, which is both the accommodation and the way to
   * play it.
   */
  const reduceMotion = useSyncExternalStore(subscribeToReducedMotion, getReducedMotion, () => false)

  const prev = useCallback(() => {
    setActive(i => (i - 1 + total) % total)
    setZoomed(false)
  }, [total])

  const next = useCallback(() => {
    setActive(i => (i + 1) % total)
    setZoomed(false)
  }, [total])

  const closeLightbox = useCallback(() => {
    setLightbox(false)
    setZoomed(false)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, closeLightbox])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 40) {
      if (delta > 0) next()
      else prev()
    }
    touchStartX.current = null
  }

  function onZoomMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!zoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <>
      {/* ── MAIN GALLERY ── */}
      <div className="w-full select-none">
        {/* Primary image */}
        <div
          className="relative aspect-4/3 rounded-xl overflow-hidden border-2 border-theme-border bg-theme-subtle group cursor-zoom-in hover:border-theme-primary transition-colors"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          // The video slide is a poster with a play button; the lightbox has the
          // real player. Same gesture as every image beside it.
          onClick={() => setLightbox(true)}
          role="button"
          aria-label={isVideo ? 'Play video' : 'Open image fullscreen'}
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setLightbox(true)}
        >
          {current?.kind === 'video' ? (
            // Click to play. The walkaround used to autoplay here, after a 512 KB
            // warm-up fetched on idle: every product view paid for a 2-4 MB video
            // most visitors never meant to watch, and its raw 150-250 KB poster
            // (not an optimized image) was likely the page's LCP element.
            <>
              {current.poster ? (
                <Image
                  src={current.poster}
                  alt=""
                  fill
                  className="bg-black object-cover"
                  priority={active === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 bg-black" />
              )}
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white shadow-lg transition-transform group-hover:scale-110">
                  <Play className="h-7 w-7 translate-x-0.5" fill="currentColor" />
                </span>
              </span>
            </>
          ) : current ? (
            <Image
              src={current.src}
              alt={`${title} — image ${active + 1} of ${total}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              priority={active === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : null}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
            <span className={`text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded shadow ${inStock ? 'bg-emerald-600' : 'bg-theme-muted'}`}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </span>
            {tag && (
              <span className="bg-amber-500 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded shadow">
                {tag}
              </span>
            )}
          </div>

          {/* Image counter */}
          {total > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/55 text-white text-xs font-semibold px-2.5 py-1 rounded backdrop-blur-sm pointer-events-none">
              {active + 1} / {total}
            </div>
          )}

          {/* Action buttons — images only. Zoom and fullscreen mean nothing on
              a video, and they would sit on top of its own controls. */}
          <div className={`absolute bottom-3 right-3 flex gap-1.5 z-10 ${isVideo ? 'hidden' : ''}`}>
            <button
              onClick={e => { e.stopPropagation(); setLightbox(true) }}
              className="bg-black/55 hover:bg-black/75 text-white p-1.5 rounded backdrop-blur-sm transition-colors"
              aria-label="View fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); setLightbox(true) }}
              className="bg-black/55 hover:bg-black/75 text-white text-xs font-semibold px-3 py-1.5 rounded backdrop-blur-sm transition-colors flex items-center gap-1.5"
              aria-label="Zoom image"
            >
              <ZoomIn className="w-3.5 h-3.5" /> Zoom
            </button>
          </div>

          {/* Prev / Next arrows */}
          {total > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev() }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); next() }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails — desktop */}
        {total > 1 && (
          <div className="hidden sm:grid grid-cols-4 gap-2 mt-3">
            {slides.map((slide, i) => (
              <button
                key={`${slide.src}-${i}`}
                onClick={() => { setActive(i); setZoomed(false) }}
                aria-label={slide.kind === 'video' ? slide.label : `View image ${i + 1}`}
                aria-current={i === active}
                className={`relative aspect-4/3 rounded-lg border-2 overflow-hidden bg-theme-subtle transition-all focus:outline-none focus:ring-2 focus:ring-theme-primary/40
                  ${i === active
                    ? 'border-theme-primary ring-2 ring-theme-primary/25 scale-[1.03]'
                    : 'border-theme-border hover:border-theme-primary opacity-70 hover:opacity-100'}`}
              >
                {slide.kind === 'video' ? (
                  <>
                    {slide.poster && (
                      <Image src={slide.poster} alt="" fill className="object-cover" sizes="160px" />
                    )}
                    {/* Says it is a video without needing the thumbnail to. */}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow">
                        <Play className="h-3.5 w-3.5 translate-x-px fill-theme-dark text-theme-dark" aria-hidden />
                      </span>
                    </span>
                    {video?.duration && (
                      <span className="absolute bottom-1 right-1 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-white tabular-nums">
                        {video.duration}
                      </span>
                    )}
                  </>
                ) : (
                  <Image src={slide.src} alt={`${title} thumbnail ${i + 1}`} fill className="object-cover" sizes="160px" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Dot indicators — mobile only */}
        {total > 1 && (
          <div className="flex justify-center gap-1.5 mt-3 sm:hidden" role="tablist" aria-label="Image navigation">
            {slides.map((slide, i) => (
              <button
                key={i}
                onClick={() => { setActive(i); setZoomed(false) }}
                role="tab"
                aria-selected={i === active}
                aria-label={slide.kind === 'video' ? slide.label : `Go to image ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${i === active ? 'w-5 h-2 bg-theme-primary' : 'w-2 h-2 bg-theme-border hover:bg-theme-primary/50'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── LIGHTBOX (portalled to body to escape any parent stacking context) ── */}
      {lightbox && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/96 flex flex-col"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label={`Image viewer — ${title}`}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0 gap-3">
            <span className="text-white/50 text-sm tabular-nums flex-shrink-0">
              {active + 1} / {total}
            </span>
            <span className="text-white/80 text-sm font-medium truncate text-center flex-1">
              {title}
            </span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {!isVideo && (
                <button
                  onClick={() => setZoomed(z => !z)}
                  className={`p-2 rounded transition-colors text-sm font-medium flex items-center gap-1.5
                    ${zoomed ? 'bg-theme-primary text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                  aria-label={zoomed ? 'Reset zoom' : 'Zoom in'}
                  aria-pressed={zoomed}
                >
                  <ZoomIn className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">{zoomed ? 'Reset' : 'Zoom'}</span>
                </button>
              )}
              <button
                onClick={closeLightbox}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded transition-colors"
                aria-label="Close fullscreen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Image area */}
          <div
            className={`flex-1 flex items-center justify-center relative overflow-hidden
              ${isVideo ? '' : zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            onClick={isVideo ? undefined : () => setZoomed(z => !z)}
            onMouseMove={isVideo ? undefined : onZoomMouseMove}
          >
            {current?.kind === 'video' ? (
              <video
                key={`lb-${current.src}`}
                src={current.src}
                poster={current.poster || undefined}
                // Fullscreen, but still a moving photograph rather than
                // something to operate: silent, looping, no control bar. The
                // files carry no audio track at all, so `muted` is belt and
                // braces — it is also what lets autoplay start.
                loop
                muted
                playsInline
                disablePictureInPicture
                // Only mounted once someone has clicked (see the `lightbox &&`
                // guard above), so it never renders during hydration and
                // `reduceMotion` is the real answer by the time this is
                // evaluated. This is the only player: the gallery frame shows a
                // poster and a play button.
                autoPlay={!reduceMotion}
                controls={reduceMotion}
                // Keeps the overflow menu off the controls that reduced-motion
                // visitors do get: no download, no playback-rate, no casting.
                controlsList="nodownload noplaybackrate noremoteplayback"
                // Opened deliberately, so this one may fetch what it needs.
                preload="metadata"
                aria-label={current.label}
                // Stops the click reaching the zoom toggle on the wrapper — a
                // press on Play should play, not zoom the page behind it.
                onClick={(e) => e.stopPropagation()}
                className="max-h-full max-w-full"
              />
            ) : current ? (
              <div
                className="relative w-full h-full transition-transform duration-200 ease-out"
                style={
                  zoomed
                    ? { transform: 'scale(2.5)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                    : { transform: 'scale(1)', transformOrigin: 'center center' }
                }
              >
                <Image
                  src={current.src}
                  alt={`${title} — image ${active + 1} of ${total}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
            ) : null}

            {/* Prev / Next in lightbox */}
            {total > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); prev() }}
                  className="absolute left-3 sm:left-5 bg-white/10 hover:bg-white/25 text-white p-2.5 sm:p-3 rounded-full backdrop-blur-sm transition-colors z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); next() }}
                  className="absolute right-3 sm:right-5 bg-white/10 hover:bg-white/25 text-white p-2.5 sm:p-3 rounded-full backdrop-blur-sm transition-colors z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {total > 1 && (
            <div className="flex gap-2 px-4 py-3 overflow-x-auto border-t border-white/10 flex-shrink-0 scrollbar-none">
              {slides.map((slide, i) => (
                <button
                  key={`lb-${slide.src}-${i}`}
                  onClick={() => { setActive(i); setZoomed(false) }}
                  aria-label={slide.kind === 'video' ? slide.label : `View image ${i + 1}`}
                  className={`relative w-16 h-11 flex-shrink-0 rounded overflow-hidden border-2 transition-all
                    ${i === active
                      ? 'border-theme-primary opacity-100 scale-105'
                      : 'border-white/15 opacity-45 hover:opacity-100 hover:border-white/40'}`}
                >
                  {slide.kind === 'video' ? (
                    <>
                      {slide.poster && <Image src={slide.poster} alt="" fill className="object-cover" sizes="64px" />}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="h-3.5 w-3.5 translate-x-px fill-white text-white" aria-hidden />
                      </span>
                    </>
                  ) : (
                    <Image src={slide.src} alt="" fill className="object-cover" sizes="64px" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  )
}
