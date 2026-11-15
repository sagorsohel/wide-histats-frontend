import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Only indexable, public marketing/legal pages. Dashboard routes are private (noindex).
const LAST_UPDATED = new Date("2026-11-15");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: LAST_UPDATED, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/register`, lastModified: LAST_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/documentation`, lastModified: LAST_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/privacy`, lastModified: LAST_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: LAST_UPDATED, changeFrequency: "yearly", priority: 0.3 },
  ];
}
