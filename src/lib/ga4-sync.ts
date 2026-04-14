import "server-only";

import { createSign } from "node:crypto";
import { client } from "@/sanity/lib/client";
import { writeMetricSnapshots, type MetricSnapshotInput } from "@/lib/metrics-sync";

interface Ga4MetricDefinition {
	_id: string;
	key: string;
	unit: string;
}

interface Ga4RunReportRow {
	dimensionValues?: Array<{ value?: string }>;
	metricValues?: Array<{ value?: string }>;
}

interface Ga4RunReportResponse {
	rows?: Ga4RunReportRow[];
	metricHeaders?: Array<{ name?: string }>;
}

function readEnvValue(keys: string[], fallback?: string) {
	for (const key of keys) {
		const value = process.env[key];
		if (typeof value === "string" && value.trim().length > 0) {
			return value.trim();
		}
	}

	return fallback ?? undefined;
}

function normalizePrivateKey(rawKey: string) {
	const trimmed = rawKey.trim();
	if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
		return trimmed.slice(1, -1).replace(/\\n/g, "\n");
	}
	return trimmed.replace(/\\n/g, "\n");
}

function base64UrlEncode(value: string | Buffer) {
	return Buffer.from(value)
		.toString("base64")
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}

function createJwtAssertion({ email, privateKey, scope }: { email: string; privateKey: string; scope: string }) {
	const now = Math.floor(Date.now() / 1000);
	const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
	const payload = base64UrlEncode(
		JSON.stringify({
			iss: email,
			scope,
			aud: "https://oauth2.googleapis.com/token",
			iat: now,
			exp: now + 3600,
		})
	);
	const unsignedToken = `${header}.${payload}`;
	const signer = createSign("RSA-SHA256");
	signer.update(unsignedToken);
	signer.end();
	const signature = signer.sign(normalizePrivateKey(privateKey));
	return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

async function getGoogleAccessToken() {
	const serviceAccountEmail = readEnvValue(["GA4_SERVICE_ACCOUNT_EMAIL"]);
	const privateKey = readEnvValue(["GA4_SERVICE_ACCOUNT_PRIVATE_KEY"]);

	if (!serviceAccountEmail || !privateKey) {
		throw new Error("Missing GA4_SERVICE_ACCOUNT_EMAIL or GA4_SERVICE_ACCOUNT_PRIVATE_KEY.");
	}

	const assertion = createJwtAssertion({
		email: serviceAccountEmail,
		privateKey,
		scope: "https://www.googleapis.com/auth/analytics.readonly",
	});

	const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
			assertion,
		}),
	});

	if (!tokenResponse.ok) {
		const errorText = await tokenResponse.text();
		throw new Error(`Failed to get Google access token (HTTP ${tokenResponse.status}). ${errorText}`);
	}

	const payload = (await tokenResponse.json()) as { access_token?: string };
	if (!payload.access_token) {
		throw new Error("Google token response did not include an access token.");
	}

	return payload.access_token;
}

function formatDate(date: Date) {
	return date.toISOString().slice(0, 10);
}

function parseGa4Date(dateValue: string) {
	if (!/^\d{8}$/.test(dateValue)) {
		throw new Error(`Unexpected GA4 date format: ${dateValue}`);
	}

	const year = dateValue.slice(0, 4);
	const month = dateValue.slice(4, 6);
	const day = dateValue.slice(6, 8);
	return {
		start: `${year}-${month}-${day}T00:00:00.000Z`,
		end: `${year}-${month}-${day}T23:59:59.999Z`,
		dateKey: `${year}-${month}-${day}`,
	};
}

function buildDateKeys(startDate: string, endDate: string) {
	const current = new Date(`${startDate}T00:00:00.000Z`);
	const end = new Date(`${endDate}T00:00:00.000Z`);
	const keys: string[] = [];

	while (current <= end) {
		keys.push(formatDate(current));
		current.setUTCDate(current.getUTCDate() + 1);
	}

	return keys;
}

async function fetchGa4MetricDefinitions() {
	return client.fetch<Ga4MetricDefinition[]>(
		`*[_type == "metricDefinition" && isActive == true && source == "ga4"]{ _id, key, unit } | order(key asc)`,
		{},
		{ cache: "no-store", next: { revalidate: 0 } }
	);
}

async function fetchGa4RunReport({ propertyId, accessToken, startDate, endDate, metricKeys }: { propertyId: string; accessToken: string; startDate: string; endDate: string; metricKeys: string[]; }) {
	const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			dateRanges: [{ startDate, endDate }],
			dimensions: [{ name: "date" }],
			metrics: metricKeys.map((name) => ({ name })),
			limit: 100000,
		}),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`GA4 report request failed (HTTP ${response.status}). ${errorText}`);
	}

	return (await response.json()) as Ga4RunReportResponse;
}

export async function syncGa4Metrics(daysInput = 30) {
	const propertyId = readEnvValue(["GA4_PROPERTY_ID"]);
	if (!propertyId) {
		throw new Error("Missing GA4_PROPERTY_ID.");
	}

	const days = Math.min(Math.max(Number.isNaN(daysInput) ? 30 : daysInput, 1), 365);
	const metricDefinitions = await fetchGa4MetricDefinitions();
	if (metricDefinitions.length === 0) {
		throw new Error("No active GA4 metric definitions found in Sanity.");
	}

	const accessToken = await getGoogleAccessToken();

	const endDate = new Date();
	const startDate = new Date(endDate);
	startDate.setUTCDate(endDate.getUTCDate() - days + 1);

	const start = formatDate(startDate);
	const end = formatDate(endDate);
	const report = await fetchGa4RunReport({
		propertyId,
		accessToken,
		startDate: start,
		endDate: end,
		metricKeys: metricDefinitions.map((item) => item.key),
	});

	const metricIndexByKey = metricDefinitions.reduce<Record<string, number>>((acc, item, index) => {
		acc[item.key] = index;
		return acc;
	}, {});

	const rows = report.rows || [];
	const rowsByDate = rows.reduce<Record<string, Record<string, number>>>((acc, row) => {
		const dateValue = row.dimensionValues?.[0]?.value;
		if (!dateValue) return acc;
		const { dateKey } = parseGa4Date(dateValue);
		if (!acc[dateKey]) acc[dateKey] = {};

		for (const [metricKey, index] of Object.entries(metricIndexByKey)) {
			const rawValue = row.metricValues?.[index]?.value;
			const numericValue = Number(rawValue ?? 0);
			acc[dateKey][metricKey] = Number.isNaN(numericValue) ? 0 : numericValue;
		}

		return acc;
	}, {});

	const allDateKeys = buildDateKeys(start, end);
	const snapshots: MetricSnapshotInput[] = [];

	for (const dateKey of allDateKeys) {
		const { start: periodStart, end: periodEnd } = parseGa4Date(dateKey.replace(/-/g, ""));
		for (const metricDefinition of metricDefinitions) {
			const rawValue = rowsByDate[dateKey]?.[metricDefinition.key] ?? 0;
			const value = metricDefinition.unit === "percent" ? rawValue * 100 : rawValue;
			snapshots.push({
				metricKey: metricDefinition.key,
				periodType: "daily",
				periodStart,
				periodEnd,
				value,
			});
		}
	}

	const writeResult = await writeMetricSnapshots({
		source: "ga4",
		snapshots,
	});

	return {
		propertyId,
		days,
		startDate: start,
		endDate: end,
		metricCount: metricDefinitions.length,
		rowsWritten: writeResult.rowsWritten,
	};
}