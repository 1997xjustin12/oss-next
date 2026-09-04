import Link from "next/link";
import { CONTACT_NUMBER } from "@/lib/helpers";

/**
 * The "talk to someone" banner, on phones.
 *
 * Sits after the specifications and comparisons, where a shopper who has read
 * everything and still cannot choose has run out of things the page can answer.
 * That is the moment to offer a person rather than another spec table.
 *
 * Full width by design — it interrupts the column of padded sections around it,
 * which is what makes it read as a break in the page rather than one more card.
 * The wrapper carries no horizontal padding, so it spans edge to edge on its
 * own without needing to cancel a parent's.
 *
 * Hidden from `lg` up, where the sticky ordering panel keeps a call button in
 * view the whole way down.
 */

const CONTACT_TEL = `tel:${CONTACT_NUMBER.replace(/[^\d+]/g, "")}`;

export function MobileSpecialistBanner() {
  return (
    <section
      className="bg-[#123A5E] px-5 py-8 text-center lg:hidden"
      aria-label="Speak to a container specialist"
    >
      <h2 className="text-[22px] font-extrabold uppercase leading-tight tracking-tight text-[#F5C24A]">
        Not sure which option is right for you?
      </h2>
      <p className="mt-1.5 text-[17px] font-bold leading-snug text-white">
        Talk to a container specialist. We&rsquo;re here to help.
      </p>

      <Link
        href={CONTACT_TEL}
        className="mt-4 inline-flex items-center justify-center rounded-[4px] bg-[#BD112A] px-6 py-3 text-[19px] font-bold text-white transition-colors hover:bg-[#A50F24] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#123A5E]"
      >
        CALL NOW&nbsp;
        <span className="underline underline-offset-4">{CONTACT_NUMBER}</span>
      </Link>

      <p className="mt-4 text-[13px] text-white/70">
        Mon-Fri 6 am - 5 pm PST &bull; Chat 24/7
      </p>
    </section>
  );
}
