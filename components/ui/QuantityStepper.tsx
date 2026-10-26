"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Names the field for assistive tech, e.g. "Quantity of Steel Ramp". */
  label?: string;
  className?: string;
};

const BUTTON =
  "flex h-11 w-10 shrink-0 items-center justify-center text-theme-dark transition-colors hover:bg-theme-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-primary disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-100 dark:hover:bg-neutral-800";

/**
 * A quantity field with − and + buttons. The number can also be typed; it is
 * clamped to [min, max] when the field loses focus, so a half-typed value is
 * never rejected while the visitor is still typing.
 */
export function QuantityStepper({ value, onChange, min = 1, max = 99, label = "Quantity", className = "" }: Props) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)));
  // What the field shows while it is being typed in; null when it mirrors `value`.
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <div
      role="group"
      aria-label={label}
      className={`inline-flex items-center overflow-hidden rounded-md border border-theme-border bg-white dark:border-neutral-700 dark:bg-neutral-900 ${className}`}
    >
      <button type="button" className={BUTTON} onClick={() => onChange(clamp(value - 1))} disabled={value <= min} aria-label="Decrease quantity">
        <Minus aria-hidden className="h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={draft ?? value}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value !== "" && Number.isFinite(n)) onChange(clamp(n));
        }}
        onBlur={() => setDraft(null)}
        aria-label="Quantity"
        className="h-11 w-10 min-w-0 border-x border-theme-border bg-transparent text-center text-sm font-bold text-theme-dark [appearance:textfield] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-primary dark:border-neutral-700 dark:text-gray-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button type="button" className={BUTTON} onClick={() => onChange(clamp(value + 1))} disabled={value >= max} aria-label="Increase quantity">
        <Plus aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}
