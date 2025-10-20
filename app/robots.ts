import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sensorysearch.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin-login", "/api", "/organizer-account", "/billing"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
