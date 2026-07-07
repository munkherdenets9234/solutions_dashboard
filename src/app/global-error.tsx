'use client'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#fbfaf8',
          color: '#2c2a27',
        }}
      >
        <div style={{ maxWidth: 360, textAlign: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Something went wrong</h2>
          <p style={{ fontSize: 13, color: '#56544e', marginTop: 8 }}>
            {error.digest ? `Reference: ${error.digest}` : 'The application failed to load.'}
          </p>
          <button
            onClick={() => unstable_retry()}
            style={{
              marginTop: 16,
              height: 36,
              padding: '0 16px',
              borderRadius: 6,
              background: '#2c2a27',
              color: '#fbfaf8',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
