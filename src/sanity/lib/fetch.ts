import "server-only";

import { client } from "./client";

interface SanityFetchParams {
	query: string;
	params?: Record<string, unknown>;
	tags?: string[];
	perspective?: "published" | "previewDrafts" | "raw";
	stega?: boolean;
}

export async function sanityFetch<T>({
	query,
	params,
	tags,
	perspective = "published",
	stega = false,
}: SanityFetchParams): Promise<{ data: T }> {
	const configuredClient = client.withConfig({ perspective, stega });
	const data = await configuredClient.fetch<T>(query, params ?? {}, {
		cache: "no-store",
		next: {
			revalidate: 0,
			...(tags?.length ? { tags } : {}),
		},
	});
	return { data };
}
