"use client";

import { useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";

/**
 * What a used container actually looks like, six views at a time.
 *
 * Sets expectations before the sale rather than after delivery: a used
 * container has rust and dents, and a buyer who sees that here is not the one
 * who calls about it later. Which is why the tiles open — the copy above them
 * promises a closer look, and a 60px thumbnail cannot deliver one.
 *
 * Client-side only for the lightbox; the tiles themselves are plain images.
 */

type ConditionView = {
  src: string;
  label: string;
};

/** Order fixed by the design: outside in, then the things people ask about. */
const VIEWS: ConditionView[] = [
  { src: "/images/used-containers/exterior.webp", label: "Exterior" },
  { src: "/images/used-containers/doors.webp", label: "Doors" },
  { src: "/images/used-containers/interior.webp", label: "Interior" },
  { src: "/images/used-containers/floor.webp", label: "Floor" },
  { src: "/images/used-containers/dents-and-rust.webp", label: "Dents & Rust" },
  { src: "/images/used-containers/repairs.webp", label: "Repairs" },
];

export function UsedConditionGallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const open = openIndex === null ? null : VIEWS[openIndex];

  return (
    <>
      <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
        {VIEWS.map((view, index) => (
          <li key={view.label}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group relative block aspect-square w-full overflow-hidden rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2"
            >
              <Image
                src={view.src}
                alt={`Used container ${view.label.toLowerCase()}`}
                fill
                sizes="(max-width: 640px) 33vw, 16vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* The label carries its own ground rather than darkening the
                  whole photograph. These images are the point — the rust and
                  the patch repairs are what the buyer came to see — so a scrim
                  over all six would dim the evidence to caption something the
                  chip can hold on its own. */}
              <span className="absolute inset-0 flex items-center justify-center p-1.5">
                <span className="max-w-full truncate bg-white/95 px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-wide text-[#1F1F1F] shadow-sm sm:text-[11px]">
                  {view.label}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Modal
        open={open !== null}
        onClose={() => setOpenIndex(null)}
        bare
        maxWidth="max-w-3xl"
        title={open ? `Used container — ${open.label}` : undefined}
      >
        {open && (
          <figure>
            <div className="relative aspect-4/3 w-full bg-theme-subtle">
              <Image
                src={open.src}
                alt={`Used container ${open.label.toLowerCase()}`}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
            <figcaption className="px-5 py-3 text-sm font-bold uppercase tracking-wide text-theme-dark dark:text-white">
              {open.label}
              <span className="ml-2 font-normal normal-case text-theme-muted">
                Typical condition — yours will vary.
              </span>
            </figcaption>
          </figure>
        )}
      </Modal>
    </>
  );
}
