function normalizeEnvValue(value: string | undefined): string | undefined {
	if (!value) return undefined;
	const trimmed = value.trim();
	if (!trimmed) return undefined;
	if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
		return trimmed.slice(1, -1);
	}
	return trimmed;
}

function readEnvValue(keys: string[]): string | undefined {
	for (const key of keys) {
		const value = normalizeEnvValue(process.env[key]);
		if (value) return value;
	}
	return undefined;
}

function assertValue(v: string | undefined, errorMessage: string): string {
	if (!v) {
		throw new Error(errorMessage);
	}

	return v;
}

export const apiVersion = (readEnvValue(["NEXT_PUBLIC_SANITY_API_VERSION"]) || "2026-01-09").replace(/^v/, "");

export const dataset = assertValue(
	readEnvValue(["NEXT_PUBLIC_SANITY_DATASET"]),
	"Missing Sanity dataset for public app. Set NEXT_PUBLIC_SANITY_DATASET."
);

export const projectId = assertValue(
	readEnvValue(["NEXT_PUBLIC_SANITY_PROJECT_ID"]),
	"Missing Sanity project ID for public app. Set NEXT_PUBLIC_SANITY_PROJECT_ID."
);
