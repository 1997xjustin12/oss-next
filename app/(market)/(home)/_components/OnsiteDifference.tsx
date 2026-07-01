import Image from "next/image";
import Link from "next/link";
import { CONTACT_NUMBER } from "@/lib/helpers";

const GREGG_IMAGE = "/images/gregg.webp";

type ListItemData = { title: string; desc: string };

const LIST: ListItemData[] = [
  {
    title: "No Hidden Fees",
    desc: "Quoted price is final. Completely transparent from inquiry to invoice.",
  },
  {
    title: "70+ Strategic Hubs",
    desc: "Nationwide reach across the entire United States and Canada.",
  },
  {
    title: "75+ Years Experience",
    desc: "Senior staff with deep container industry expertise on every call.",
  },
  {
    title: "Flexible Options",
    desc: "Buy, rent, or Rent-to-own — your terms, your timeline, your budget.",
  },
];

function ListItem({ item }: { item: ListItemData }) {
  return (
    <div className="bg-[#F7F7F7] dark:bg-gray-800 p-5 rounded-sm">
      <h3 className="text-[18px] sm:text-[22px] font-semibold dark:text-white">{item.title}</h3>
      <span className="text-base sm:text-[18px] text-gray-700 dark:text-gray-300">{item.desc}</span>
    </div>
  );
}

export function OnsiteDifference() {
  return (
    <section className="p-5 sm:p-10 dark:bg-gray-950">
      <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-[60%] flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-col gap-4 sm:gap-5">
            <h2 className="text-[28px] sm:text-[36px] font-bold text-[#BD112A]">
              The On-Site Storage Difference
            </h2>
            <p className="text-lg sm:text-[20px] text-[#2E2E2E] dark:text-gray-300">
              Since 2002, we&apos;ve helped thousands of businesses and homeowners find the right
              container at the right price — with no stress and no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {LIST.map((item, index) => (
              <ListItem key={`list-item-${index}`} item={item} />
            ))}
          </div>

          <div>
            <Link
              prefetch={false}
              href={`tel:${CONTACT_NUMBER}`}
              className="inline-block py-2 px-5 text-white bg-[#BD112A] text-sm sm:text-[14px] font-semibold hover:bg-[#a00f24] transition-colors"
            >
              Call To Check Fast Delivery &amp; Best Price
            </Link>
          </div>
        </div>

        <div className="w-full min-h-[280px] sm:min-h-[380px] lg:w-[40%] relative overflow-hidden rounded-sm">
          <Image
            src={GREGG_IMAGE}
            alt="Gregg — On-Site Storage founder"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover object-top"
          />
        </div>
      </div>
    </section>
  );
}
