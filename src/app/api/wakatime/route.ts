import { NextResponse } from "next/server";

interface Language {
	name: string;
	percent: number;
}

interface DailySummary {
	grand_total: {
		total_seconds: number;
		text: string;
	};
	languages: Language[];
}

interface WakaData {
	data: DailySummary[];
}

export const dynamic = "force-dynamic";

export async function GET() {
	const apiKey = process.env.WAKATIME_API_KEY;
	if (!apiKey) {
		return NextResponse.json(
			{
				data: null,
				error: "WakaTime API key is not configured.",
			},
			{ status: 200, headers: { "Cache-Control": "no-store" } }
		);
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
				return NextResponse.json(
					{ data: null, error: "WakaTime API key is not valid or has expired." },
					{ status: 200, headers: { "Cache-Control": "no-store" } }
				);
			}

			if (res.status === 429) {
				return NextResponse.json(
					{ data: null, error: "WakaTime request limit reached. Please try again later." },
					{ status: 200, headers: { "Cache-Control": "no-store" } }
				);
			}

			return NextResponse.json(
				{ data: null, error: `Failed to Load Coding Activity (HTTP ${res.status}).` },
				{ status: 200, headers: { "Cache-Control": "no-store" } }
			);
		}

		const data = (await res.json()) as WakaData;
		return NextResponse.json(
			{ data, error: null },
			{ status: 200, headers: { "Cache-Control": "no-store" } }
		);
	} catch (error) {
		console.error("WakaTime API route error:", error);
		return NextResponse.json(
			{ data: null, error: "Failed to connect to WakaTime at this time." },
			{ status: 200, headers: { "Cache-Control": "no-store" } }
		);
	}
}
