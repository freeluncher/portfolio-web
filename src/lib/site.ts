const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const siteUrl = rawSiteUrl.replace(/\/$/, "");

export const absoluteUrl = (path: string) => {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${siteUrl}${normalizedPath}`;
};
