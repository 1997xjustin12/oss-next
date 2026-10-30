'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, RotateCcw, Save } from 'lucide-react';
import { savePlpOrderAction } from '@/actions/plpOrder';
import { PLP_ORDER_LABELS, type PlpOrder } from '@/config/plpOrder';

/**
 * The lists of Admin → Listing Order, reordered with Up and Down buttons
 * (keyboard-friendly, and nothing to drag on a phone). Only the order can
 * change: no value is added or removed, so a save cannot drop products from
 * the rule. The whole order goes to the action as JSON in one hidden field.
 */

const CARD =
  'rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900';
const ICON_BUTTON =
  'inline-flex h-8 w-8 items-center justify-center rounded-md border border-theme-border text-theme-dark transition-colors hover:border-theme-primary hover:text-theme-primary disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-200';

function move<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function OrderList({
  title,
  hint,
  values,
  defaults,
  onChange,
}: {
  title: string;
  hint: string;
  values: readonly string[];
  defaults: readonly string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <section className={CARD}>
      <h2 className="text-sm font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">{title}</h2>
      <p className="mt-1 text-xs text-theme-muted dark:text-neutral-400">{hint}</p>
      <ol className="mt-3 space-y-2">
        {values.map((value, i) => {
          const label = PLP_ORDER_LABELS[value] ?? value;
          return (
            <li
              key={value}
              className="flex items-center gap-3 rounded-md border border-theme-border px-3 py-2 dark:border-neutral-700"
            >
              <span className="w-5 shrink-0 text-right font-mono text-xs text-theme-muted">{i + 1}</span>
              <span className="min-w-0 flex-1 text-sm font-semibold text-theme-dark dark:text-neutral-100">{label}</span>
              {defaults.indexOf(value) !== i && (
                <span className="text-[11px] text-theme-muted">Default #{defaults.indexOf(value) + 1}</span>
              )}
              <button
                type="button"
                aria-label={`Move ${label} up`}
                disabled={i === 0}
                onClick={() => onChange(move(values, i, i - 1))}
                className={ICON_BUTTON}
              >
                <ArrowUp className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-label={`Move ${label} down`}
                disabled={i === values.length - 1}
                onClick={() => onChange(move(values, i, i + 1))}
                className={ICON_BUTTON}
              >
                <ArrowDown className="h-4 w-4" aria-hidden />
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function ListingOrderEditor({
  initial,
  defaults,
  custom,
}: {
  initial: PlpOrder;
  defaults: PlpOrder;
  /** A saved order is in use (so Reset has something to undo). */
  custom: boolean;
}) {
  const [order, setOrder] = useState<PlpOrder>(initial);
  const changed = JSON.stringify(order) !== JSON.stringify(initial);

  return (
    <form action={savePlpOrderAction} className="space-y-6">
      <input type="hidden" name="order" value={JSON.stringify(order)} />

      <OrderList
        title="1. What Decides First"
        hint="Products are compared by the first of these; the next only breaks a tie. Term applies to Rent and Rent-To-Own (Buy has none)."
        values={order.keys}
        defaults={defaults.keys}
        onChange={(keys) => setOrder({ ...order, keys: keys as PlpOrder['keys'] })}
      />
      <OrderList
        title="Grade"
        hint="Condition and grade. First is shown first."
        values={order.grade}
        defaults={defaults.grade}
        onChange={(grade) => setOrder({ ...order, grade })}
      />
      <OrderList
        title="Size"
        hint="Length and height."
        values={order.size}
        defaults={defaults.size}
        onChange={(size) => setOrder({ ...order, size })}
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <OrderList
          title="Rent: Term"
          hint="Rental terms."
          values={order.term.rental}
          defaults={defaults.term.rental}
          onChange={(rental) => setOrder({ ...order, term: { ...order.term, rental } })}
        />
        <OrderList
          title="Rent-To-Own: Term"
          hint="Rent-to-own terms."
          values={order.term.rto}
          defaults={defaults.term.rto}
          onChange={(rto) => setOrder({ ...order, term: { ...order.term, rto } })}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!changed}
          className="inline-flex items-center gap-1.5 rounded-md bg-theme-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" aria-hidden />
          Save Order
        </button>
        {changed && (
          <button
            type="button"
            onClick={() => setOrder(initial)}
            className="text-sm font-semibold text-theme-muted underline underline-offset-2 hover:text-theme-primary"
          >
            Undo changes
          </button>
        )}
        {custom && (
          <button
            type="submit"
            name="intent"
            value="reset"
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-theme-border px-3.5 py-2 text-sm font-bold text-theme-dark transition-colors hover:border-theme-primary hover:text-theme-primary dark:border-neutral-700 dark:text-neutral-200"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset to Default
          </button>
        )}
      </div>
    </form>
  );
}
