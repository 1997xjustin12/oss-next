import Image from "next/image";
import type { ContentCard } from "@/lib/data/whereToBuyContent";

type Props = {
  card: ContentCard;
  /** Image beside the text from md up, instead of above it. */
  horizontal?: boolean;
  /** Heading level inside the section: h3 for top-level cards, h4 for nested ones. */
  headingLevel?: 3 | 4;
};

/**
 * A container type, condition or grade: picture, title, copy.
 *
 * Hover matches the WordPress page's cards: a #E92945 border, 20px corners and
 * a 10px shadow. The border is there (transparent) at rest so nothing moves.
 */
export function InfoContentCard({ card, horizontal = false, headingLevel = 3 }: Props) {
  const Heading = headingLevel === 3 ? "h3" : "h4";

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-[20px] border-2 border-transparent bg-white transition-[border-color,box-shadow] duration-300 hover:border-[#E92945] hover:shadow-[0_0_10px_0_rgba(0,0,0,0.5)] dark:bg-neutral-900 ${
        horizontal && card.image ? "md:grid md:grid-cols-[2fr_3fr]" : ""
      }`}
    >
      {card.image && (
        <div className="relative aspect-4/3 w-full bg-theme-subtle dark:bg-neutral-800">
          <Image
            src={card.image.src}
            alt={card.image.alt}
            fill
            sizes={horizontal ? "(max-width: 768px) 100vw, 40vw" : "(max-width: 768px) 100vw, 33vw"}
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <Heading className="text-xl font-extrabold uppercase tracking-wide text-theme-dark dark:text-gray-100">
          {card.title}
        </Heading>
        {card.paragraphs.map((text) => (
          <p key={text.slice(0, 32)} className="text-[15px] leading-relaxed text-theme-mid dark:text-gray-300">
            {text}
          </p>
        ))}
        {card.children && (
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {card.children.map((child) => (
              <InfoContentCard key={child.title} card={child} headingLevel={4} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
