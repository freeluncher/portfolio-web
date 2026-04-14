import { NextResponse } from "next/server";
import type { AvailabilityApiResponse } from "@/lib/api-types";
import { client } from "@/sanity/lib/client";
import { siteSettingsQuery } from "@/sanity/lib/queries";

export const dynamic = "force-dynamic";

const AVAILABILITY_TIMEZONE = "Asia/Jakarta";

function jsonResponse(payload: AvailabilityApiResponse, status = 200) {
	return NextResponse.json(payload, {
		status,
		headers: { "Cache-Control": "no-store" },
	});
}

function parseBooleanEnv(value: string | undefined, defaultValue: boolean) {
	if (value === undefined) return defaultValue;
	const normalized = value.trim().toLowerCase();
	if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
	if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
	return defaultValue;
}

interface AvailabilitySettingsDoc {
	availability?: {
		internship?: boolean;
		freelance?: boolean;
		fullTime?: boolean;
	} | null;
}

function getJakartaParts(date: Date) {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: AVAILABILITY_TIMEZONE,
		weekday: "short",
		hour: "2-digit",
		hour12: false,
	}).formatToParts(date);

	const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Mon";
	const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "12");

	return { weekday, hour };
}

function getResponseTimeEstimate(date: Date) {
	const { weekday, hour } = getJakartaParts(date);
	const isWeekend = weekday === "Sat" || weekday === "Sun";

	if (isWeekend) {
		return "Within 24 hours";
	}

	if (hour >= 9 && hour < 21) {
		return "Usually under 1 hour";
	}

	return "Usually within 12 hours";
}

export async function GET() {
	try {
		const now = new Date();
		const settings = await client.fetch<AvailabilitySettingsDoc | null>(siteSettingsQuery, {}, {
			cache: "no-store",
			next: { revalidate: 0 },
		});
		const availability = settings?.availability ?? null;
		const internship = availability?.internship ?? parseBooleanEnv(process.env.AVAILABLE_FOR_INTERNSHIP, true);
		const freelance = availability?.freelance ?? parseBooleanEnv(process.env.AVAILABLE_FOR_FREELANCE, true);
		const fullTime = availability?.fullTime ?? parseBooleanEnv(process.env.AVAILABLE_FOR_FULL_TIME, true);

		return jsonResponse(
			{
				data: {
					statuses: {
						internship,
						freelance,
						fullTime,
					},
					responseTimeEstimate: getResponseTimeEstimate(now),
					timezone: AVAILABILITY_TIMEZONE,
					checkedAt: now.toISOString(),
				},
				error: null,
				code: null,
			},
			200
		);
	} catch (error) {
		console.error("Availability API route error:", error);
		return jsonResponse(
			{
				data: null,
				error: "Failed to load availability status.",
				code: "AVAILABILITY_FETCH_FAILED",
			},
			500
		);
	}
}
