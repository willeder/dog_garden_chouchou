import type { MetadataRoute } from "next";
import { getPuppies } from "./_api/puppies/get";
import { siteUrl as baseUrl } from "./_config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/about",
    "/puppies",
    "/adoption",
    "/voice",
    "/visit",
    "/faq",
    "/contact",
    "/warranty",
    "/policy",
  ];

  const puppies = await getPuppies();

  return [
    ...staticPaths.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...puppies.map((puppy) => ({
      url: `${baseUrl}/puppies/${puppy.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
