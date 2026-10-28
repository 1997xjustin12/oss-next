import { Check } from 'lucide-react'

const CARD = [
  'flex h-full min-h-13 cursor-pointer flex-col items-center justify-center rounded-lg border px-2 py-2 text-center text-[13px] leading-tight transition-colors sm:text-sm',
  'border-neutral-300 bg-white text-theme-dark hover:border-emerald-600 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100',
  'peer-checked:border-emerald-600 peer-checked:bg-emerald-50 peer-checked:font-semibold dark:peer-checked:bg-emerald-950/50',
  'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-600',
  'peer-disabled:cursor-not-allowed peer-disabled:border-neutral-200 peer-disabled:bg-neutral-100 peer-disabled:text-neutral-400 peer-disabled:hover:border-neutral-200',
  'dark:peer-disabled:border-neutral-800 dark:peer-disabled:bg-neutral-800/60 dark:peer-disabled:text-neutral-500',
].join(' ')

type Option = {
  value: string
  label: string
  /** A second line, e.g. the term's monthly price. Part of the radio's label. */
  detail?: string
}

type Props = {
  name: string
  legend: string
  /** Hide the legend visually (the step heading already says it). */
  legendHidden?: boolean
  options: readonly Option[]
  value: string | null
  /** Values that can be picked; the rest are disabled. */
  available: ReadonlySet<string>
  onChange: (value: string) => void
  /** Disable the whole group, e.g. while products load. */
  disabled?: boolean
  className?: string
}

/**
 * One configurator choice as a row of cards: a real radio group, so arrow keys
 * move between options and a screen reader announces the group and each
 * option's state. An option the depot doesn't stock is `disabled`, not only
 * greyed out, so it can't be picked by mouse or keyboard.
 */
export function ConfiguratorOptionGroup({
  name,
  legend,
  legendHidden = false,
  options,
  value,
  available,
  onChange,
  disabled = false,
  className,
}: Props) {
  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className={legendHidden ? 'sr-only' : 'mb-2 text-[15px] text-theme-mid dark:text-neutral-300'}>{legend}</legend>
      <div className={`grid gap-2.5 ${className ?? ''}`}>
        {options.map((option) => {
          const id = `${name}-${option.value}`
          const unavailable = !available.has(option.value)
          const checked = value === option.value
          return (
            <div key={option.value} className="relative">
              <input
                type="radio"
                id={id}
                name={name}
                value={option.value}
                checked={checked}
                disabled={unavailable}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <label htmlFor={id} className={CARD}>
                {/* With a price under it (the terms, four abreast), the label
                    shrinks on phones rather than breaking at "48-". */}
                <span className={option.detail ? 'whitespace-nowrap text-[11px] min-[400px]:text-xs sm:text-sm' : undefined}>
                  {option.label}
                </span>
                {option.detail && (
                  <span className="mt-0.5 text-base font-semibold sm:text-lg">{option.detail}</span>
                )}
                {unavailable && <span className="sr-only"> (not available at this location)</span>}
              </label>
              {checked && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              )}
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
