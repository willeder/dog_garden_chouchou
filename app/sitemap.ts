import type { MetadataRoute } from "next";
import { getPuppies } from "./_api/puppies/get";
import { getRehomingDogs } from "./_api/rehoming/get";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
  const rehomingDogs = await getRehomingDogs();

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
    ...rehomingDogs.map((dog) => ({
      url: `${baseUrl}/adoption/${dog.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
