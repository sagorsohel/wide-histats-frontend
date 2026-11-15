import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/settings",
        "/profile",
        "/control-panel",
        "/websites",
        "/login",
        "/summary",
        "/realtime",
        "/traffic-stats",
        "/sources",
        "/pages",
        "/devices",
        "/geography",
        "/summery",
        "/traffic",
        "/livearray",
        "/counter/",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
