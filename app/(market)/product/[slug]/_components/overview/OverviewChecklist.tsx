import { Check } from 'lucide-react'

/**
 * The "what you get" ticks under an overview's intro.
 *
 * Two columns filled top-to-bottom rather than left-to-right, which is how the
 * design reads them — CSS columns do that ordering natively, where a grid would
 * need a fixed row count and break as soon as an item is added or removed.
 *
 * Shared because every condition and grade will want its own list of these; the
 * items are the part that differs, not the layout.
 */

export function OverviewChecklist({ items }: { items: string[] }) {
  if (items.length === 0) return null

  return (
    <ul className="mt-5 gap-x-8 sm:columns-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex break-inside-avoid items-start gap-2 py-1 text-sm sm:text-base text-theme-dark dark:text-gray-200"
        >
          <Check
            className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]"
            strokeWidth={3}
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
