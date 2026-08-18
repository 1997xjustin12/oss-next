'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageCircle, Plus, Send, X } from 'lucide-react'
import {
  AVAILABILITY_KEY,
  DISCLAIMER,
  GREETING,
  MAX_MESSAGE_CHARS,
} from '@/config/chat'
import { extractProductHandles, stripProductUrls } from '@/lib/chatText'
import {
  clearAccountHistories,
  clearHistory,
  loadHistory,
  pruneExpiredHistory,
  saveHistory,
  type ChatIdentity,
} from '@/lib/chatHistory'
import { useAuth } from '@/hooks/useAuth'
import { RichText } from './RichText'
import { ChatProductShelf } from './ChatProductShelf'
import type { ChatProductCard } from '@/app/api/chat/products/route'

/**
 * The AI shopping assistant.
 *
 * Mounted once in the storefront layout, inside the cart and auth providers.
 * See docs/reference/AI_CHAT_IMPLEMENTATION.md for the full design.
 */

type Message = {
  id: string
  role: 'user' | 'assistant'
  /** What is on screen — a growing slice while the reply types out. */
  text: string
  /**
   * The complete, URL-stripped reply. Kept separately because neither the whole
   * answer nor the products it recommended can be recovered from what is on
   * screen mid-animation, and closing the tab then would persist a truncated one.
   */
  full?: string
  handles?: string[]
  typing?: boolean
}

const TYPE_INTERVAL_MS = 12
const TYPE_CHARS_PER_TICK = 3

