# Container walkaround videos

Drop a video in here named after the specs it shows, using the same stem the
PDP resources use — `<condition>_<size>_<grade>`:

```
new_20s_iicl.mp4      New 20ft standard, IICL
used_40h_wwt.mp4      Used 40ft high cube, wind and water tight
used_20s_asis.webm    Used 20ft standard, AS IS
```

That is the whole workflow. `npm run dev` and `npm run build` refresh the
manifest, and the file becomes the gallery's first slide on the next render.
Nothing has to be registered anywhere first.

**A stem with no file is normal, not an error.** Those products show their
photographs, with no empty player and no request for a file that is not there.

Extensions: `.mp4` then `.webm` for video. Captions and durations, when a
default is not good enough, go in `config/containerVideos.ts`.

Names are matched **exactly**. `new_20s_iicl_v2.mp4` matches nothing and is
silently ignored — `npm run resources:check` is what surfaces that.

---

## Thumbnails

Put a `.webp` beside the video with the same stem and it is picked up
automatically:

```
new_20s_iicl.mp4      the video
new_20s_iicl.webp     its thumbnail
```

Nothing to register — same rule as the video itself. Run `npm run dev` (or
`npm run build`) once after adding it, which regenerates the manifest, and the
gallery uses it. `.jpg`, `.jpeg` and `.png` also work; `.webp` is preferred and
is what the rest of this folder uses.

**Without one**, the gallery falls back to the product's own first photograph,
so there is never a black box — but every product then shows the same still for
its video, which is the reason to add one.

That file does two jobs:

| Where | How it is served |
|---|---|
| Gallery thumbnail strip | through `next/image`, resized to ~256px — about **6KB** |
| The video's `poster` frame | **raw, at full size** — `poster` does not go through `next/image` |

### Keep it under ~100KB

The `poster` half is the one that costs. It is fetched whole on every view of a
product with a video, and it cannot be optimised away, because the `poster`
attribute takes a plain URL.

As of 2026-09-30 the two in this folder are **346KB** and **248KB**. They render
correctly and the thumbnails are fine either way, but that is a few hundred KB
per page view for a still that autoplay covers within a second or two.

1280×960 at quality 80 is plenty — the largest this is ever drawn is the gallery
pane, and the thumbnail is served at 256px:

```bash
# from a frame of the video itself, which is usually the thumbnail you want
ffmpeg -i new_20s_iicl.mp4 -ss 00:00:02 -frames:v 1 -vf scale=1280:-2 \
  -c:v libwebp -quality 80 new_20s_iicl.webp
```

### Who actually sees the poster

Autoplay starts as soon as the gallery scrolls into view, so on most visits the
poster shows only for the moment before the first frame. It stays on screen for
two groups, which is why it is worth choosing a good frame rather than any
frame:

- anyone with **prefers-reduced-motion** set — the video does not start itself
  for them, so the poster is what they see until they press play;
- everyone, in the **thumbnail strip**, where it is permanent.

---

## Encode with `faststart`, or the video will be slow

An MP4 keeps its index (the `moov` atom) either at the front of the file or at
the end. At the end, nothing can play until the whole file has been fetched —
on a 5MB walkaround over a phone connection that is several seconds of blank
player.

Check a file:

```bash
# "moov" should appear within the first few KB, not at the end
node -e "const b=require('fs').readFileSync('new_20s_iicl.mp4').subarray(0,65536);console.log(b.indexOf('moov'))"
```

Fix it, losslessly — this only moves the index, it does not re-encode:

```bash
ffmpeg -i input.mp4 -c copy -movflags +faststart new_20s_iicl.mp4
```

As of 2026-09-30 `new_20s_iicl.mp4` is faststart (index at byte 7,824) and
`used_20s_wwt.mp4` is **not** (index at the end).

## Keep the videos small too

These are shipped whole from `public/`, so the file size is what a visitor
downloads — and since the video autoplays, everyone who scrolls the gallery into
view pays it. Around 2–3MB for a 30–45 second walkaround is comfortable; the
5MB pair here is already enough to notice. 720p at a moderate bitrate is plenty
for a gallery pane this size:

```bash
ffmpeg -i input.mp4 -vf scale=-2:720 -c:v libx264 -crf 26 -preset slow \
  -c:a aac -b:a 96k -movflags +faststart new_20s_iicl.mp4
```

There is no audio track worth keeping — the gallery plays muted — so dropping
it with `-an` saves a little more.
