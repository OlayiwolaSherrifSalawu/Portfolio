// Draws an illustrative UI for each project onto a canvas, used as the device screen.
// Swap any of these for a real screenshot by setting `screenshot` in lib/content.ts.

import type { Project } from "./content";

type Ctx = CanvasRenderingContext2D;

const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

export const SCREEN_SIZE: Record<Project["device"], [number, number]> = {
  phone: [600, 1280],
  laptop: [1270, 800],
  monitor: [1320, 800],
};

function rr(c: Ctx, x: number, y: number, w: number, h: number, r: number, fill?: string, stroke?: string) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  if (fill) {
    c.fillStyle = fill;
    c.fill();
  }
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = 2;
    c.stroke();
  }
}

function t(c: Ctx, s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "left") {
  c.font = font;
  c.fillStyle = color;
  c.textAlign = align;
  c.textBaseline = "alphabetic";
  c.fillText(s, x, y);
}

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function tpay(c: Ctx, W: number, H: number) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#0b2a66");
  g.addColorStop(1, "#061633");
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);

  t(c, "9:41", 48, 64, `600 26px ${SANS}`, "#fff");
  rr(c, 500, 44, 52, 24, 6, undefined, "rgba(255,255,255,.7)");
  rr(c, 504, 48, 30, 16, 3, "rgba(255,255,255,.85)");

  t(c, "T-Pay", 48, 152, `700 48px ${SANS}`, "#fff");
  rr(c, 384, 112, 170, 52, 26, "rgba(255,180,60,.16)");
  c.beginPath();
  c.arc(412, 138, 7, 0, Math.PI * 2);
  c.fillStyle = "#ffb43c";
  c.fill();
  t(c, "Offline", 430, 147, `600 24px ${SANS}`, "#ffb43c");

  rr(c, 40, 200, 520, 250, 28, "rgba(255,255,255,.08)", "rgba(255,255,255,.14)");
  t(c, "Locked for offline use", 72, 258, `500 24px ${SANS}`, "rgba(255,255,255,.7)");
  t(c, "$120.00", 72, 352, `700 84px ${SANS}`, "#fff");
  t(c, "Vault unlocks in 23h 14m", 72, 408, `400 22px ${SANS}`, "rgba(255,255,255,.6)");

  // QR code
  rr(c, 100, 490, 400, 400, 24, "#fff");
  const n = 25;
  const m = 14;
  const ox = 125;
  const oy = 515;
  const r = rng(7);
  c.fillStyle = "#0b1f4d";
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const inFinder = (i < 8 && j < 8) || (i > n - 9 && j < 8) || (i < 8 && j > n - 9);
      if (!inFinder && r() > 0.52) c.fillRect(ox + i * m, oy + j * m, m, m);
    }
  const finder = (fx: number, fy: number) => {
    c.fillStyle = "#0b1f4d";
    c.fillRect(ox + fx * m, oy + fy * m, 7 * m, 7 * m);
    c.fillStyle = "#fff";
    c.fillRect(ox + (fx + 1) * m, oy + (fy + 1) * m, 5 * m, 5 * m);
    c.fillStyle = "#0b1f4d";
    c.fillRect(ox + (fx + 2) * m, oy + (fy + 2) * m, 3 * m, 3 * m);
  };
  finder(0, 0);
  finder(n - 7, 0);
  finder(0, n - 7);

  t(c, "Show to receiver · no internet needed", W / 2, 942, `400 22px ${SANS}`, "rgba(255,255,255,.7)", "center");

  ["QR", "Bluetooth", "Voice"].forEach((label, i) => {
    const x = 40 + i * 180;
    rr(c, x, 980, 160, 110, 24, i === 0 ? "rgba(79,140,255,.28)" : "rgba(255,255,255,.08)", i === 0 ? "#4f8cff" : undefined);
    t(c, label, x + 80, 1046, `600 24px ${SANS}`, "#fff", "center");
  });

  rr(c, 40, 1140, 520, 84, 42, "#4f8cff");
  t(c, "Pay offline", W / 2, 1194, `700 30px ${SANS}`, "#fff", "center");
}

