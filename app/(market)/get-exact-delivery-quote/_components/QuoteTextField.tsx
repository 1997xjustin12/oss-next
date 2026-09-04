type Props = {
  id: string
  name: string
  label: string
  type?: 'text' | 'email' | 'tel'
  required?: boolean
  autoComplete?: string
  defaultValue?: string
}

/**
 * A labelled input whose label sits inside the box until you type.
 *
 * A Server Component: the label hides on `peer-placeholder-shown`, so the
 * behaviour is CSS and costs no client JS. The `placeholder=" "` is doing real
 * work — that selector only matches while a placeholder is showing, and a
 * single space is the smallest one that is never visible.
 *
 * The label is a real `<label>` rather than a styled placeholder, so it is
 * still announced once the field has content and the required state reaches
 * screen readers as a word rather than a red asterisk.
 */
export function QuoteTextField({
  id,
  name,
  label,
  type = 'text',
  required = false,
  autoComplete,
  defaultValue,
}: Props) {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        placeholder=" "
        className="peer h-12 w-full rounded-md border border-theme-border bg-theme-bg px-4 text-sm text-theme-dark outline-none transition-colors focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/25 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-theme-muted opacity-0 transition-opacity peer-placeholder-shown:opacity-100 dark:text-neutral-500"
      >
        {label}
        {required && (
          <>
            <span className="ml-1 text-theme-primary" aria-hidden>
              *
            </span>
            <span className="sr-only">(required)</span>
          </>
        )}
      </label>
    </div>
  )
}
