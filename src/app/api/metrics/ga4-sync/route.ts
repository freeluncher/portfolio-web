import { NextRequest, NextResponse } from "next/server";
import { getMetricsSyncSecret } from "@/lib/metrics-sync";
import { syncGa4Metrics } from "@/lib/ga4-sync";

export const dynamic = "force-dynamic";

function parseDays(request: NextRequest) {
	const rawDays = request.nextUrl.searchParams.get("days");
	if (!rawDays) return 30;
	const parsed = Number(rawDays);
	if (Number.isNaN(parsed)) return 30;
	return Math.min(Math.max(parsed, 1), 365);
}

function validateSecret(request: NextRequest) {
	const secret = getMetricsSyncSecret();
	const providedSecret = request.headers.get("x-metrics-sync-secret") || request.nextUrl.searchParams.get("secret");
	const isVercelCron = request.headers.get("x-vercel-cron") === "1";
	const cronSecret = process.env.CRON_SECRET;
	const authorization = request.headers.get("authorization");

	if (!secret) {
		return { ok: false as const, response: NextResponse.json({ ok: false, message: "Missing METRICS_SYNC_SECRET or METRIC_SYNC_SECRET." }, { status: 500 }) };
	}

	// Vercel Cron: debug Authorization header
	if (isVercelCron) {
		if (!cronSecret) {
			return { ok: false as const, response: NextResponse.json({ ok: false, message: "Missing CRON_SECRET env for Vercel Cron." }, { status: 500 }) };
		}
		if (process.env.NODE_ENV === "development") {
			console.log("[VercelCron] Authorization header:", authorization);
			console.log("[VercelCron] Expected:", `Bearer ${cronSecret}`);
		}
		if (authorization !== `Bearer ${cronSecret}`) {
			return { ok: false as const, response: NextResponse.json({ ok: false, message: `Invalid Authorization header for Vercel Cron. Got: ${authorization}` }, { status: 401 }) };
		}
		return { ok: true as const };
	}

	if (!providedSecret || providedSecret !== secret) {
		return { ok: false as const, response: NextResponse.json({ ok: false, message: "Invalid secret." }, { status: 401 }) };
	}

	return { ok: true as const };
}

async function runSync(request: NextRequest) {
	const validation = validateSecret(request);
	if (!validation.ok) {
		return validation.response;
	}

	try {
		const days = parseDays(request);
		const result = await syncGa4Metrics(days);
		return NextResponse.json({
			ok: true,
			...result,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unexpected GA4 sync error.";
		console.error("GA4 sync failed:", error);
		return NextResponse.json({ ok: false, message }, { status: 500 });
	}
}

export async function GET(request: NextRequest) {
	return runSync(request);
}

export async function POST(request: NextRequest) {
	return runSync(request);
}