export function AiChatWidget() {
  const { user, isAuthenticated } = useAuth()

  /**
   * `null` until the region check answers.
   *
   * Doubles as the mounted flag: it can only ever become non-null from an
   * effect, so the server render and the first client render both produce
   * nothing. That matters because the storefront is deliberately readable
   * without JavaScript, and a chat button that cannot work without it is noise
   * in that HTML — for crawlers and for anyone with scripting off.
   */
  const [available, setAvailable] = useState<boolean | null>(null)
  const [open, setOpen] = useState(false)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<ChatProductCard[]>([])

  const sessionIdRef = useRef<string | undefined>(undefined)
  /**
   * Ref-backed, not module-level. Fast Refresh reloads the module while
   * component state survives, which reset a module counter to 0 and handed a
   * new message the same id as the greeting — the shelf then attached itself to
   * the greeting and rendered above the question.
   */
  const messageSeq = useRef(0)
  const latestReplyRef = useRef<string | null>(null)
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const identity: ChatIdentity = isAuthenticated && user?.id ? String(user.id) : null
  /** `undefined` = auth has not settled yet; `null` = guest. Different states. */
  const previousIdentity = useRef<ChatIdentity | undefined>(undefined)
  const savedCountRef = useRef(0)

  const nextId = useCallback(() => `m${(messageSeq.current += 1)}`, [])

  // ── Mount + availability ──────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false

    async function resolveAvailability() {
      // Session storage, not local: someone who travels, or drops a VPN, gets a
      // fresh answer next visit rather than being stuck with a stale one.
      try {
        const cached = window.sessionStorage.getItem(AVAILABILITY_KEY)
        if (cached === 'true' || cached === 'false') {
          if (!cancelled) setAvailable(cached === 'true')
          return
        }
      } catch {
        // Private mode or a sandboxed iframe — fall through to the request.
      }

      try {
        const res = await fetch('/api/chat/availability')
        if (!res.ok) throw new Error(String(res.status))

        const data = (await res.json()) as { available?: unknown }
        // Fail open on anything unexpected: the server still has the last word,
        // and the worst case is a button that explains why it cannot help.
        const value = typeof data.available === 'boolean' ? data.available : true

        if (!cancelled) setAvailable(value)
        try {
          window.sessionStorage.setItem(AVAILABILITY_KEY, String(value))
        } catch {
          // Not being able to cache the answer is not worth surfacing.
        }
      } catch {
        if (!cancelled) setAvailable(true)
      }
    }

    void resolveAvailability()

    return () => {
      cancelled = true
    }
  }, [])

  // ── Identity transitions ──────────────────────────────────────────────────

  const restore = useCallback((who: ChatIdentity) => {
    const record = loadHistory(who)
    const restored = record?.messages ?? []

    if (restored.length) {
      // Continue the sequence past everything restored. Starting from zero
      // again would hand a new reply the id of an old one, and the shelf would
      // attach itself to the wrong message.
      messageSeq.current = restored.reduce((max, m) => {
        const n = Number(/^m(\d+)$/.exec(m.id)?.[1] ?? 0)
        return n > max ? n : max
      }, 0)
      sessionIdRef.current = record?.sessionId
      setMessages(restored.map((m) => ({ ...m, full: m.text })))
      savedCountRef.current = restored.length
      return
    }

    sessionIdRef.current = undefined
    messageSeq.current = 0
    setMessages([{ id: `m${(messageSeq.current += 1)}`, role: 'assistant', text: GREETING, full: GREETING }])
    savedCountRef.current = 0
  }, [])

  /**
   * Restore the right thread when identity settles or changes.
   *
   * The setState calls here are flagged by react-hooks/set-state-in-effect and
   * are deliberate: localStorage is an external system, reading it is exactly
   * what an effect is for, and the messages are the result of that read rather
   * than state derivable from props.
   */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Nothing to restore for a visitor who cannot use the assistant, and no
    // reason to touch their storage. Auth also reports logged-out on the first
    // render and resolves a moment later — acting on that would read a
    // signed-in visitor as a guest, and the logout branch below would wipe
    // their thread a tick later.
    if (!available) return

    const previous = previousIdentity.current

    if (previous === undefined) {
      pruneExpiredHistory()
      // Signed out has to mean gone, however it happened — including a logout
      // that never ran through this component.
      if (identity === null) clearAccountHistories()
      restore(identity)
    } else if (previous === null && identity !== null) {
      // A guest signed in. Carry the in-progress thread across rather than
      // dropping it mid-conversation.
      const guest = loadHistory(null)
      if (guest?.messages.length) {
        clearHistory(null)
        saveHistory(identity, { messages: guest.messages, sessionId: guest.sessionId })
        restore(identity)
      } else {
        restore(identity)
      }
    } else if (previous !== identity) {
      // Signed out, or a different account. A logged-in thread that survived a
      // logout would be readable by whoever uses the computer next.
      clearHistory(previous)
      setProducts([])
      restore(identity)
    }

    previousIdentity.current = identity
  }, [available, identity, restore])
  /* eslint-enable react-hooks/set-state-in-effect */

  // ── Persistence ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!available || messages.length === 0) return
    // Keyed on length, not on the array: the stored text comes from `full`,
    // which is set once when a reply is created, so watching the array would
    // write every few milliseconds during the type-out for content that is not
    // changing. The count guard also stops an unchanged conversation being
    // rewritten on every page view, which would keep pushing the expiry out and
    // make it "seven days since you last visited" rather than "since you last
    // asked something".
    if (messages.length === savedCountRef.current) return
    savedCountRef.current = messages.length

    saveHistory(identity, {
      sessionId: sessionIdRef.current,
      messages: messages.map(({ id, role, text, full, handles }) => ({
        id,
        role,
        // Prefer `full` so closing the tab mid-animation does not persist a
        // truncated answer. `typing` is deliberately dropped — a restored
        // conversation is finished, not mid-animation.
        text: full ?? text,
        ...(handles?.length ? { handles } : {}),
      })),
    })
  }, [available, messages, identity])

  // ── Type-out ──────────────────────────────────────────────────────────────

  const stopTyping = useCallback(() => {
    if (typeTimerRef.current) {
      clearInterval(typeTimerRef.current)
      typeTimerRef.current = null
    }
  }, [])

  useEffect(() => stopTyping, [stopTyping])

  const typeOut = useCallback(
    (id: string, full: string) => {
      stopTyping()

      const reduced =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

      if (reduced) {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text: full, typing: false } : m)))
        return
      }

      let shown = 0
      typeTimerRef.current = setInterval(() => {
        shown = Math.min(shown + TYPE_CHARS_PER_TICK, full.length)
        const slice = full.slice(0, shown)
        const done = shown >= full.length

        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text: slice, typing: !done } : m)))
        if (done) stopTyping()
      }, TYPE_INTERVAL_MS)
    },
    [stopTyping],
  )

  // ── Product shelf ─────────────────────────────────────────────────────────

  const attachProducts = useCallback(async (replyId: string, handles: string[]) => {
    if (handles.length === 0) return

    try {
      const res = await fetch(`/api/chat/products?handles=${encodeURIComponent(handles.join(','))}`)
      if (!res.ok) return
      const data = (await res.json()) as { products?: ChatProductCard[] }

      // A slow lookup for an older answer must not overwrite a newer one.
      if (latestReplyRef.current !== replyId) return
      setProducts(Array.isArray(data.products) ? data.products : [])
    } catch {
      // A shelf that does not appear is a smaller problem than an error banner
      // over a perfectly good answer.
    }
  }, [])

  // ── Sending ───────────────────────────────────────────────────────────────

  async function send() {
    const message = input.trim()
    if (!message || sending) return

    setError(null)
    setInput('')
    setProducts([])
    setSending(true)

    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text: message, full: message }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          ...(sessionIdRef.current ? { session_id: sessionIdRef.current } : {}),
        }),
      })

      const data = (await res.json().catch(() => null)) as
        | { reply?: string; session_id?: string; message?: string }
        | null

      if (!res.ok || typeof data?.reply !== 'string') {
        setError(data?.message ?? 'The assistant could not answer that. Try again.')
        return
      }

      if (data.session_id) sessionIdRef.current = data.session_id

      const handles = extractProductHandles(data.reply)
      const prose = stripProductUrls(data.reply)
      const replyId = nextId()
      latestReplyRef.current = replyId

      setMessages((prev) => [
        ...prev,
        { id: replyId, role: 'assistant', text: '', full: prose, handles, typing: true },
      ])

      // Alongside the type-out, not before it — the text appears immediately
      // and the shelf fills in beneath.
      typeOut(replyId, prose)
      void attachProducts(replyId, handles)
    } catch {
      setError("Couldn't reach the assistant. Check your connection.")
    } finally {
      setSending(false)
    }
  }

  function startNewConversation() {
    stopTyping()
    clearHistory(identity)
    sessionIdRef.current = undefined
    messageSeq.current = 0
    savedCountRef.current = 0
    latestReplyRef.current = null
    setProducts([])
    setError(null)
    setMessages([{ id: `m${(messageSeq.current += 1)}`, role: 'assistant', text: GREETING, full: GREETING }])
  }

  // ── Panel behaviour ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    inputRef.current?.focus()

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) triggerRef.current?.focus()
  }, [open])

  useEffect(() => {
    // `products` is in here because the shelf lands after the reply renders and
    // would otherwise sit below the fold.
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending, error, products])

  // ── Render ────────────────────────────────────────────────────────────────

  // null (not yet answered) and false (refused) both render nothing. Showing a
  // button and taking it away a moment later is worse than showing it late.
  if (!available) return null

  return (
    <>
      {!open && (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Ask the AI assistant"
          className="fixed bottom-5 right-5 z-9990 flex h-14 w-14 items-center justify-center rounded-full bg-theme-primary text-white shadow-lg transition-transform hover:scale-105 hover:bg-theme-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary/50 focus:ring-offset-2"
        >
          <MessageCircle className="h-6 w-6" aria-hidden />
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="AI shopping assistant"
          className="fixed inset-0 z-9995 flex items-end justify-end p-0 sm:p-5"
        >
          <button
            type="button"
            aria-label="Close the assistant"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 sm:bg-black/25"
          />

          <div className="relative flex h-full w-full flex-col overflow-hidden bg-theme-bg shadow-2xl sm:h-[min(38rem,85vh)] sm:w-96 sm:rounded-xl dark:bg-neutral-950">
            <header className="flex items-center justify-between border-b border-theme-border px-4 py-3 dark:border-neutral-800">
              <div>
                <p className="text-sm font-extrabold tracking-tight text-theme-dark dark:text-white">
                  Ask about containers
                </p>
                <p className="text-[11px] text-theme-muted dark:text-neutral-500">Answers from our live catalogue</p>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 1 && (
                  <button
                    type="button"
                    onClick={startNewConversation}
                    aria-label="Start a new conversation"
                    title="New conversation"
                    className="rounded-md p-1.5 text-theme-muted transition-colors hover:bg-theme-subtle hover:text-theme-dark dark:hover:bg-neutral-800 dark:hover:text-white"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="rounded-md p-1.5 text-theme-muted transition-colors hover:bg-theme-subtle hover:text-theme-dark dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </header>

            <div ref={transcriptRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-theme-primary text-white'
                        : 'bg-theme-subtle text-theme-dark dark:bg-neutral-800 dark:text-neutral-100'
                    }`}
                  >
                    <RichText text={message.text} />
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl bg-theme-subtle px-3.5 py-3 dark:bg-neutral-800">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-theme-muted"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            <ChatProductShelf products={products} />

            <div className="border-t border-theme-border px-3 py-3 dark:border-neutral-800">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      void send()
                    }
                  }}
                  rows={1}
                  maxLength={MAX_MESSAGE_CHARS}
                  placeholder="What size do I need for a 2-car garage?"
                  aria-label="Your question"
                  className="max-h-28 min-h-10 flex-1 resize-none rounded-lg border border-theme-border bg-theme-subtle px-3 py-2 text-sm text-theme-dark outline-none transition-colors placeholder:text-theme-muted focus:border-theme-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />

                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={sending || !input.trim()}
                  aria-label="Send"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-theme-primary text-white transition-colors hover:bg-theme-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <p className="mt-2 text-center text-[10px] text-theme-muted dark:text-neutral-600">{DISCLAIMER}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
