'use client'

import { useState, FormEvent } from 'react'
import { Star } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/hooks/useAuth'
import type { Review } from '@/types/review'

type Props = {
  open: boolean
  onClose: () => void
  productId: string | number
  productTitle: string
  existingReview: Review | null
  onSaved: () => void
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={`star-picker-${n}`}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          className="p-0.5"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              (hover || value) >= n ? 'fill-amber-400 text-amber-400' : 'fill-none text-theme-border dark:text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export function ReviewFormModal({ open, onClose, productId, productTitle, existingReview, onSaved }: Props) {
  const { token } = useAuth()
  const [rating, setRating] = useState(existingReview?.rating ?? 0)
  const [title, setTitle] = useState(existingReview?.title ?? '')
  const [comment, setComment] = useState(existingReview?.comment ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputClass =
    'w-full rounded-md border border-theme-border bg-theme-subtle px-3.5 py-2.5 text-sm text-theme-dark ' +
    'placeholder:text-theme-muted outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 transition-colors ' +
    'dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500'

  const labelClass = 'block text-sm font-semibold text-theme-dark-2 mb-1.5 dark:text-gray-300'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!rating) {
      setError('Please select a star rating.')
      return
    }
    if (!title || !comment) {
      setError('Please fill in both the title and review.')
      return
    }
    if (!token) {
      setError('You must be logged in to submit a review.')
      return
    }

    try {
      setIsSubmitting(true)
      const body = existingReview
        ? { id: existingReview.id, product: productId, rating, title, comment }
        : { product: productId, rating, title, comment }

      const res = await fetch(existingReview ? '/api/reviews/update' : '/api/reviews/create', {
        method: existingReview ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Could not save your review.')

      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={existingReview ? 'Edit Your Review' : 'Write a Review'}>
      <p className="text-xs text-theme-muted dark:text-gray-400 mb-4 truncate">{productTitle}</p>

      {error && (
        <div className="mb-4 rounded-md border border-theme-primary/30 bg-theme-primary-light px-4 py-3 text-sm text-theme-primary
                        dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className={labelClass}>
            Rating <span className="text-theme-primary dark:text-red-400">*</span>
          </label>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        <div>
          <label htmlFor="review-title" className={labelClass}>
            Title <span className="text-theme-primary dark:text-red-400">*</span>
          </label>
          <input
            id="review-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="review-comment" className={labelClass}>
            Review <span className="text-theme-primary dark:text-red-400">*</span>
          </label>
          <textarea
            id="review-comment"
            required
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-semibold px-6 py-2.5 text-sm
                     transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : existingReview ? 'Update Review' : 'Submit Review'}
        </button>
      </form>
    </Modal>
  )
}
