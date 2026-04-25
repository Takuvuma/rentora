'use client'

import { useRef, useState, useTransition } from 'react'
import { joinWaitlist } from '@/app/actions/waitlist'

export function WaitlistForm() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await joinWaitlist(formData)
      if (result.success) {
        setMessage({ type: 'success', text: '✓ You\'re on the list. We\'ll be in touch within 48 hours.' })
        formRef.current?.reset()
      } else {
        setMessage({ type: 'error', text: result.error ?? 'Something went wrong.' })
      }
      setTimeout(() => setMessage(null), 6000)
    })
  }

  return (
    <div>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '0.75rem',
          maxWidth: '480px',
          margin: '0 auto',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '0.35rem',
          borderRadius: '100px',
        }}
      >
        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'white',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
            padding: '0.75rem 1.25rem',
          }}
        />
        <button
          type="submit"
          disabled={isPending}
          style={{
            background: isPending ? '#0a7a5a' : '#0D9E75',
            color: 'white',
            padding: '0.85rem 1.75rem',
            borderRadius: '100px',
            fontWeight: 500,
            fontSize: '0.9rem',
            border: 'none',
            cursor: isPending ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background 0.2s',
          }}
        >
          {isPending ? 'Joining…' : 'Join waitlist →'}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: '1rem',
            fontSize: '0.9rem',
            color: message.type === 'success' ? '#1BC99A' : '#fca5a5',
            animation: 'fadeUp 0.4s ease both',
          }}
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
