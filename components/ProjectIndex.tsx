"use client";

import { useEffect, useState } from "react";
import { projects } from "@/lib/content";

const pad = (n: number) => String(n).padStart(2, "0");

/** 01–05 jump links in the header. The current project is marked with aria-current, a fill and an underline. */
export default function ProjectIndex() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = projects.map((p) => document.getElementById(p.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const clear = () => {
      const first = els[0];
      const last = els[els.length - 1];
      if (!first || !last) return;
      const y = window.innerHeight / 2;
      if (first.getBoundingClientRect().top > y || last.getBoundingClientRect().bottom < y) setActive(null);
    };
    window.addEventListener("scroll", clear, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", clear);
    };
  }, []);

  return (
    <nav aria-label="Projects" className="index">
      <ol>
        {projects.map((p, i) => (
          <li key={p.id}>
            <a href={`#${p.id}`} aria-current={active === p.id ? "true" : undefined}>
              <span aria-hidden>{pad(i + 1)}</span>
              <span className="sr-only">{p.name}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
