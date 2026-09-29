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

**A still with the same stem becomes the poster frame.** `new_20s_iicl.webp`
beside `new_20s_iicl.mp4` is shown before playback. Without one the gallery
falls back to the product's own first photograph, so there is never a black box.

**A stem with no file is normal, not an error.** Those products show their
photographs, with no empty player and no request for a file that is not there.

Extensions: `.mp4` then `.webm` for video, `.webp` / `.jpg` / `.jpeg` / `.png`
for the poster. Captions and durations, when a default is not good enough, go in
`config/containerVideos.ts`.

Names are matched **exactly**. `new_20s_iicl_v2.mp4` matches nothing and is
silently ignored — `npm run resources:check` is what surfaces that.

---

## Encode with `faststart`, or the video will be slow

An MP4 keeps its index (the `moov` atom) either at the front of the file or at
the end. At the end, nothing can play until the whole file has been fetched —
on a 5MB walkaround over a phone connection that is several seconds of blank
player, and the gallery's 512KB warm-up cannot help because the part it fetches
does not contain the index.

Check a file:

```bash
# "moov" should appear within the first few KB, not at the end
node -e "const b=require('fs').readFileSync('new_20s_iicl.mp4').subarray(0,65536);console.log(b.indexOf('moov'))"
```

Fix it, losslessly — this only moves the index, it does not re-encode:

```bash
ffmpeg -i input.mp4 -c copy -movflags +faststart new_20s_iicl.mp4
```

As of 2026-09-29 `new_20s_iicl.mp4` is faststart (index at byte 7,824) and
`used_20s_wwt.mp4` is **not** (index at the end).

## Keep them small

These are shipped whole from `public/`, so the file size is what a visitor
downloads. Around 2–3MB for a 30–45 second walkaround is comfortable; 5MB is
already enough to notice. 720p at a moderate bitrate is plenty for a gallery
pane this size:

```bash
ffmpeg -i input.mp4 -vf scale=-2:720 -c:v libx264 -crf 26 -preset slow \
  -c:a aac -b:a 96k -movflags +faststart new_20s_iicl.mp4
```
