import type { MetadataRoute } from "next";
import { siteUrl, absoluteUrl } from "@/lib/site";
import { client } from "@/sanity/lib/client";
import { postSlugsQuery } from "@/sanity/lib/queries";

const staticRoutes = ["/", "/about", "/blog", "/contact", "/resume"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
		url: absoluteUrl(route),
		lastModified: new Date(),
		changeFrequency: route === "/" ? "daily" : "weekly",
		priority: route === "/" ? 1 : 0.8,
	}));

	try {
		const slugs = await client.fetch<string[]>(postSlugsQuery, {}, { cache: "no-store" });
		const blogEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
			url: `${siteUrl}/blog/${slug}`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.7,
		}));

		return [...staticEntries, ...blogEntries];
	} catch {
		return staticEntries;
	}
}
