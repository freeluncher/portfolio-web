import "server-only";

import { client } from "./client";

interface SanityFetchParams {
	query: string;
	params?: Record<string, unknown>;
	tags?: string[];
	perspective?: "published" | "drafts" | "raw";
	stega?: boolean;
	cacheMode?: "auto" | "no-store" | "revalidate";
	revalidate?: number;
}

export async function sanityFetch<T>({
	query,
	params,
	tags,
	perspective = "published",
	stega = false,
	cacheMode = "auto",
	revalidate = 300,
}: SanityFetchParams): Promise<{ data: T }> {
	const configuredClient = client.withConfig({ perspective, stega });
	const shouldNoStore = cacheMode === "no-store" || (cacheMode === "auto" && perspective !== "published");
	const data = await configuredClient.fetch<T>(query, params ?? {}, shouldNoStore
		? {
				cache: "no-store",
				next: {
					revalidate: 0,
					...(tags?.length ? { tags } : {}),
				},
			}
		: {
				cache: "force-cache",
				next: {
					revalidate,
					...(tags?.length ? { tags } : {}),
				},
			});
	return { data };
}
