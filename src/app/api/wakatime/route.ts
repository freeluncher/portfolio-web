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
				error: "WakaTime belum dikonfigurasi.",
			},
			{ status: 200, headers: { "Cache-Control": "no-store" } }
		);
	}

	try {
		const encodedKey = Buffer.from(apiKey).toString("base64");
		const res = await fetch("https://wakatime.com/api/v1/users/current/summaries?start=today&end=today", {
			headers: {
				Authorization: `Basic ${encodedKey}`,
			},
			cache: "no-store",
		});

		if (!res.ok) {
			if (res.status === 401) {
				return NextResponse.json(
					{ data: null, error: "WakaTime API key tidak valid atau sudah kedaluwarsa." },
					{ status: 200, headers: { "Cache-Control": "no-store" } }
				);
			}

			if (res.status === 429) {
				return NextResponse.json(
					{ data: null, error: "Batas request WakaTime tercapai. Coba lagi sebentar." },
					{ status: 200, headers: { "Cache-Control": "no-store" } }
				);
			}

			return NextResponse.json(
				{ data: null, error: `Gagal memuat aktivitas coding (HTTP ${res.status}).` },
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
			{ data: null, error: "Tidak bisa terhubung ke WakaTime saat ini." },
			{ status: 200, headers: { "Cache-Control": "no-store" } }
		);
	}
}
