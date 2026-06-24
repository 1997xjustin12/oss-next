'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ZoomIn, Maximize2 } from 'lucide-react'

type Props = {
  images: string[]
  title: string
  tag?: string
}

export function ProductImageGallery({ images, title, tag }: Props) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const touchStartX = useRef<number | null>(null)
  const total = images.length

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
    if (Math.abs(delta) > 40) delta > 0 ? next() : prev()
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
          onClick={() => setLightbox(true)}
          role="button"
          aria-label="Open image fullscreen"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && setLightbox(true)}
        >
          {images[active] && (
            <Image
              src={images[active]}
              alt={`${title} — image ${active + 1} of ${total}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              priority={active === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
            <span className="bg-emerald-600 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded shadow">
              In Stock
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

          {/* Action buttons */}
          <div className="absolute bottom-3 right-3 flex gap-1.5 z-10">
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
            {images.map((src, i) => (
              <button
                key={`${src}-${i}`}
                onClick={() => { setActive(i); setZoomed(false) }}
                aria-label={`View image ${i + 1}`}
                aria-current={i === active}
                className={`relative aspect-4/3 rounded-lg border-2 overflow-hidden bg-theme-subtle transition-all focus:outline-none focus:ring-2 focus:ring-theme-primary/40
                  ${i === active
                    ? 'border-theme-primary ring-2 ring-theme-primary/25 scale-[1.03]'
                    : 'border-theme-border hover:border-theme-primary opacity-70 hover:opacity-100'}`}
              >
                <Image src={src} alt={`${title} thumbnail ${i + 1}`} fill className="object-cover" sizes="160px" />
              </button>
            ))}
          </div>
        )}

        {/* Dot indicators — mobile only */}
        {total > 1 && (
          <div className="flex justify-center gap-1.5 mt-3 sm:hidden" role="tablist" aria-label="Image navigation">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActive(i); setZoomed(false) }}
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to image ${i + 1}`}
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
              ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            onClick={() => setZoomed(z => !z)}
            onMouseMove={onZoomMouseMove}
          >
            {images[active] && (
              <div
                className="relative w-full h-full transition-transform duration-200 ease-out"
                style={
                  zoomed
                    ? { transform: 'scale(2.5)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                    : { transform: 'scale(1)', transformOrigin: 'center center' }
                }
              >
                <Image
                  src={images[active]}
                  alt={`${title} — image ${active + 1} of ${total}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
            )}

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
              {images.map((src, i) => (
                <button
                  key={`lb-${src}-${i}`}
                  onClick={() => { setActive(i); setZoomed(false) }}
                  aria-label={`View image ${i + 1}`}
                  className={`relative w-16 h-11 flex-shrink-0 rounded overflow-hidden border-2 transition-all
                    ${i === active
                      ? 'border-theme-primary opacity-100 scale-105'
                      : 'border-white/15 opacity-45 hover:opacity-100 hover:border-white/40'}`}
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="64px" />
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
