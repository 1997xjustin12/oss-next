"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, FileText, Image as ImageIcon } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { getContainerResources } from "@/lib/data/pdpResources";
import type { ContainerResource } from "@/lib/data/pdpShippingContainers";
import type { ProductHit } from "@/types/product";

/**
 * The documents and pages offered for a container size.
 *
 * Keyed off the active product rather than the one the page loaded on, so
 * changing size in the picker swaps the list with it — the resources are size
 * specific, and a 40ft spec sheet under a 20ft selection would be wrong in the
 * way nobody notices until a customer calls about it.
 *
 * Three kinds of link, each opening the way its content wants to be read:
 *
 *   - `pdf`  a new tab, left to the browser's own viewer
 *   - `img`  a lightbox here, so the infographic stays beside the product
 *   - `page` an ordinary client-side navigation
 *
 * Renders nothing when a size has no resources, rather than an empty heading.
 */

const LINK_CLASS =
  "flex h-full w-full items-center justify-between gap-2 rounded-[5px] bg-[#BD112A] p-[10px] text-left text-[13px] font-semibold leading-tight text-white transition-colors hover:bg-[#A50F24] focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2";

export function ContainerResources({ product }: { product: ProductHit }) {
  const resources = getContainerResources(product);
  const [openImage, setOpenImage] = useState<ContainerResource | null>(null);

  // The heading belongs to this component, not the page: a product whose
  // combination has no files yet would otherwise leave "Resources:" standing
  // over nothing.
  if (resources.length === 0) return null;

  return (
    <>
      <section className="px-4 sm:px-[5%]">
        <div className="flex items-baseline mb-6">
          <h2 className="text-[16px] md:text-[24px] font-bold tracking-tight">
            Resources:
          </h2>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {resources.map((resource) => (
            <li key={resource.label}>
              {resource.type === "pdf" ? (
                /* A plain anchor, not `Link`: the target is a file in `public/`,
                   not a route for the client router to handle. No `download`
                   attribute either — that would force a save instead of showing
                   the document, which is the opposite of opening a spec sheet. */
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_CLASS}
                >
                  <span>{resource.label}</span>
                  <FileText
                    className="h-4 w-4 shrink-0"
                    aria-label="PDF, opens in a new tab"
                  />
                </a>
              ) : resource.type === "img" ? (
                <button
                  type="button"
                  onClick={() => setOpenImage(resource)}
                  className={LINK_CLASS}
                >
                  <span>{resource.label}</span>
                  <ImageIcon
                    className="h-4 w-4 shrink-0"
                    aria-label="Image, opens on this page"
                  />
                </button>
              ) : (
                <Link href={resource.url} className={LINK_CLASS}>
                  <span>{resource.label}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      <Modal
        open={openImage !== null}
        onClose={() => setOpenImage(null)}
        bare
        maxWidth="max-w-4xl"
        title={openImage?.label}
      >
        {openImage && (
          <figure>
            {/* `object-contain`, never `cover`: these are diagrams with labels
                around the edges, and cropping one to fill a box removes the
                part that carries the meaning. */}
            <div className="relative aspect-4/3 w-full bg-white">
              <Image
                src={openImage.url}
                alt={openImage.label}
                fill
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-contain"
              />
            </div>
            <figcaption className="border-t border-theme-border px-5 py-3 text-sm font-semibold text-theme-dark dark:border-neutral-800 dark:text-white">
              {openImage.label}
            </figcaption>
          </figure>
        )}
      </Modal>
    </>
  );
}
