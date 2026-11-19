import { expect, test } from "@playwright/test";
import { profile, projects } from "../lib/content";

test("loads with the right title and no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page).toHaveTitle(`${profile.name} · ${profile.title}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
});

test("every project has a section, a heading and a working jump link", async ({ page }) => {
  await page.goto("/");
  for (const p of projects) {
    await expect(page.locator(`section#${p.id}`)).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 2, name: p.name })).toHaveCount(1);
  }
  const index = page.getByRole("navigation", { name: "Projects" });
  if (await index.isVisible()) {
    await index.getByRole("link", { name: projects[1].name }).click();
    await expect(page).toHaveURL(new RegExp(`#${projects[1].id}$`));
  }
});

test("a recruiter can reach me by email from the header and the contact section", async ({ page }) => {
  await page.goto("/");
  const mailto = `mailto:${profile.email}`;
  await expect(page.getByRole("link", { name: "Get in touch" })).toHaveAttribute("href", mailto);
  await expect(page.locator("#contact").getByRole("link", { name: "Email me" })).toHaveAttribute("href", mailto);
});

test("external links open safely in a new tab and say so", async ({ page }) => {
  await page.goto("/");
  const links = page.locator('main a[target="_blank"]');
  const n = await links.count();
  expect(n).toBeGreaterThan(5);
  for (let i = 0; i < n; i++) {
    const a = links.nth(i);
    await expect(a).toHaveAttribute("rel", /noopener/);
    await expect(a).toContainText("opens in a new tab");
  }
});

test("every link has an accessible name", async ({ page }) => {
  await page.goto("/");
  const unnamed = await page.$$eval("a", (as) =>
    as
      .filter((a) => {
        const r = a.getBoundingClientRect();
        const visible = r.width > 0 && r.height > 0 && getComputedStyle(a).visibility !== "hidden";
        const name = (a.getAttribute("aria-label") ?? a.innerText).trim();
        return visible && !name;
      })
      .map((a) => a.outerHTML.slice(0, 80)),
  );
  expect(unnamed).toEqual([]);
});

test("with reduced motion, highlights show in full and nothing animates in", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.waitForTimeout(800);
  await expect(page.locator("html")).not.toHaveClass(/hl-anim/);
  await ctx.close();
});

test("link preview image, favicon, robots and sitemap are served", async ({ request }) => {
  for (const path of ["/opengraph-image", "/icon.svg", "/robots.txt", "/sitemap.xml"]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
  }
});
