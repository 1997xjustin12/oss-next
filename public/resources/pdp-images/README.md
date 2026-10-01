# Curated gallery photographs

Drop images in here named after the specs they show — the same stem the PDP
resources and the walkaround videos use — with a number for the running order:

```
new_20s_iicl_1.webp     New 20ft standard IICL, first in the gallery
new_20s_iicl_2.webp     second
new_20s_iicl_3.webp     third
used_40h_wwt_1.webp     Used 40ft high cube, wind and water tight
```

That is the whole workflow. `npm run dev` and `npm run build` refresh the
manifest, and the gallery uses them on the next render. Nothing has to be
registered anywhere first.

Extensions: `.webp` preferred, `.jpg`, `.jpeg` and `.png` also work.

## These replace the product's own photographs

A stem with any files here **overrides** the images on the product record
entirely — the gallery shows these and only these. That is what picking the
shots for a spec means.

Worth knowing what it hides: the record's images can differ per depot, while a
curated set is one set for every depot selling that spec. If Atlanta and
Chicago should show different photographs of the same spec, this is not the
mechanism for it.

**A stem with no files is the ordinary case.** Those products keep their own
images exactly as before, so adding a set here is safe and reversible — delete
the files and the record's photographs come back.

## Ordering

The trailing number is the order, sorted numerically — `_10` comes after `_9`,
not between `_1` and `_2`. Gaps are fine: `_1`, `_3`, `_7` renders as three
images in that order.

The number is required. `new_20s_iicl.webp` with no number matches nothing and
is silently ignored, as is anything after the number —
`new_20s_iicl_2_final.webp` does not match. That strictness is deliberate: a
near-miss filename should do nothing rather than land halfway through someone's
gallery.

## A walkaround video still comes first

Where `public/resources/pdp-videos/` has a video for the same stem, it stays
the gallery's first slide and these follow it. The two are independent — a spec
can have either, both or neither.

## Keep them reasonable

These are shipped from `public/` and resized by `next/image` on the way out, so
the source can be generous without the visitor paying for it — but it is still
the file the optimiser reads. Around 1600px on the long edge at quality 80 is
plenty for the gallery pane and its lightbox:

```bash
ffmpeg -i source.jpg -vf scale=1600:-2 -c:v libwebp -quality 80 new_20s_iicl_1.webp
```
