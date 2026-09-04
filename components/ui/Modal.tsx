'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  /** Skip the default title bar and padded body — the caller lays out its
   *  own content (e.g. a two-column quick-view). A floating close button is
   *  still rendered since there's no title bar to host one. */
  bare?: boolean
  /** Panel width — defaults to a compact dialog; widen for richer content. */
  maxWidth?: string
  /**
   * Let content escape the panel's bounds.
   *
   * The panel clips by default so its children cannot spill past the rounded
   * corners. That is wrong for a dialog containing an autocomplete: the
   * suggestion list is positioned against its input and gets sliced off at the
   * panel edge, leaving a picker whose options cannot be read or clicked.
   */
  allowOverflow?: boolean
}

export function Modal({ open, onClose, title, children, footer, bare = false, maxWidth = 'max-w-md', allowOverflow = false }: Props) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${maxWidth} rounded-xl border border-theme-border bg-theme-bg dark:bg-neutral-900 dark:border-neutral-800 shadow-2xl ${allowOverflow ? 'overflow-visible' : 'overflow-hidden'}`}
      >
        {/* `bare` means the caller lays out its own header, so the title
            survives only as the dialog's accessible name above — drawing
            the bar here too would stack a second heading and a second
            close button over content that already has both. */}
        {title && !bare && (
          <div className="flex items-center justify-between gap-4 px-5 sm:px-6 pt-5 sm:pt-6">
            <h2 className="text-lg font-extrabold tracking-tight text-theme-dark dark:text-white">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 -mr-1 p-1.5 rounded-md text-theme-muted hover:text-theme-dark hover:bg-theme-subtle dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        )}

        {bare ? (
          <>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-theme-bg/90 dark:bg-neutral-800/90 text-theme-muted hover:text-theme-dark dark:hover:text-white shadow transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
            {children}
          </>
        ) : (
          <div className="px-5 sm:px-6 py-4 sm:py-5 text-sm text-theme-mid dark:text-gray-300 leading-relaxed">
            {children}
          </div>
        )}

        {footer && (
          <div className="flex flex-col sm:flex-row gap-2.5 px-5 sm:px-6 pb-5 sm:pb-6 pt-1">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
