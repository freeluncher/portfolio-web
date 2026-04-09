function readEnvValue(keys: string[]): string | undefined {
	const processEnv = typeof process !== "undefined" ? process.env : undefined;
	const metaEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

	for (const key of keys) {
		const processValue = processEnv?.[key];
		if (typeof processValue === "string" && processValue.length > 0) {
			return processValue;
		}

		const metaValue = metaEnv?.[key];
		if (typeof metaValue === "string" && metaValue.length > 0) {
			return metaValue;
		}
	}

	return undefined;
}

function assertValue(v: string | undefined, errorMessage: string): string {
	if (!v) {
		throw new Error(errorMessage);
	}

	return v;
}

export const apiVersion =
	readEnvValue(["SANITY_STUDIO_API_VERSION", "NEXT_PUBLIC_SANITY_API_VERSION", "VITE_SANITY_API_VERSION"]) || "2026-01-09";

export const dataset = assertValue(
	readEnvValue(["SANITY_STUDIO_DATASET", "NEXT_PUBLIC_SANITY_DATASET", "VITE_SANITY_DATASET", "SANITY_DATASET"]),
	"Missing Sanity dataset for Studio. Set SANITY_STUDIO_DATASET or NEXT_PUBLIC_SANITY_DATASET."
);

export const projectId = assertValue(
	readEnvValue(["SANITY_STUDIO_PROJECT_ID", "NEXT_PUBLIC_SANITY_PROJECT_ID", "VITE_SANITY_PROJECT_ID", "SANITY_PROJECT_ID"]),
	"Missing Sanity project ID for Studio. Set SANITY_STUDIO_PROJECT_ID or NEXT_PUBLIC_SANITY_PROJECT_ID."
);