function flowpay(c: Ctx, W: number) {
  c.fillStyle = "#0c0c0c";
  c.fillRect(0, 0, W, 1280);
  t(c, "9:41", 48, 64, `600 26px ${SANS}`, "#fff");

  c.beginPath();
  c.arc(72, 138, 24, 0, Math.PI * 2);
  c.fillStyle = "#FDDA24";
  c.fill();
  t(c, "FlowPay", 110, 152, `700 42px ${SANS}`, "#fff");
  t(c, "Payday · Friday", 552, 150, `500 24px ${SANS}`, "#B7ACE8", "right");

  rr(c, 40, 200, 520, 220, 32, "#FDDA24");
  t(c, "Team payroll", 72, 258, `600 24px ${SANS}`, "rgba(12,12,12,.7)");
  t(c, "$18,400.00", 72, 346, `800 76px ${SANS}`, "#0c0c0c");
  t(c, "5 people · 5 countries · 1 transaction", 72, 392, `500 22px ${SANS}`, "rgba(12,12,12,.75)");

  const rows: [string, string, string, string][] = [
    ["Ada", "US", "$4,200", "#7cc4ff"],
    ["Liam", "CA", "$3,900", "#ff8f7c"],
    ["Sofía", "MX", "$3,100", "#9be38f"],
    ["Grace", "GB", "$3,800", "#B7ACE8"],
    ["Tunde", "NG", "$3,400", "#ffcf6b"],
  ];
  rows.forEach(([name, cc, amt, col], k) => {
    const y = 460 + k * 112;
    rr(c, 40, y, 520, 96, 22, "#171717");
    c.beginPath();
    c.arc(92, y + 48, 28, 0, Math.PI * 2);
    c.fillStyle = col;
    c.fill();
    t(c, name[0], 92, y + 58, `700 26px ${SANS}`, "#0c0c0c", "center");
    t(c, name, 140, y + 58, `600 28px ${SANS}`, "#fff");
    rr(c, 290, y + 30, 62, 36, 18, "rgba(255,255,255,.1)");
    t(c, cc, 321, y + 56, `600 20px ${MONO}`, "rgba(255,255,255,.8)", "center");
    t(c, `${amt} USDC`, 532, y + 58, `600 26px ${SANS}`, "#fff", "right");
  });

  rr(c, 40, 1080, 520, 100, 50, "#B7ACE8");
  t(c, "Sign & pay team", W / 2, 1142, `700 30px ${SANS}`, "#0c0c0c", "center");
  t(c, "Keys stay on this device", W / 2, 1232, `400 22px ${SANS}`, "rgba(255,255,255,.5)", "center");
}

function stockqc(c: Ctx, W: number, H: number) {
  c.fillStyle = "#f3efe6";
  c.fillRect(0, 0, W, H);
  c.fillStyle = "#1d2a24";
  c.fillRect(0, 0, 230, H);
  t(c, "StockQC", 32, 62, `700 30px ${SANS}`, "#f3efe6");
  ["Dashboard", "Scan", "Batches", "Expiry", "Audit", "Users"].forEach((item, k) => {
    const y = 120 + k * 56;
    if (item === "Scan") rr(c, 16, y, 198, 44, 10, "rgba(255,255,255,.12)");
    t(c, item, 36, y + 30, `500 20px ${SANS}`, item === "Scan" ? "#fff" : "rgba(243,239,230,.6)");
  });
  t(c, "Signed in · Manager", 32, H - 36, `400 16px ${SANS}`, "rgba(243,239,230,.5)");

  t(c, "Scan product", 270, 72, `700 36px ${SANS}`, "#1d2a24");
  t(c, "Point the camera at a barcode", 270, 106, `400 20px ${SANS}`, "#6b6b63");

  rr(c, 270, 140, 560, 380, 20, "#222");
  rr(c, 390, 255, 320, 150, 6, "#fff");
  const r = rng(3);
  let x = 410;
  c.fillStyle = "#111";
  while (x < 690) {
    const w = 2 + Math.floor(r() * 5);
    c.fillRect(x, 270, w, 110);
    x += w + 2 + Math.floor(r() * 4);
  }
  c.save();
  c.shadowColor = "#e5484d";
  c.shadowBlur = 18;
  c.fillStyle = "#e5484d";
  c.fillRect(310, 328, 480, 4);
  c.restore();
  c.strokeStyle = "#fff";
  c.lineWidth = 5;
  const br = (bx: number, by: number, dx: number, dy: number) => {
    c.beginPath();
    c.moveTo(bx, by + dy * 40);
    c.lineTo(bx, by);
    c.lineTo(bx + dx * 40, by);
    c.stroke();
  };
  br(330, 180, 1, 1);
  br(770, 180, -1, 1);
  br(330, 480, 1, -1);
  br(770, 480, -1, -1);

  rr(c, 270, 545, 560, 210, 16, "#fff", "#e2ddd0");
  t(c, "Rice, parboiled 50 kg", 300, 594, `700 26px ${SANS}`, "#1d2a24");
  t(c, "Batch A-12 · received 02 Oct", 300, 628, `400 20px ${SANS}`, "#6b6b63");
  rr(c, 300, 656, 330, 44, 22, "#e3f1e7");
  t(c, "FIFO: use this batch next", 322, 685, `600 19px ${SANS}`, "#2f7d4f");
  t(c, "38 in stock", 800, 594, `600 22px ${SANS}`, "#1d2a24", "right");

  t(c, "Alerts", 860, 168, `700 24px ${SANS}`, "#1d2a24");
  const alerts: [string, string, string, string][] = [
    ["Expiring soon", "3 batches within 7 days", "#fff4dc", "#a86b00"],
    ["Reorder", "Groundnut oil · 4 left", "#fde7e7", "#b42318"],
    ["Stock audit", "Due Friday", "#ebe7dc", "#55554d"],
  ];
  alerts.forEach(([h, s, bg, fg], k) => {
    const y = 190 + k * 124;
    rr(c, 860, y, 370, 108, 14, bg);
    t(c, h, 884, y + 44, `700 22px ${SANS}`, fg);
    t(c, s, 884, y + 78, `400 19px ${SANS}`, "#3d3d38");
  });
}

