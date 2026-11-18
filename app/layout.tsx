import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, STIX_Two_Text } from "next/font/google";
import { profile } from "@/lib/content";
import "./globals.css";

const serif = STIX_Two_Text({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: `${profile.name} · ${profile.title}`,
  description: profile.intro,
};

export const viewport: Viewport = { themeColor: "#0a0a0a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
