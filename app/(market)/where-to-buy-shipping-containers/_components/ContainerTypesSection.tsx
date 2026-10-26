import { CONTAINER_TYPES_CONTENT } from "@/lib/data/whereToBuyContent";
import { InfoContentCard } from "./InfoContentCard";

/** Dry, refrigerated and specialty containers, under the "types" tagline. */
export function ContainerTypesSection() {
  return (
    <section className="bg-theme-subtle px-4 py-12 sm:px-[5%] dark:bg-neutral-900">
      <ul className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
        {CONTAINER_TYPES_CONTENT.map((card) => (
          <li key={card.title}>
            <InfoContentCard card={card} />
          </li>
        ))}
      </ul>
    </section>
  );
}