function kneescope(c: Ctx, W: number, H: number) {
  c.fillStyle = "#0f0e0d";
  c.fillRect(0, 0, W, H);
  t(c, "KneeScope", 24, 50, `700 28px ${SANS}`, "#f1e9dc");
  rr(c, 186, 24, 104, 32, 8, "rgba(214,140,60,.18)");
  t(c, "FIXTURE", 238, 46, `700 15px ${MONO}`, "#d68c3c", "center");
  ["Sagittal", "Coronal", "Axial"].forEach((p, i) => {
    const x = 560 + i * 120;
    if (i === 0) rr(c, x, 22, 110, 36, 8, "#2a2622");
    t(c, p, x + 55, 47, `500 18px ${SANS}`, i === 0 ? "#f1e9dc" : "#8b8378", "center");
  });

  rr(c, 24, 80, 860, 690, 12, "#050505");
  c.save();
  c.beginPath();
  c.roundRect(24, 80, 860, 690, 12);
  c.clip();
  const blob = (x: number, y: number, rx: number, ry: number, a: string, b: string) => {
    const g = c.createRadialGradient(x, y - ry * 0.3, 10, x, y, Math.max(rx, ry));
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    c.fill();
  };
  blob(454, 410, 330, 320, "#1e1d1c", "#0a0a0a");
  blob(454, 290, 170, 150, "#a5a29c", "#4a4845");
  blob(454, 575, 160, 120, "#9a978f", "#3f3d3a");
  c.fillStyle = "#c9c4b8";
  c.beginPath();
  c.ellipse(330, 438, 70, 16, 0.12, 0, Math.PI * 2);
  c.ellipse(580, 438, 70, 16, -0.12, 0, Math.PI * 2);
  c.fill();
  const r = rng(11);
  for (let i = 0; i < 1600; i++) {
    c.fillStyle = `rgba(255,255,255,${r() * 0.06})`;
    c.fillRect(24 + r() * 860, 80 + r() * 690, 2, 2);
  }
  c.globalCompositeOperation = "screen";
  const att = c.createRadialGradient(480, 440, 0, 480, 440, 150);
  att.addColorStop(0, "rgba(214,110,40,.7)");
  att.addColorStop(1, "rgba(214,110,40,0)");
  c.fillStyle = att;
  c.fillRect(24, 80, 860, 690);
  c.restore();

  t(c, "Slice 14 / 32", 64, 718, `500 18px ${MONO}`, "#8b8378");
  rr(c, 64, 734, 780, 6, 3, "#2a2622");
  rr(c, 64, 734, 780 * (14 / 32), 6, 3, "#d68c3c");
  c.beginPath();
  c.arc(64 + 780 * (14 / 32), 737, 10, 0, Math.PI * 2);
  c.fillStyle = "#f1e9dc";
  c.fill();

  rr(c, 908, 80, 388, 690, 12, "#171513");
  t(c, "Findings", 932, 124, `700 24px ${SANS}`, "#f1e9dc");
  const findings: [string, number][] = [
    ["ACL", 0.71],
    ["MCL", 0.18],
    ["Medial meniscus", 0.42],
    ["Lateral meniscus", 0.09],
  ];
  findings.forEach(([label, v], k) => {
    const y = 170 + k * 78;
    t(c, label, 932, y, `500 19px ${SANS}`, "#d9d0c2");
    t(c, v.toFixed(2), 1272, y, `600 19px ${MONO}`, "#f1e9dc", "right");
    rr(c, 932, y + 16, 340, 10, 5, "#2a2622");
    rr(c, 932, y + 16, 340 * v, 10, 5, "#d68c3c");
  });
  t(c, "Influential slices", 932, 520, `700 20px ${SANS}`, "#f1e9dc");
  const bars = [0.2, 0.3, 0.5, 0.9, 1, 0.8, 0.55, 0.4, 0.25, 0.2, 0.15, 0.1];
  bars.forEach((b, i) => {
    rr(c, 932 + i * 28, 660 - b * 110, 20, b * 110, 4, i === 4 ? "#d68c3c" : "#4a433c");
  });
  t(c, "Research prototype · not for diagnosis", 932, 740, `400 16px ${SANS}`, "#8b8378");
}

