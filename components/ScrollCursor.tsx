"use client";

import { useEffect, useRef } from "react";

const IDLE_MS = 180; // how long after the last scroll event we turn back into an arrow
const MORPH_MS = 260; // matches the CSS transition

/**
 * While the page scrolls, the cursor morphs from a normal arrow into a red sniper-scope reticle,
 * then morphs back when scrolling stops. Only for mouse/trackpad users; touch is untouched.
 */
export default function ScrollCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let x = -100;
    let y = -100;
    let known = false;
    let idleTimer = 0;
    let hideTimer = 0;
    let active = false;
    let wantTarget = false;

    const place = () => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const track = (e: PointerEvent | WheelEvent) => {
      x = e.clientX;
      y = e.clientY;
      known = true;
      if (active) place();
    };

    const start = () => {
      if (!known) return;
      window.clearTimeout(hideTimer);
      wantTarget = true;
      if (!active) {
        active = true;
        place();
        root.classList.add("scope-on");
        el.classList.add("is-visible");
        // Next frame, so the arrow is painted first and the morph is visible.
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (wantTarget) el.classList.add("is-target");
          }),
        );
      } else {
        el.classList.add("is-target");
      }
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(stop, IDLE_MS);
    };
    const stop = () => {
      wantTarget = false;
      el.classList.remove("is-target");
      hideTimer = window.setTimeout(
        () => {
          active = false;
          el.classList.remove("is-visible", "is-target");
          root.classList.remove("scope-on");
        },
        reduced.matches ? 0 : MORPH_MS,
      );
    };

    window.addEventListener("pointermove", track, { passive: true });
    window.addEventListener("wheel", track, { passive: true });
    window.addEventListener("scroll", start, { passive: true });
    return () => {
      window.clearTimeout(idleTimer);
      window.clearTimeout(hideTimer);
      root.classList.remove("scope-on");
      window.removeEventListener("pointermove", track);
      window.removeEventListener("wheel", track);
      window.removeEventListener("scroll", start);
    };
  }, []);

  return (
    <div ref={ref} className="scope" aria-hidden>
      <svg viewBox="-32 -32 64 64" width="64" height="64" focusable="false">
        <g className="scope-arrow">
          <path d="M0 0V18L4.6 13.6L7.6 20.6L10.4 19.4L7.4 12.6H13.4Z" />
        </g>
        <g className="scope-reticle">
          <circle className="scope-outer" r="19" />
          <circle r="12" />
          <path d="M0 -24V-7M0 7V24M-24 0H-7M7 0H24" />
          <circle className="scope-dot" r="1.8" />
        </g>
      </svg>
    </div>
  );
}
