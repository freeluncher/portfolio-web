"use client";

import { usePathname } from "next/navigation";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function SpeedInsightsGate() {
	const pathname = usePathname();

	if (pathname?.startsWith("/admin")) {
		return null;
	}

	return <SpeedInsights />;
}
