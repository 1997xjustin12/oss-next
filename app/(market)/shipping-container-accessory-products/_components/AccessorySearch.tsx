import Form from "next/form";
import { Search } from "lucide-react";
import { ROUTES } from "@/config/routes";

type Props = {
  defaultValue: string;
  /** The other active filters, kept across a new search. */
  hidden: Record<string, string>;
};

/**
 * Product search: a GET form, so it works without JavaScript; with it,
 * next/form turns the submit into a client-side navigation.
 */
export function AccessorySearch({ defaultValue, hidden }: Props) {
  return (
    <Form action={ROUTES.ACCESSORY_PRODUCTS} scroll={false} role="search" className="flex w-full sm:max-w-sm">
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <label htmlFor="accessory-search" className="sr-only">
        Search accessories
      </label>
      <input
        id="accessory-search"
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search products…"
        maxLength={80}
        className="min-h-11 w-full min-w-0 rounded-l-md border border-r-0 border-theme-border bg-white px-3 text-sm text-theme-dark placeholder:text-theme-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100 dark:placeholder:text-gray-400"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex min-h-11 w-11 shrink-0 items-center justify-center rounded-r-md bg-theme-primary text-white transition-colors hover:bg-theme-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2"
      >
        <Search aria-hidden className="h-4 w-4" />
      </button>
    </Form>
  );
}
