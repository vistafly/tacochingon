import type { MetadataRoute } from "next";

const BASE_URL = "https://eltacochingonfresno.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["en", "es"];

  const routes = ["", "/menu", "/checkout"];

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "/menu" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : route === "/menu" ? 0.9 : 0.7,
    }))
  );
}
