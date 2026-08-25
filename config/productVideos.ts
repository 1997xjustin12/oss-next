/**
 * The videos shown on a product page.
 *
 * Two slots, and they work differently:
 *
 *   1. SHARED_PRODUCT_VIDEO — the same for every product, whatever its size.
 *   2. PRODUCT_VIDEOS_BY_SIZE — chosen by the size the PDP is currently
 *      showing, so changing size in the picker swaps it with no extra wiring.
 *
 * The size key (`20`, `40`, `40HC`, …) is built by `videoSizeKey()` in
 * lib/productVideos.ts from the same `length_width` and `height` fields the
 * size selector reads, so the two can never disagree.
 *
 * To add one: take the id out of the YouTube URL — the part after `/embed/` or
 * `v=`, before any `?` — and drop it in below. Not the whole URL.
 */

export type ProductVideo = {
  /** The YouTube id only. e.g. `_eezA15UXHM`. */
  id: string;
  /** Used as the iframe title and the play button's label — make it descriptive. */
  title: string;
};

/** Slot 1 — shown on every product regardless of size. */
export const SHARED_PRODUCT_VIDEO: ProductVideo = {
  id: "_eezA15UXHM",
  title: "About our shipping containers",
};

/**
 * Slot 2 — one per size.
 *
 * Deliberately empty rather than filled with invented ids: a wrong id renders
 * as "Video unavailable" on a live product page, which is worse than showing
 * one video. A size with no entry simply shows slot 1 alone.
 */
export const PRODUCT_VIDEOS_BY_SIZE: Record<string, ProductVideo> = {
  "20": { id: "_3Dvb5y_odc", title: "20ft shipping container" },
  "40": { id: "6QwrSRcqG0s", title: "40ft shipping container" },
  "40HC": { id: "TnTojWCN-3U", title: "40ft high cube shipping container" },

  // Between them the three keys above cover 9,761 of the 10,528 products.
  // Still uncovered:
  //   10   226 products
  //   45     7
  //   53     1
  // "10": { id: "", title: "10ft shipping container" },
  //
  // There is no 20HC key: every 20ft container in the catalogue is standard
  // height, so it would never match anything.
};

/**
 * The videos to render, in order.
 *
 * Always the shared one first; the size-specific one follows when that size has
 * been given one.
 */
export function videosForSize(sizeKey: string): ProductVideo[] {
  const bySize = sizeKey ? PRODUCT_VIDEOS_BY_SIZE[sizeKey] : undefined;
  return bySize?.id ? [SHARED_PRODUCT_VIDEO, bySize] : [SHARED_PRODUCT_VIDEO];
}
