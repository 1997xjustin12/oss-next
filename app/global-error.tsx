'use client'

// Only fires when the root layout itself throws — deliberately minimal and
// independent of app context (Cart/Auth providers, next/font) since those
// are exactly the kind of thing that could be broken when this renders.
// Must render its own <html>/<body>; it fully replaces the root layout.
import { useEffect } from 'react'
import './globals.css'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[app/global-error.tsx]', error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 1rem',
            textAlign: 'center',
            fontFamily: '-apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px' }}>
            Something Went Wrong
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#6b7178', maxWidth: '26rem', margin: '0 0 24px' }}>
            We hit an unexpected error. Please try again, or call us at (888) 977-9085.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: '#BD112A',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
