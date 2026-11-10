"use client";

import { useEffect } from "react";
import { HOME_AB_REPORT_PATH, HOME_PREVIEW_PARAM } from "@/config/homeAb";
import {
  DESKTOP_MIN_WIDTH,
  HEAT_GRID,
  MAX_CLICKS_PER_REPORT,
  MAX_SUBMITS_PER_REPORT,
  SCROLL_MARKS,
  cleanLabel,
  homeSections,
  type HomeAbReport,
  type HomeVariant,
  type Region,
  type ScrollMark,
} from "@/lib/homeAb";

const VISITOR_KEY = "oss-ab-visitor";

function visitorId(): string | undefined {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id || !/^[A-Za-z0-9]{8,32}$/.test(id)) {
      id = crypto.randomUUID().replace(/-/g, "");
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

/** What a click was on: a link's path or scheme, or a control's text. '' when nothing nameable. */
function clickLabel(target: Element): string {
  const el = target.closest("a[href],button,[role=button],input[type=submit],summary,select");
  if (!el) return "";
  if (el instanceof HTMLAnchorElement) {
    try {
      const url = new URL(el.href, location.href);
      if (url.protocol === "tel:" || url.protocol === "mailto:") return url.protocol.slice(0, -1);
      if (url.origin !== location.origin) return url.host;
      return url.pathname.replace(/(.)\/+$/, "$1") + (url.hash && url.pathname === location.pathname ? url.hash : "");
    } catch {
      return "";
    }
  }
  const text = el.getAttribute("aria-label") || (el as HTMLInputElement).value || el.textContent || "";
  return cleanLabel(text.replace(/\s+/g, " ").trim().slice(0, 40)) ?? "";
}

function regionOf(target: Element): Region {
  if (target.closest("main")) return "m";
  if (target.closest("footer")) return "f";
  return "h";
}

/**
 * The homepage A/B test's own analytics (lib/homeAb.ts): views, scroll depth,
 * clicks with what was clicked and where, and form submits, for the variant on
 * the page. Reported to /admin/home-ab.
 *
 * Cost to the visitor: a few passive listeners and one small sendBeacon when
 * the page is hidden or left (another only if something new happened since).
 * Nothing on the page waits for it.
 *
 * Records nothing on a `?version=` preview (not part of the test) or in an
 * automated browser.
 */
export function HomeVariantTracker({ variant }: { variant: HomeVariant }) {
  useEffect(() => {
    if (new URLSearchParams(location.search).has(HOME_PREVIEW_PARAM)) return;
    if (navigator.webdriver) return;

    const device = innerWidth >= DESKTOP_MIN_WIDTH ? "d" : "m";
    const id = visitorId();
    let viewSent = false;
    let engaged = false;
    let engagedSent = false;
    const marks = new Set<ScrollMark>();
    let marksPending: ScrollMark[] = [];
    let clicks: NonNullable<HomeAbReport["c"]> = [];
    let submits: string[] = [];

    const flush = () => {
      const report: HomeAbReport = { v: variant, d: device };
      if (id) report.id = id;
      if (!viewSent) report.n = 1;
      if (engaged && !engagedSent) report.e = 1;
      if (marksPending.length) report.s = marksPending;
      if (clicks.length) report.c = clicks;
      if (submits.length) report.f = submits;
      if (viewSent && !report.e && !report.s && !report.c && !report.f) return;
      const body = JSON.stringify(report);
      const sent = navigator.sendBeacon?.(HOME_AB_REPORT_PATH, body) ?? false;
      if (!sent) void fetch(HOME_AB_REPORT_PATH, { method: "POST", body, keepalive: true }).catch(() => {});
      viewSent = true;
      engagedSent = engaged;
      marksPending = [];
      clicks = [];
      submits = [];
    };

    const onScroll = () => {
      const doc = document.documentElement;
      const reached = ((scrollY + innerHeight) / Math.max(doc.scrollHeight, 1)) * 100;
      for (const mark of SCROLL_MARKS) {
        if (!marks.has(mark) && reached >= (mark === 100 ? 98 : mark)) {
          marks.add(mark);
          marksPending.push(mark);
          engaged = true;
        }
      }
    };

    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      engaged = true;
      const target = event.target;
      let section = -1;
      let x = 0;
      let y = 0;
      // A keyboard "click" has no position (detail 0): counted, not mapped.
      if (event.detail > 0) {
        const sections = homeSections(document);
        section = sections.findIndex((el) => el.contains(target));
        if (section >= 0) {
          const box = sections[section].getBoundingClientRect();
          const cell = (offset: number, size: number) => Math.min(HEAT_GRID - 1, Math.max(0, Math.floor((offset / Math.max(size, 1)) * HEAT_GRID)));
          x = cell(event.clientX - box.left, box.width);
          y = cell(event.clientY - box.top, box.height);
        }
      }
      clicks.push([regionOf(target), clickLabel(target), section, x, y]);
      if (clicks.length >= MAX_CLICKS_PER_REPORT) flush();
    };

    const onSubmit = (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || submits.length >= MAX_SUBMITS_PER_REPORT) return;
      engaged = true;
      const label = form.getAttribute("aria-label") || form.closest("section[id]")?.id || form.id || "form";
      submits.push(cleanLabel(label) ?? "form");
      // Submitting may leave the page at once: report now.
      flush();
    };

    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };

    onScroll();
    const listen = { capture: true, passive: true } as const;
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, listen);
    document.addEventListener("submit", onSubmit, listen);
    document.addEventListener("visibilitychange", onHide);
    addEventListener("pagehide", flush);
    return () => {
      removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, listen);
      document.removeEventListener("submit", onSubmit, listen);
      document.removeEventListener("visibilitychange", onHide);
      removeEventListener("pagehide", flush);
      // Leaving the homepage inside the app (a Link) hides nothing: report now.
      flush();
    };
  }, [variant]);

  return null;
}
