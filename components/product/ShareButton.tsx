'use client'

import { useEffect, useRef, useState } from 'react'
import { Share2, Mail, MessageCircle, Link2, Check, ExternalLink } from 'lucide-react'

type Props = {
  title: string
  className?: string
}

// No backend involved at all — the Web Share API (mobile) and these share
// intents (desktop fallback) are all just URL/OS-level hand-offs to
// whatever app the visitor already has. lucide-react doesn't ship brand
// logos (Facebook/X), so those two rows use a generic external-link icon
// rather than a wrong/placeholder brand mark.
export function ShareButton({ title, className }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  async function handleShareClick() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // user cancelled the native share sheet — no fallback needed
      }
      return
    }
    setOpen((o) => !o)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable/denied (older browser, permission denied,
      // non-secure context) — no confirmation shown rather than claiming
      // success that didn't happen.
    }
  }

  const url = typeof window !== 'undefined' ? window.location.href : ''
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const links = [
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: 'X (Twitter)', href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, Icon: MessageCircle },
    { label: 'Email', href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`, Icon: Mail },
  ]

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleShareClick}
        className={className ?? 'flex items-center gap-1.5 hover:text-theme-primary transition-colors'}
      >
        <Share2 className="w-3.5 h-3.5" /> Share
      </button>

      {open && (
        <div
          role="menu"
          className="absolute z-20 bottom-full left-0 mb-2 w-48 rounded-md border border-theme-border bg-white shadow-lg py-1.5 text-sm"
        >
          {links.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2 text-theme-dark hover:bg-theme-subtle transition-colors"
            >
              {Icon ? <Icon className="w-3.5 h-3.5 text-theme-muted" /> : <ExternalLink className="w-3.5 h-3.5 text-theme-muted" />}
              {label}
            </a>
          ))}
          <button
            type="button"
            onClick={copyLink}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-theme-dark hover:bg-theme-subtle transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Link2 className="w-3.5 h-3.5 text-theme-muted" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      )}
    </div>
  )
}
