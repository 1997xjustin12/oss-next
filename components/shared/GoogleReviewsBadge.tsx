import Image from 'next/image'
import Link from 'next/link'
import { GOOGLE_REVIEW_STATS } from '@/config/reviews'

/**
 * The Google rating badge: logo, stars, and the review count.
 *
 * Shared by the homepage banner and the product page so the rating is stated
 * once. The two had drifted into separate copies of the same markup, which is
 * how a site ends up advertising two different ratings.
 *
 * `tone` covers the only real difference between them — the banner sits on a
 * photograph and needs white text with a shadow, while the product page sits on
 * white.
 */

const GOOGLE_REVIEWS_IMAGE = '/images/google-reviews.webp'

const STAR_PATH =
  'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'

type Props = {
  /** `onDark` for the banner photo, `onLight` for a white surface. */
  tone?: 'onDark' | 'onLight'
  /** Show the numeric rating beside the stars. The banner does; the PDP does not. */
  showRating?: boolean
  /** Link the review count. Off on the banner, where it is a plain statement. */
  linkCount?: boolean
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Five stars with the last one partially filled to match the real average.
 *
 * The fill fraction is derived rather than hardcoded, so changing the rating in
 * config moves the star instead of quietly disagreeing with the number printed
 * next to it.
 */
function RatingStars({ rating, px }: { rating: number; px: number }) {
  const whole = Math.floor(rating)
  const fraction = rating - whole
  const gradientId = `google-star-partial-${String(rating).replace('.', '-')}`

  return (
    <div className="flex items-center" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < whole
        const partial = i === whole && fraction > 0
        return (
          <svg key={i} width={px} height={px} viewBox="0 0 24 24">
            {partial && (
              <defs>
                <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
                  <stop offset={`${fraction * 100}%`} stopColor="#FBBC04" />
                  <stop offset={`${fraction * 100}%`} stopColor="#9CA3AF" />
                </linearGradient>
              </defs>
            )}
            <path
              d={STAR_PATH}
              fill={filled ? '#FBBC04' : partial ? `url(#${gradientId})` : '#D1D5DB'}
            />
          </svg>
        )
      })}
    </div>
  )
}

export function GoogleReviewsBadge({
  tone = 'onLight',
  showRating = false,
  linkCount = false,
  size = 'md',
  className = '',
}: Props) {
  const { rating, count, url } = GOOGLE_REVIEW_STATS
  const onDark = tone === 'onDark'
  const starPx = size === 'sm' ? 14 : 18

  const countLabel = `(${count} reviews)`
  const countClasses = onDark
    ? 'text-xs sm:text-sm'
    : 'text-xs text-theme-mid dark:text-gray-300'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src={GOOGLE_REVIEWS_IMAGE}
        alt="Google Reviews"
        width={100}
        height={50}
        className={size === 'sm' ? 'h-auto w-16' : 'h-auto w-20 sm:w-24'}
      />
      <div className={onDark ? 'text-white text-shadow-lg' : ''}>
        <div className="flex items-center gap-1.5">
          {showRating && (
            <span
              className={`font-bold ${onDark ? 'text-base sm:text-lg' : 'text-sm text-theme-dark dark:text-white'}`}
            >
              {rating}
            </span>
          )}
          <RatingStars rating={rating} px={starPx} />
        </div>

        {linkCount ? (
          <Link
            href={url}
            className={`${countClasses} underline underline-offset-2 transition-opacity hover:opacity-80`}
          >
            {countLabel}
          </Link>
        ) : (
          <div className={countClasses}>{countLabel}</div>
        )}
      </div>
    </div>
  )
}
