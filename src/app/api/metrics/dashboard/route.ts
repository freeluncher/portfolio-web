import { NextRequest, NextResponse } from "next/server";
import type { DashboardApiResponse } from "@/lib/api-types";
import { clampDashboardDays, getDashboardApiPayload } from "@/lib/metrics-dashboard";

export const dynamic = "force-dynamic";

function jsonResponse(payload: DashboardApiResponse, status = 200) {
	return NextResponse.json(payload, {
		status,
		headers: { "Cache-Control": "no-store" },
	});
}

function parseDaysParam(request: NextRequest) {
	const rawDays = request.nextUrl.searchParams.get("days");
	const parsed = Number(rawDays ?? "30");
	return clampDashboardDays(parsed);
}

export async function GET(request: NextRequest) {
	const requestedDays = parseDaysParam(request);
	const payload = await getDashboardApiPayload(requestedDays);
	const status = payload.error ? 500 : 200;
	return jsonResponse(payload, status);
}
