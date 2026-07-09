import { Star } from 'lucide-react'

type Props = { count: number; className?: string }

export function Stars({ count, className = 'w-4 h-4' }: Props) {
  return (
    <div className="flex items-center gap-0.5 text-theme-primary">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${className} ${i < count ? 'fill-current' : 'fill-none opacity-30'}`} />
      ))}
    </div>
  )
}
