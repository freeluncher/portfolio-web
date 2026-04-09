function assertValue(v: string | undefined, errorMessage: string): string {
	if (!v) {
		throw new Error(errorMessage);
	}

	return v;
}

export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-01-09";

export const dataset = assertValue(
	process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET,
	"Missing Sanity dataset for public app. Set NEXT_PUBLIC_SANITY_DATASET (preferred) or SANITY_DATASET."
);

export const projectId = assertValue(
	process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID,
	"Missing Sanity project ID for public app. Set NEXT_PUBLIC_SANITY_PROJECT_ID (preferred) or SANITY_PROJECT_ID."
);
