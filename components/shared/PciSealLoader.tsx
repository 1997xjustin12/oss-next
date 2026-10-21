'use client'

import { useEffect, useRef } from 'react'

type Props = {
  /** The provider's seal script URL, already checked to be https by PciSeal. */
  src: string
}

/**
 * Loads a site-seal script into its container after the page has loaded.
 *
 * Seal providers ship one of two kinds of script. Some insert their badge as
 * elements; those just work. Others — RapidScan's `siteseal.js` is the shape —
 * are meant to be pasted where the badge goes and draw it with
 * `document.write`. A browser ignores `document.write` from a script that runs
 * after the page has loaded, so such a seal would silently draw nothing.
 *
 * So while the seal script runs, `document.write` (and `writeln`) are pointed
 * at this container, and restored as soon as it has loaded or failed. Written
 * markup lands where the badge belongs; any <script> inside it is re-created
 * so it runs, as it would have in place. Loading waits for the window's load
 * event and then for an idle moment, so the seal never competes with the
 * page's own content.
 */
export function PciSealLoader({ src }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let restore: (() => void) | null = null

    const insert = (html: string) => {
      const template = document.createElement('template')
      template.innerHTML = html
      // Scripts parsed via innerHTML never run; re-create them so they do.
      template.content.querySelectorAll('script').forEach((old) => {
        const script = document.createElement('script')
        for (const { name, value } of Array.from(old.attributes)) script.setAttribute(name, value)
        script.text = old.text
        old.replaceWith(script)
      })
      container.appendChild(template.content)
    }

    const load = () => {
      if (cancelled) return
      const original = { write: document.write, writeln: document.writeln }
      document.write = (...parts: string[]) => insert(parts.join(''))
      document.writeln = (...parts: string[]) => insert(parts.join('') + '\n')
      restore = () => {
        document.write = original.write
        document.writeln = original.writeln
        restore = null
      }

      const script = document.createElement('script')
      script.src = src
      script.async = true
      // A failed seal is not worth an error on the page; it just stays empty.
      script.onload = script.onerror = () => restore?.()
      container.appendChild(script)
    }

    // Safari has no requestIdleCallback; a timeout is the fallback there.
    const whenIdle = () => {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(load, { timeout: 3000 })
      else setTimeout(load, 1)
    }

    if (document.readyState === 'complete') whenIdle()
    else window.addEventListener('load', whenIdle, { once: true })

    return () => {
      cancelled = true
      window.removeEventListener('load', whenIdle)
      restore?.()
    }
  }, [src])

  return <div ref={containerRef} id="pci-seal" className="seal flex items-center" aria-label="PCI compliance seal" />
}
