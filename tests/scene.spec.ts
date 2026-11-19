import { expect, test } from "@playwright/test";

test("the 3D scene is not loaded up front, and appears after the first interaction", async ({ page, isMobile }) => {
  await page.goto("/");
  await page.waitForTimeout(1500);
  await expect(page.locator(".r3f canvas")).toHaveCount(0);
  if (isMobile) await page.mouse.wheel(0, 200);
  else await page.mouse.move(400, 400);
  await expect(page.locator(".r3f canvas")).toHaveCount(1, { timeout: 15_000 });
});
