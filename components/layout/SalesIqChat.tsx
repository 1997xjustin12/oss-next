'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { isSalesIqExcludedPath, SALES_IQ_SCRIPT_SRC, SALES_IQ_WIDGET_CODE } from '@/config/salesIq'

/**
 * Loads the Zoho SalesIQ chat on the storefront, except on the pages in
 * config/salesIq.ts. The snippet is Zoho's own, as WordPress has it.
 *
 * Nothing loads until a visitor reaches a page that shows the chat. Zoho's script
 * can't be unloaded after that, and its bubble stays in the page across client-side
 * navigation, so the bubble is shown by `data-salesiq` on <html> (app/globals.css)
 * and this only sets that attribute. Hidden by default, it also goes when the visitor
 * moves on to a page outside this layout.
 */
export function SalesIqChat() {
  const excluded = isSalesIqExcludedPath(usePathname())

  const [started, setStarted] = useState(!excluded)
  if (!excluded && !started) setStarted(true)

  useEffect(() => {
    if (excluded) return
    const root = document.documentElement
    root.dataset.salesiq = 'on'
    return () => {
      delete root.dataset.salesiq
    }
  }, [excluded])

  if (!started) return null

  return (
    <Script id="zsiqchat" strategy="lazyOnload">
      {`window.$zoho=window.$zoho||{};$zoho.salesiq=$zoho.salesiq||{widgetcode:"${SALES_IQ_WIDGET_CODE}",values:{},ready:function(){}};
var d=document,s=d.createElement("script");s.type="text/javascript";s.id="zsiqscript";s.defer=true;s.src="${SALES_IQ_SCRIPT_SRC}";
var t=d.getElementsByTagName("script")[0];t.parentNode.insertBefore(s,t);`}
    </Script>
  )
}
