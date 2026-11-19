// All the words on the site live here. Edit this file to change copy, links or projects.

export const profile = {
  name: "Olayiwola Salawu",
  shortName: "O. Salawu",
  title: "Junior Software Engineer",
  headline: { before: "Full-stack software, built for ", highlight: "real conditions", after: "." },
  intro:
    "I’m Olayiwola, a junior software engineer. I build Go backends, TypeScript and React Native apps, Flutter mobile and Soroban smart contracts — from offline PayPal payments to cross-border payroll.",
  github: "https://github.com/OlayiwolaSherrifSalawu",
  // Leave empty to hide. Add them when you’re ready.
  email: "",
  linkedin: "",
  x: "",
  cv: "",
};

export type DeviceKind = "phone" | "laptop" | "monitor";

export type Project = {
  id: "tpay" | "flowpay" | "stockqc" | "kneescope" | "typascii";
  name: string;
  kicker: string;
  tagline: string;
  description: string;
  /** Short handwritten margin note. */
  note: string;
  role: string;
  stack: string[];
  status?: string;
  links: { kind: "site" | "code"; href: string }[];
  device: DeviceKind;
  /** Optional real screenshot in /public, e.g. "/screens/tpay.png". Replaces the drawn screen. */
  screenshot?: string;
};

const gh = (repo: string) => `${profile.github}/${repo}`;

export const projects: Project[] = [
  {
    id: "tpay",
    name: "T-Pay",
    kicker: "PayPal Hackathon",
    tagline: "PayPal payments that keep working when the network doesn’t.",
    description:
      "Lock money while you’re online, then pay or get paid phone to phone with no internet at all, by QR code, Bluetooth or voice. Built for places where power cuts and patchy networks are routine.",
    note: "works with zero bars of signal",
    role: "Frontend and backend",
    stack: ["TypeScript", "React Native", "Expo", "Kotlin", "PostgreSQL"],
    status: "Prototype · PayPal sandbox",
    links: [
      { kind: "site", href: "https://t-paypublic-website.vercel.app" },
      { kind: "code", href: gh("T-Pay_Public") },
    ],
    device: "phone",
  },
  {
    id: "flowpay",
    name: "FlowPay",
    kicker: "Stellar",
    tagline: "Cross-border payroll, settled in seconds.",
    description:
      "An employer pays a team across the US, Canada, Mexico, the UK and Nigeria in a single atomic Stellar transaction, signed on their own phone. FlowPay never holds a key.",
    note: "five countries, one transaction",
    role: "Frontend and backend",
    stack: ["Flutter", "Dart", "TypeScript", "Rust · Soroban", "PostgreSQL"],
    status: "Stellar testnet",
    links: [
      { kind: "site", href: "https://flowpay-silk.vercel.app" },
      { kind: "code", href: gh("flowpay") },
    ],
    device: "phone",
  },
  {
    id: "stockqc",
    name: "Barcode Inventory QC",
    kicker: "Go · Full stack",
    tagline: "Barcode-driven quality control for small business stock.",
    description:
      "Camera barcode scanning in the browser, first-in-first-out batch consumption, expiry monitoring, reorder alerts and physical stock reconciliation, with separate admin, manager and cashier roles.",
    note: "oldest stock leaves first",
    role: "Sole developer",
    stack: ["Go", "chi", "templ", "HTMX", "PostgreSQL", "sqlc", "Docker"],
    links: [{ kind: "code", href: gh("Barcode-scanner") }],
    device: "laptop",
  },
  {
    id: "kneescope",
    name: "KneeScope",
    kicker: "Research tool",
    tagline: "A review workspace for knee MRI research.",
    description:
      "A keyboard-driven, multi-plane MRI viewer with model predictions for ACL, MCL and meniscus findings, attention overlays, influential slices and a separate label-reveal step.",
    note: "for research, not diagnosis",
    role: "Sole developer",
    stack: ["TypeScript", "Python", "Jupyter"],
    status: "Prototype · placeholder data",
    links: [{ kind: "code", href: gh("KneeScope") }],
    device: "monitor",
  },
  {
    id: "typascii",
    name: "TypAscii",
    kicker: "Go · HTMX",
    tagline: "Type anything, get ASCII art as you type.",
    description:
      "A small, fast web app that turns text into ASCII art with live preview, several banner fonts, one-click copy and .txt export. No page reloads.",
    note: "no page reloads, promise",
    role: "Sole developer",
    stack: ["Go", "HTMX", "CSS"],
    links: [
      { kind: "site", href: "https://ascii-art-web-4suu.onrender.com" },
      { kind: "code", href: gh("ascii-art-web") },
    ],
    device: "laptop",
  },
];

/** Notes only visible through the magnifier. Positions are % of the section. */
export const secrets: Record<string, { text: string; top: string; left: string }> = {
  top: { text: "psst. you found the first hidden note.", top: "84%", left: "52%" },
  tpay: { text: "this QR code is decorative. please don’t scan it.", top: "82%", left: "44%" },
  flowpay: { text: "five people, five countries, zero spreadsheets.", top: "84%", left: "34%" },
  stockqc: { text: "FIFO: first in, first out, like the queue at the bank.", top: "84%", left: "44%" },
  kneescope: { text: "those knees are drawn with ellipses. no real scans here.", top: "86%", left: "34%" },
  typascii: { text: "try typing your own name in the live demo.", top: "84%", left: "44%" },
  stellar: { text: "seven repos and counting.", top: "82%", left: "62%" },
  about: { text: "fun fact: each grid square is 28px.", top: "18%", left: "62%" },
  contact: { text: "you read all the hidden notes. now let’s talk.", top: "74%", left: "58%" },
};

export const stellarWork = [
  { name: "FlowFi", note: "DeFi payment streaming and recurring subscriptions", href: gh("flowfi") },
  { name: "TrusTrove", note: "Invoice financing for small businesses", href: gh("TrusTrove-contract") },
  { name: "HarvestLock", note: "Soroban escrow for tranched forward commitments", href: gh("HarvestLock-Contracts") },
  { name: "Fortexa", note: "Payment firewall for autonomous agent actions", href: gh("Fortexa") },
  { name: "Wayfare", note: "Stablecoin corridor pricing and route scoring", href: gh("wayfare") },
  { name: "Assay", note: "On-chain safety gate for Stellar assets", href: gh("Assay") },
  { name: "Vellar", note: "x402 payment facilitator and SDK", href: gh("vellar-sdk") },
];

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Go", "TypeScript", "Python", "Dart", "Rust (learning)"] },
  { group: "Frontend", items: ["React", "React Native · Expo", "Flutter", "HTMX", "templ"] },
  { group: "Backend", items: ["Go net/http · chi", "Node.js", "PostgreSQL", "sqlc", "Docker"] },
  { group: "Web3", items: ["Stellar", "Soroban smart contracts"] },
];
