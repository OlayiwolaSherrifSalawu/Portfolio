"use client";

import { useEffect } from "react";

/**
 * Draws each `.hl` highlighter stroke in from the left when it scrolls into view,
 * and resets it once it has fully left, so it draws again next time.
 * Without JS, or with reduced motion, highlights simply show in full.
 */
export default function HighlightReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const marks = Array.from(document.querySelectorAll<HTMLElement>("main .hl"));
    if (!marks.length) return;
    root.classList.add("hl-anim");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.intersectionRatio >= 0.6) el.classList.add("is-drawn");
          else if (!e.isIntersecting) el.classList.remove("is-drawn");
        }
      },
      { threshold: [0, 0.6] },
    );
    // Wait a beat so the hero highlight visibly draws in after the page appears.
    const t = window.setTimeout(() => marks.forEach((m) => io.observe(m)), 350);
    return () => {
      window.clearTimeout(t);
      io.disconnect();
      root.classList.remove("hl-anim");
    };
  }, []);
  return null;
}
