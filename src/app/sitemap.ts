import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { STATIC_ROUTES } from "@/lib/constants";
import { client } from "@/sanity/lib/client";
import { postSlugsQuery } from "@/sanity/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
		url: absoluteUrl(route),
		lastModified: new Date(),
		changeFrequency: route === "/" ? "daily" : "weekly",
		priority: route === "/" ? 1 : 0.8,
	}));

	try {
		const slugs = await client.fetch<string[]>(postSlugsQuery, {}, { cache: "no-store" });
		const blogEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
			url: absoluteUrl(`/blog/${slug}`),
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.7,
		}));

		return [...staticEntries, ...blogEntries];
	} catch {
		return staticEntries;
	}
}
