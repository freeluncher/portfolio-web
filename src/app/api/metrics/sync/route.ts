import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMetricsSyncSecret, writeMetricSnapshots } from "@/lib/metrics-sync";

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

export async function POST(request: NextRequest) {
	const secret = getMetricsSyncSecret();
	const providedSecret = request.headers.get("x-metrics-sync-secret") || request.nextUrl.searchParams.get("secret");

	if (!secret) {
		return NextResponse.json({ ok: false, message: "Missing METRICS_SYNC_SECRET or METRIC_SYNC_SECRET." }, { status: 500 });
	}

	if (!providedSecret || providedSecret !== secret) {
		return NextResponse.json({ ok: false, message: "Invalid secret." }, { status: 401 });
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

	try {
		const result = await writeMetricSnapshots({
			source: parsed.data.source,
			snapshots: parsed.data.snapshots,
		});

		return NextResponse.json({
			ok: true,
			source: result.source,
			rowsWritten: result.rowsWritten,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unexpected sync error.";
		return NextResponse.json({ ok: false, message }, { status: 500 });
	}
}
