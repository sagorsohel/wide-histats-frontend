/** Canonical public origin used for metadata, sitemap, robots and structured data. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://analycos.com"
).replace(/\/$/, "");

export const SITE_NAME = "Analycos";

export const SITE_TITLE = "Analycos — Free Web Stats, Hit Counter & Visitor Tracking";

export const SITE_DESCRIPTION =
  "Monitor website visitors, pageviews, and traffic sources with Analycos. Free web statistics, hit counters, and visitor tracking tools to understand your audience.";
