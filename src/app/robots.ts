import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/*/order/", "/*/checkout/success"],
    },
    sitemap: "https://eltacochingonfresno.com/sitemap.xml",
  };
}
