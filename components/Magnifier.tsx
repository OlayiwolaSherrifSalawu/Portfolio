"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const Z = 2; // zoom
const FRICTION = 0.93; // per frame, after a flick
const KEY_STEP = 24;

/**
 * A big magnifying glass that sits on the page. Drag it (mouse or touch), flick it and it glides,
 * or focus it and use the arrow keys. It shows a 2× copy of the page underneath: the liquid paper
 * and 3D canvases are copied pixel for pixel, the HTML is cloned. `.secret` notes only show inside it.
 */
export default function Magnifier() {
  const [mounted, setMounted] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const pageLayer = useRef<HTMLDivElement>(null);
  const fixedLayer = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const el = wrap.current;
    if (!el) return;
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Lens radius scales down on small screens.
    let R = 170;
    const sizeLens = () => {
      R = Math.round(Math.min(170, Math.max(88, window.innerWidth * 0.24)));
      el.style.setProperty("--r", `${R}px`);
    };
    sizeLens();

    // Physics state: where the lens is drawn (pos), where it wants to be (goal), and flick velocity.
    // Start on empty paper, fully on screen with room for the handle.
    const narrow = window.innerWidth < 768;
    const pos = narrow
      ? { x: window.innerWidth - R - 28, y: window.innerHeight - R * 1.6 - 24 }
      : { x: Math.max(R + 24, window.innerWidth - 2 * R - 120), y: window.innerHeight - R - 64 };
    const goal = { ...pos };
    const vel = { x: 0, y: 0 };
    let tilt = 0;
    let dragging = false;
    const grab = { dx: 0, dy: 0, lastX: 0, lastY: 0, lastT: 0 };

    const clamp = () => {
      const m = R * 0.4; // allow it to hang a little off the edge
      goal.x = Math.min(Math.max(goal.x, m), window.innerWidth - m);
      goal.y = Math.min(Math.max(goal.y, m), window.innerHeight - m);
    };

    // Clone the page into the lens.
    const strip = (n: Element) => {
      n.removeAttribute("id");
      n.querySelectorAll("[id]").forEach((e) => e.removeAttribute("id"));
      (n as HTMLElement).inert = true;
      return n;
    };
    const build = () => {
      const w = `${root.clientWidth}px`;
      const main = document.querySelector("main");
      const nav = document.querySelector(".nav");
      if (pageLayer.current && main) {
        pageLayer.current.replaceChildren(strip(main.cloneNode(true) as Element));
        pageLayer.current.style.width = w;
      }
      if (fixedLayer.current && nav) {
        fixedLayer.current.replaceChildren(strip(nav.cloneNode(true) as Element));
        fixedLayer.current.style.width = w;
        fixedLayer.current.style.height = `${window.innerHeight}px`;
      }
    };
    build();

    const onResize = () => {
      sizeLens();
      clamp();
      build();
    };

    // Let the liquid paper ripple wherever the lens travels.
    const poke = (x: number, y: number) => window.dispatchEvent(new CustomEvent("liquid:poke", { detail: { x, y } }));

    const onDown = (e: PointerEvent) => {
      dragging = true;
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-dragging");
      grab.dx = e.clientX - goal.x;
      grab.dy = e.clientY - goal.y;
      grab.lastX = e.clientX;
      grab.lastY = e.clientY;
      grab.lastT = performance.now();
      vel.x = vel.y = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dt = Math.max(now - grab.lastT, 1);
      // Velocity in px per frame (~16ms), smoothed.
      vel.x = vel.x * 0.6 + ((e.clientX - grab.lastX) / dt) * 16 * 0.4;
      vel.y = vel.y * 0.6 + ((e.clientY - grab.lastY) / dt) * 16 * 0.4;
      grab.lastX = e.clientX;
      grab.lastY = e.clientY;
      grab.lastT = now;
      goal.x = e.clientX - grab.dx;
      goal.y = e.clientY - grab.dy;
      clamp();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-dragging");
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (reduced.matches) vel.x = vel.y = 0;
    };
    const onKey = (e: KeyboardEvent) => {
      const step = e.shiftKey ? KEY_STEP * 4 : KEY_STEP;
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const m = moves[e.key];
      if (!m) return;
      e.preventDefault();
      goal.x += m[0];
      goal.y += m[1];
      vel.x = vel.y = 0;
      clamp();
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);

    let raf = 0;
    let lastPoke = { x: pos.x, y: pos.y };
    const tick = () => {
      raf = requestAnimationFrame(tick);

      // Glide after a flick, bouncing softly off the screen edges.
      if (!dragging && (Math.abs(vel.x) > 0.05 || Math.abs(vel.y) > 0.05)) {
        goal.x += vel.x;
        goal.y += vel.y;
        vel.x *= FRICTION;
        vel.y *= FRICTION;
        const before = { ...goal };
        clamp();
        if (before.x !== goal.x) vel.x *= -0.4;
        if (before.y !== goal.y) vel.y *= -0.4;
      }

      // The drawn position trails the goal a little, which gives the glass some weight.
      const follow = reduced.matches ? 1 : 0.35;
      pos.x += (goal.x - pos.x) * follow;
      pos.y += (goal.y - pos.y) * follow;
      const targetTilt = reduced.matches ? 0 : Math.max(-12, Math.min(12, (goal.x - pos.x) * 0.35 + vel.x * 0.6));
      tilt += (targetTilt - tilt) * 0.2;

      if (Math.hypot(pos.x - lastPoke.x, pos.y - lastPoke.y) > 6) {
        poke(pos.x, pos.y);
        lastPoke = { x: pos.x, y: pos.y };
      }

      const { x, y } = pos;
      el.style.transform = `translate3d(${x - R}px, ${y - R}px, 0) rotate(${tilt.toFixed(2)}deg)`;
      const tx = R - Z * x;
      const ty = R - Z * y;
      if (fixedLayer.current) fixedLayer.current.style.transform = `translate(${tx}px, ${ty}px) scale(${Z})`;
      if (pageLayer.current)
        pageLayer.current.style.transform = `translate(${tx}px, ${ty - Z * window.scrollY}px) scale(${Z})`;
      if (grid.current) grid.current.style.backgroundPosition = `${tx}px ${ty}px`;

      const c = cvs.current;
      const ctx = c?.getContext("2d");
      if (!c || !ctx) return;
      const d = Math.min(window.devicePixelRatio || 1, 2);
      const size = Math.round(2 * R * d);
      if (c.width !== size) c.width = c.height = size;
      ctx.clearRect(0, 0, size, size);
      const half = R / Z;
      for (const src of [
        document.querySelector<HTMLCanvasElement>("canvas.liquid"),
        document.querySelector<HTMLCanvasElement>(".r3f canvas"),
      ]) {
        if (!src || !src.width || src.style.display === "none") continue;
        const s = src.width / window.innerWidth;
        try {
          ctx.drawImage(src, (x - half) * s, (y - half) * s, 2 * half * s, 2 * half * s, 0, 0, size, size);
        } catch {
          /* source not ready yet */
        }
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [mounted]);

  if (!mounted) return null;
  return createPortal(
    <div
      ref={wrap}
      className="lens-wrap"
      tabIndex={0}
      role="group"
      aria-roledescription="magnifying glass"
      aria-label="Magnifying glass. Drag it, or use the arrow keys to move it."
    >
      <div className="lens" aria-hidden>
        <div ref={grid} className="lens-grid" />
        <canvas ref={cvs} className="lens-canvas" />
        <div ref={pageLayer} className="lens-layer" />
        <div ref={fixedLayer} className="lens-layer" />
        <div className="lens-glass" />
      </div>
      <div className="lens-handle" aria-hidden />
    </div>,
    document.body,
  );
}
