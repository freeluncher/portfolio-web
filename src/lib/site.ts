const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

function readEnvValue(keys: string[]): string | undefined {
	for (const key of keys) {
		const value = process.env[key];
		if (typeof value === "string" && value.trim().length > 0) {
			return value.trim();
		}
	}

	return undefined;
}

export const siteUrl = rawSiteUrl.replace(/\/$/, "");

export const googleTagMeasurementId = readEnvValue([
	"NEXT_PUBLIC_GOOGLE_TAG_ID",
	"NEXT_PUBLIC_GA_MEASUREMENT_ID",
	"NEXT_PUBLIC_GTAG_ID",
]) || "G-5LHDZVP4K3";

export const absoluteUrl = (path: string) => {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${siteUrl}${normalizedPath}`;
};
