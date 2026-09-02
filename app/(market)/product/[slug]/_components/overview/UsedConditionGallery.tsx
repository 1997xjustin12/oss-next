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
              // The label sits over the photograph, so the tile needs its own
              // scrim — these are daylight shots and white text on the sky in
              // the exterior view would be unreadable without one.
              className="group relative block w-full overflow-hidden rounded aspect-square focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2"
            >
              <Image
                src={view.src}
                alt={`Used container ${view.label.toLowerCase()}`}
                fill
                sizes="(max-width: 640px) 33vw, 16vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-black/35 transition-colors group-hover:bg-black/20" />
              <span className="absolute inset-0 flex items-center justify-center px-1 text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-white sm:text-[11px]">
                {view.label}
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
