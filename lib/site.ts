/**
 * The site's public URL, used for absolute links in metadata, the sitemap and link previews.
 * Set NEXT_PUBLIC_SITE_URL once you have a domain; on Vercel the production URL is picked up automatically.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
