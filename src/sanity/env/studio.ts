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
	(readEnvValue(["NEXT_PUBLIC_SANITY_API_VERSION"]) || "2026-01-09").replace(/^v/, "");

export const dataset = assertValue(
	readEnvValue(["NEXT_PUBLIC_SANITY_DATASET"]),
	"Missing Sanity dataset for Studio. Set NEXT_PUBLIC_SANITY_DATASET."
);

export const projectId = assertValue(
	readEnvValue(["NEXT_PUBLIC_SANITY_PROJECT_ID"]),
	"Missing Sanity project ID for Studio. Set NEXT_PUBLIC_SANITY_PROJECT_ID."
);
