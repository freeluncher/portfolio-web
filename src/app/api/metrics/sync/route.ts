import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";

const metricsSyncPayloadSchema = z.object({
	source: z.string().min(2).max(80).default("ga4"),
	snapshots: z.array(
		z.object({
			metricKey: z.string().min(2).max(80),
			periodType: z.enum(["hourly", "daily", "weekly", "monthly"]),
			periodStart: z.string().datetime(),
			periodEnd: z.string().datetime().optional(),
			value: z.number(),
			dimensions: z
				.object({
					pagePath: z.string().optional(),
					country: z.string().optional(),
					deviceCategory: z.string().optional(),
					sourceMedium: z.string().optional(),
				})
				.optional(),
		})
	).min(1).max(2000),
});

function stableDimensionHash(input: Record<string, string | undefined> | undefined) {
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

export async function POST(request: NextRequest) {
	const startedAt = new Date().toISOString();
	const secret = process.env.METRICS_SYNC_SECRET;
	const providedSecret = request.headers.get("x-metrics-sync-secret") || request.nextUrl.searchParams.get("secret");

	if (!secret) {
		return NextResponse.json({ ok: false, message: "Missing METRICS_SYNC_SECRET." }, { status: 500 });
	}

	if (!providedSecret || providedSecret !== secret) {
		return NextResponse.json({ ok: false, message: "Invalid secret." }, { status: 401 });
	}

	const writeToken = process.env.SANITY_API_WRITE_TOKEN;
	if (!writeToken) {
		return NextResponse.json({ ok: false, message: "Missing SANITY_API_WRITE_TOKEN." }, { status: 500 });
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
	}

	const parsed = metricsSyncPayloadSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{ ok: false, message: "Invalid payload.", issues: parsed.error.flatten() },
			{ status: 400 }
		);
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

		const operations = parsed.data.snapshots.map((snapshot) => {
			const dimensionHash = stableDimensionHash(snapshot.dimensions);
			const snapshotId = buildSnapshotId(snapshot.metricKey, snapshot.periodType, snapshot.periodStart, dimensionHash);
			const metricRefId = metricKeyToRefId[snapshot.metricKey];

			return writeClient.createOrReplace({
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
			});
		});

		await Promise.all(operations);
		await writeSyncLog({
			source: parsed.data.source,
			startedAt,
			status: "success",
			rowsWritten: operations.length,
		});

		return NextResponse.json({
			ok: true,
			source: parsed.data.source,
			rowsWritten: operations.length,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unexpected sync error.";
		console.error("Metrics sync failed:", error);
		await writeSyncLog({
			source: parsed.data.source,
			startedAt,
			status: "failed",
			rowsWritten: 0,
			errorMessage: message,
		});

		return NextResponse.json({ ok: false, message }, { status: 500 });
	}
}
