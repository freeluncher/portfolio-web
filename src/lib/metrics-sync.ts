import "server-only";

import { createHash } from "node:crypto";
import { client } from "@/sanity/lib/client";

export interface MetricSnapshotInput {
	metricKey: string;
	periodType: "hourly" | "daily" | "weekly" | "monthly";
	periodStart: string;
	periodEnd?: string;
	value: number;
	dimensions?: {
		pagePath?: string;
		country?: string;
		deviceCategory?: string;
		sourceMedium?: string;
	};
}

export interface MetricsSyncWriteInput {
	source: string;
	snapshots: MetricSnapshotInput[];
}

export function getMetricsSyncSecret() {
	return process.env.METRICS_SYNC_SECRET || process.env.METRIC_SYNC_SECRET || null;
}

function stableDimensionHash(input: MetricSnapshotInput["dimensions"] | undefined) {
	if (!input) return "none";
	const entries = Object.entries(input)
		.filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].trim().length > 0)
		.sort(([a], [b]) => a.localeCompare(b));

	if (entries.length === 0) return "none";

	const normalized = entries.map(([key, value]) => `${key}:${value.trim()}`).join("|");
	return createHash("sha1").update(normalized).digest("hex").slice(0, 12);
}

function sanitizeMetricKey(metricKey: string) {
	return metricKey.replace(/[^a-zA-Z0-9_]/g, "_");
}

function buildSnapshotId(metricKey: string, periodType: string, periodStart: string, dimensionHash: string) {
	const normalizedDate = periodStart.replace(/[:.]/g, "-");
	return `metricSnapshot.${sanitizeMetricKey(metricKey)}.${periodType}.${normalizedDate}.${dimensionHash}`;
}

async function writeSyncLog({
	source,
	startedAt,
	status,
	rowsWritten,
	errorMessage,
}: {
	source: string;
	startedAt: string;
	status: "success" | "failed";
	rowsWritten: number;
	errorMessage?: string;
}) {
	const writeToken = process.env.SANITY_API_WRITE_TOKEN;
	if (!writeToken) {
		console.warn("Skipping sync log write because SANITY_API_WRITE_TOKEN is not configured.");
		return;
	}

	const writeClient = client.withConfig({ token: writeToken, useCdn: false });
	await writeClient.create({
		_type: "syncLog",
		source,
		startedAt,
		finishedAt: new Date().toISOString(),
		status,
		rowsWritten,
		errorMessage,
	});
}

export async function writeMetricSnapshots({ source, snapshots }: MetricsSyncWriteInput) {
	const startedAt = new Date().toISOString();
	const writeToken = process.env.SANITY_API_WRITE_TOKEN;
	if (!writeToken) {
		throw new Error("Missing SANITY_API_WRITE_TOKEN.");
	}

	const writeClient = client.withConfig({ token: writeToken, useCdn: false });
	const metricKeyToRefId: Record<string, string> = {};

	try {
		const metricDefinitions = await writeClient.fetch<Array<{ _id: string; key: string }>>(
			`*[_type == "metricDefinition" && isActive == true]{ _id, key }`,
			{},
			{ cache: "no-store", next: { revalidate: 0 } }
		);

		for (const item of metricDefinitions) {
			metricKeyToRefId[item.key] = item._id;
		}

		const mutations = snapshots.map((snapshot) => {
			const dimensionHash = stableDimensionHash(snapshot.dimensions);
			const snapshotId = buildSnapshotId(snapshot.metricKey, snapshot.periodType, snapshot.periodStart, dimensionHash);
			const metricRefId = metricKeyToRefId[snapshot.metricKey];

			return {
				createOrReplace: {
					_id: snapshotId,
					_type: "metricSnapshot",
					metric: metricRefId ? { _type: "reference", _ref: metricRefId } : undefined,
					metricKey: snapshot.metricKey,
					periodType: snapshot.periodType,
					periodStart: snapshot.periodStart,
					periodEnd: snapshot.periodEnd,
					value: snapshot.value,
					dimensions: snapshot.dimensions,
					dimensionHash,
				},
			};
		});

		// Batch mutation
		await writeClient.fetch(
			`*[_type == "metricSnapshot"]{_id}`,
			{},
			{ cache: "no-store", next: { revalidate: 0 } }
		); // Optionally prefetch to warm up

		// Build correct Sanity batch mutation endpoint (must include 'v' prefix)
		const apiVersion = writeClient.config().apiVersion.startsWith("v")
			? writeClient.config().apiVersion
			: `v${writeClient.config().apiVersion}`;
		const endpoint = `https://${writeClient.config().projectId}.api.sanity.io/${apiVersion}/data/mutate/${writeClient.config().dataset}`;
		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${writeToken}`,
			},
			body: JSON.stringify({ mutations }),
		});

		if (!response.ok) {
			const details = await response.text();
			throw new Error(`Sanity batch mutation failed: ${details}`);
		}

		await writeSyncLog({
			source,
			startedAt,
			status: "success",
			rowsWritten: mutations.length,
		});

		return {
			rowsWritten: mutations.length,
			source,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unexpected sync error.";
		console.error("Metrics sync failed:", error);
		await writeSyncLog({
			source,
			startedAt,
			status: "failed",
			rowsWritten: 0,
			errorMessage: message,
		});
		throw error instanceof Error ? error : new Error(message);
	}
}