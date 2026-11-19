import { ImageResponse } from "next/og";
import { profile, projects } from "@/lib/content";

export const alt = `${profile.name}, ${profile.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Link-preview card for LinkedIn, X, Slack and messaging apps, in the site's paper style. */
export default function OpengraphImage() {
  const grid = "rgba(36,72,200,0.09)";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          background: "#f5f1e8",
          backgroundImage: `linear-gradient(${grid} 1px, transparent 1px), linear-gradient(90deg, ${grid} 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          borderLeft: "6px solid rgba(196,48,26,0.55)",
          color: "#16203a",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 3, color: "#5a5e74", fontFamily: "monospace" }}>
          {profile.title.toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 104, lineHeight: 1 }}>
            {profile.name}
            <span style={{ color: "#c4301a" }}>.</span>
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 44 }}>
            Full-stack software, built for&nbsp;
            <span style={{ background: "#ffe24a", padding: "0 8px" }}>real conditions</span>.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 24, fontFamily: "monospace", color: "#2448c8" }}>
          {projects.map((p) => (
            <span key={p.id} style={{ display: "flex", padding: "6px 16px", borderRadius: 999, background: "#ece6d8" }}>
              {p.name}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
