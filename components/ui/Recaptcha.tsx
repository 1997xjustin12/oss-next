'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement,
        params: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback'?: () => void
          theme?: 'light' | 'dark'
        },
      ) => number
    }
  }
}

type Props = {
  siteKey: string
  onChange: (token: string | null) => void
}

// Shared across any form gated on NEXT_PUBLIC_RECAPTCHA_SITE_KEY (checkout,
// registration, ...) — only render this when that env var is set. Renders via
// grecaptcha.render() directly (rather than next/third-parties, which has no
// reCAPTCHA v2 checkbox support) so the widget can be dropped anywhere in a
// form without owning page-level script loading.
export function Recaptcha({ siteKey, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scriptReady, setScriptReady] = useState(false)
  // Ref rather than a dependency so a new inline onChange each render doesn't
  // re-trigger grecaptcha.render() into an already-rendered container.
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!scriptReady || !containerRef.current || !window.grecaptcha) return

    const isDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    window.grecaptcha.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token) => onChangeRef.current(token),
      'expired-callback': () => onChangeRef.current(null),
      theme: isDark ? 'dark' : 'light',
    })
  }, [scriptReady, siteKey])

  return (
    <>
      <Script
        src="https://www.google.com/recaptcha/api.js"
        strategy="lazyOnload"
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} />
    </>
  )
}
