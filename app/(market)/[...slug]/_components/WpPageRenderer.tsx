'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = { src: string }

export function WpPageRenderer({ src }: Props) {
  const router = useRouter()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(800)

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'wp-proxy-height') setHeight(e.data.height)
      if (e.data?.type === 'wp-proxy-navigate') router.push(e.data.href)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [router])

  return (
    <iframe
      ref={iframeRef}
      src={src}
      width="100%"
      height={height}
      style={{ border: 0, display: 'block' }}
      title="Page content"
    />
  )
}
