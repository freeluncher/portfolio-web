import { NextResponse } from "next/server";
import type { WakaApiResponse, WakaData } from "@/lib/api-types";
import { wakaDataSchema } from "@/lib/api-schemas";

export const dynamic = "force-dynamic";

function jsonResponse(payload: WakaApiResponse, status = 200) {
	return NextResponse.json(payload, {
		status,
		headers: { "Cache-Control": "no-store" },
	});
}

export async function GET() {
	const apiKey = process.env.WAKATIME_API_KEY;
	if (!apiKey) {
		return jsonResponse({
			data: null,
			error: "WakaTime API key is not configured.",
			code: "WAKATIME_API_KEY_MISSING",
		}, 500);
	}

	try {
		const endDate = new Date();
		const startDate = new Date(endDate);
		startDate.setDate(endDate.getDate() - 6);

		const formatDate = (date: Date) => date.toISOString().split("T")[0];
		const start = formatDate(startDate);
		const end = formatDate(endDate);

		const encodedKey = Buffer.from(apiKey).toString("base64");
		const res = await fetch(`https://wakatime.com/api/v1/users/current/summaries?start=${start}&end=${end}`, {
			headers: {
				Authorization: `Basic ${encodedKey}`,
			},
			cache: "no-store",
		});

		if (!res.ok) {
			if (res.status === 401) {
				return jsonResponse({
					data: null,
					error: "WakaTime API key is not valid or has expired.",
					code: "WAKATIME_API_KEY_INVALID",
				}, 401);
			}

			if (res.status === 429) {
				return jsonResponse({
					data: null,
					error: "WakaTime request limit reached. Please try again later.",
					code: "WAKATIME_RATE_LIMIT",
				}, 429);
			}

			return jsonResponse({
				data: null,
				error: `Failed to Load Coding Activity (HTTP ${res.status}).`,
				code: "WAKATIME_FETCH_FAILED",
			}, 502);
		}

		const rawData: unknown = await res.json();
		const parsedWakaData = wakaDataSchema.safeParse(rawData);
		if (!parsedWakaData.success) {
			console.error("Invalid WakaTime payload", parsedWakaData.error.flatten());
			return jsonResponse({
				data: null,
				error: "WakaTime returned an unexpected response format.",
				code: "WAKATIME_INVALID_RESPONSE",
			}, 502);
		}

		const data = parsedWakaData.data as WakaData;
		return jsonResponse({ data, error: null, code: null }, 200);
	} catch (error) {
		console.error("WakaTime API route error:", error);
		return jsonResponse({
			data: null,
			error: "Failed to connect to WakaTime at this time.",
			code: "WAKATIME_CONNECTION_FAILED",
		}, 502);
	}
}
