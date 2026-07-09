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
}

export function Modal({ open, onClose, title, children, footer }: Props) {
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
        className="w-full max-w-md rounded-xl border border-theme-border bg-theme-bg dark:bg-neutral-900 dark:border-neutral-800 shadow-2xl overflow-hidden"
      >
        {title && (
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

        <div className="px-5 sm:px-6 py-4 sm:py-5 text-sm text-theme-mid dark:text-gray-300 leading-relaxed">
          {children}
        </div>

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
