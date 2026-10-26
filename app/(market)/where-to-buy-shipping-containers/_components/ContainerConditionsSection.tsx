import { CONTAINER_CONDITIONS } from "@/lib/data/whereToBuyContent";
import { InfoContentCard } from "./InfoContentCard";

/** One trip, used (with its grades) and refurbished, under the "conditions" tagline. */
export function ContainerConditionsSection() {
  return (
    <section className="bg-theme-subtle px-4 py-12 sm:px-[5%] dark:bg-neutral-900">
      <ul className="mx-auto flex max-w-6xl flex-col gap-6">
        {CONTAINER_CONDITIONS.map((card) => (
          <li key={card.title}>
            <InfoContentCard card={card} horizontal />
          </li>
        ))}
      </ul>
    </section>
  );
}