const HELLO = String.raw` _              _   _
| |            | | | |
| |__     ___  | | | |   ___
|  _ \   / _ \ | | | |  / _ \
| | | | |  __/ | | | | | (_) |
|_| |_|  \___| |_| |_|  \___/`;

function typascii(c: Ctx, W: number, H: number) {
  c.fillStyle = "#0d0f0d";
  c.fillRect(0, 0, W, H);
  t(c, "TypAscii", 60, 70, `700 32px ${SANS}`, "#e8e6df");
  c.beginPath();
  c.arc(W - 80, 60, 18, 0, Math.PI * 2);
  c.strokeStyle = "#e8e6df";
  c.lineWidth = 3;
  c.stroke();
  c.beginPath();
  c.arc(W - 80, 60, 18, -Math.PI / 2, Math.PI / 2);
  c.fillStyle = "#e8e6df";
  c.fill();

  rr(c, 60, 110, 1150, 80, 14, "#171a17", "#2b302b");
  t(c, "hello", 90, 162, `500 30px ${MONO}`, "#e8e6df");
  c.fillStyle = "#c7f36b";
  c.fillRect(186, 134, 3, 34);

  ["Standard", "Shadow", "Thinker-Toy"].forEach((f, i) => {
    const x = 60 + i * 180;
    rr(c, x, 216, 166, 48, 24, i === 0 ? "#c7f36b" : "#171a17", i === 0 ? undefined : "#2b302b");
    t(c, f, x + 83, 248, `600 19px ${SANS}`, i === 0 ? "#0d0f0d" : "#a7a69f", "center");
  });

  rr(c, 60, 290, 1150, 400, 16, "#080908", "#1d211d");
  HELLO.split("\n").forEach((line, i) => {
    t(c, line, 110, 370 + i * 44, `500 34px ${MONO}`, "#c7f36b");
  });

  rr(c, 830, 716, 150, 52, 12, "#171a17", "#2b302b");
  t(c, "Copy", 905, 750, `600 20px ${SANS}`, "#e8e6df", "center");
  rr(c, 996, 716, 214, 52, 12, "#e8e6df");
  t(c, "Download .txt", 1103, 750, `600 20px ${SANS}`, "#0d0f0d", "center");
}

export function drawScreen(id: Project["id"], canvas: HTMLCanvasElement, kind: Project["device"]) {
  const [W, H] = SCREEN_SIZE[kind];
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d");
  if (!c) return;
  if (id === "tpay") tpay(c, W, H);
  else if (id === "flowpay") flowpay(c, W);
  else if (id === "stockqc") stockqc(c, W, H);
  else if (id === "kneescope") kneescope(c, W, H);
  else typascii(c, W, H);
}
