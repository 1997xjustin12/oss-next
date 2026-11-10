"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HOME_PREVIEW_PARAM } from "@/config/homeAb";
import { HEAT_GRID, homeSections, type Device, type HomeVariant } from "@/lib/homeAb";

type Box = { top: number; left: number; width: number; height: number };

type Props = {
  variant: HomeVariant;
  device: Device;
  /** [section, x, y, clicks] */
  cells: [number, number, number, number][];
};

/** The window widths the map is drawn at: a common laptop, and a common phone. */
const FRAME_WIDTH: Record<Device, number> = { d: 1366, m: 390 };
const MAX_FRAME_HEIGHT = 30_000;

/** Transparent → blue → green → yellow → red, by heat 0..255. */
function palette(): Uint8ClampedArray {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 256, 0);
  gradient.addColorStop(0.15, "#2563eb");
  gradient.addColorStop(0.45, "#16a34a");
  gradient.addColorStop(0.7, "#facc15");
  gradient.addColorStop(1, "#dc2626");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 1);
  return ctx.getImageData(0, 0, 256, 1).data;
}

/**
 * The click heatmap, drawn over a live copy of the variant (`/?version=<n>`,
 * which the tracker ignores) at desktop or phone width. Clicks are stored per
 * page section (lib/homeAb.ts), so each is placed in the same section of this
 * copy, wherever that section sits at this width.
 *
 * Give it a `key` of variant and device: a change is a fresh frame to measure.
 */
export function HomeHeatmap({ variant, device, cells }: Props) {
  const frameWidth = FRAME_WIDTH[device];
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(3000);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Fit the frame to the column.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new ResizeObserver(() => setScale(Math.min(1, wrap.clientWidth / frameWidth)));
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [frameWidth]);

  /** Measure the copy's sections; false while its page has not rendered them yet. */
  const measure = useCallback((): boolean => {
    const doc = frameRef.current?.contentDocument;
    const sections = doc ? homeSections(doc) : [];
    if (!doc || !sections.length) return false;
    const next = Math.min(MAX_FRAME_HEIGHT, doc.documentElement.scrollHeight);
    // Grow only: a page that sizes itself to the window would otherwise chase the frame.
    setHeight((current) => (next > current + 2 ? next : current));
    setBoxes(
      sections.map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top, left: r.left, width: r.width, height: r.height };
      }),
    );
    setLoaded(true);
    return true;
  }, []);

  // Draw as soon as the page's sections exist (its load event waits for every
  // widget and image), then keep measuring for a while: images and fonts move
  // sections as they arrive.
  useEffect(() => {
    let observer: ResizeObserver | null = null;
    let ticks = 0;
    const timer = setInterval(() => {
      ticks += 1;
      if (measure() && !observer) {
        const body = frameRef.current?.contentDocument?.body;
        if (body) {
          observer = new ResizeObserver(() => measure());
          observer.observe(body);
        }
      }
      if (ticks >= 40) clearInterval(timer);
    }, 500);
    return () => {
      clearInterval(timer);
      observer?.disconnect();
    };
  }, [measure]);

  // Draw: soft spots in alpha, then coloured by intensity.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = frameWidth;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx || !boxes.length || !cells.length) return;
    const max = Math.max(...cells.map((c) => c[3]));
    for (const [section, x, y, n] of cells) {
      const box = boxes[section];
      if (!box) continue;
      const cx = box.left + ((x + 0.5) * box.width) / HEAT_GRID;
      const cy = box.top + ((y + 0.5) * box.height) / HEAT_GRID;
      const radius = Math.max(18, Math.min(box.width, box.height) / HEAT_GRID * 2.5);
      const spot = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      spot.addColorStop(0, `rgba(0,0,0,${0.25 + 0.75 * (n / max)})`);
      spot.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = spot;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    }
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const colors = palette();
    const px = image.data;
    for (let i = 3; i < px.length; i += 4) {
      const a = px[i];
      if (!a) continue;
      px[i - 3] = colors[a * 4];
      px[i - 2] = colors[a * 4 + 1];
      px[i - 1] = colors[a * 4 + 2];
      px[i] = Math.min(220, 60 + a);
    }
    ctx.putImageData(image, 0, 0);
  }, [boxes, cells, frameWidth, height]);

  return (
    <div ref={wrapRef} className="w-full">
      <div className="relative overflow-hidden rounded-lg border border-neutral-200 bg-white" style={{ width: frameWidth * scale, height: height * scale }}>
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: frameWidth, height, transform: `scale(${scale})` }}>
          <iframe
            ref={frameRef}
            src={`/?${HOME_PREVIEW_PARAM}=${variant}`}
            title={`Homepage version ${variant}`}
            width={frameWidth}
            height={height}
            className="pointer-events-none block border-0"
            onLoad={() => measure()}
          />
          <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute left-0 top-0" style={{ width: frameWidth, height }} />
        </div>
        {!loaded && <p className="absolute inset-x-0 top-4 text-center text-sm text-neutral-500">Loading version {variant}…</p>}
      </div>
    </div>
  );
}
