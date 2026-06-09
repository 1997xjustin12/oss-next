"use client";

import { useEffect, useRef, useState } from "react";

export default function LoaderScreen() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 1000;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min((elapsed / duration) * 90, 90);
      setProgress(pct);

      if (pct < 90) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center gap-3 bg-theme-dark w-full max-w-full font-['Barlow_Condensed',sans-serif]">
      <div className="text-[22px] font-black text-white uppercase tracking-[0.02em]">
        ONSITE <span className="text-theme-primary">STORAGE</span>
      </div>

      <div className="w-35 h-0.75 bg-white/10 rounded-sm overflow-hidden">
        <div
          className="h-full bg-theme-primary rounded-sm transition-[width] duration-50 linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
