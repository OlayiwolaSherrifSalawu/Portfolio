// All the words on the site live here. Edit this file to change copy, links or projects.

export const profile = {
  name: "Olayiwola Salawu",
  title: "Junior Software Engineer",
  intro:
    "I build across the stack: Go backends, TypeScript and React Native apps, Flutter mobile, and smart contracts on Stellar.",
  github: "https://github.com/OlayiwolaSherrifSalawu",
  // Leave empty to hide. Add them when you're ready.
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
  role: string;
  stack: string[];
  status?: string;
  links: { label: string; href: string }[];
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
    tagline: "PayPal payments that keep working when the network doesn't.",
    description:
      "Lock money while you're online, then pay or get paid phone to phone with no internet at all, by QR code, Bluetooth or voice. Built for places where power cuts and patchy networks are routine.",
    role: "Frontend and backend",
    stack: ["TypeScript", "React Native", "Expo", "Kotlin", "PostgreSQL"],
    status: "Prototype · PayPal sandbox",
    links: [
      { label: "Website", href: "https://t-paypublic-website.vercel.app" },
      { label: "Code", href: gh("T-Pay_Public") },
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
    role: "Frontend and backend",
    stack: ["Flutter", "Dart", "TypeScript", "Rust · Soroban", "PostgreSQL"],
    status: "Stellar testnet",
    links: [
      { label: "Website", href: "https://flowpay-silk.vercel.app" },
      { label: "Code", href: gh("flowpay") },
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
    role: "Sole developer",
    stack: ["Go", "chi", "templ", "HTMX", "PostgreSQL", "sqlc", "Docker"],
    links: [{ label: "Code", href: gh("Barcode-scanner") }],
    device: "laptop",
  },
  {
    id: "kneescope",
    name: "KneeScope",
    kicker: "Research tool",
    tagline: "A review workspace for knee MRI research.",
    description:
      "A keyboard-driven, multi-plane MRI viewer with model predictions for ACL, MCL and meniscus findings, attention overlays, influential slices and a separate label-reveal step.",
    role: "Sole developer",
    stack: ["TypeScript", "Python", "Jupyter"],
    status: "Prototype · placeholder data, not for diagnosis",
    links: [{ label: "Code", href: gh("KneeScope") }],
    device: "monitor",
  },
  {
    id: "typascii",
    name: "TypAscii",
    kicker: "Go · HTMX",
    tagline: "Type anything, get ASCII art as you type.",
    description:
      "A small, fast web app that turns text into ASCII art with live preview, several banner fonts, one-click copy and .txt export. No page reloads.",
    role: "Sole developer",
    stack: ["Go", "HTMX", "CSS"],
    links: [
      { label: "Live demo", href: "https://ascii-art-web-4suu.onrender.com" },
      { label: "Code", href: gh("ascii-art-web") },
    ],
    device: "laptop",
  },
];

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
