import { Phone } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { CONTACT_NUMBER, telHref } from "@/lib/helpers";
import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";

type Props = { title: string };

/** Breadcrumb, the page's one h1, the intro and the call button. */
export function AccessoryHero({ title }: Props) {
  return (
    <section className="bg-theme-dark px-4 py-12 text-white sm:px-[5%] sm:py-16">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm">
          <ol className="flex flex-wrap items-center gap-2 text-gray-300">
            <li>
              <Link href={ROUTES.HOME} className="underline underline-offset-2 hover:text-white">
                Home
              </Link>
            </li>
            <li aria-hidden>»</li>
            <li aria-current="page" className="text-white">
              Shipping Container Accessory Products
            </li>
          </ol>
        </nav>

        <h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
          Upgrade your shipping container with essential accessories like ramps, shelving, LED lights and locks.
          These add-ons boost functionality, safety and organization while protecting your cargo.
        </p>

        <a
          href={telHref(CONTACT_NUMBER)}
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-theme-primary px-6 py-3 text-base font-bold text-white transition-colors hover:bg-theme-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-theme-dark"
        >
          <Phone aria-hidden className="h-5 w-5" />
          Call {CONTACT_NUMBER}
        </a>
      </div>
    </section>
  );
}
