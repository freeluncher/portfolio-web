"use client";

import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import type { AvailabilityApiResponse, AvailabilityData } from "@/lib/api-types";
import { AVAILABILITY_POLL_INTERVAL_MS } from "@/lib/constants";
import { usePollingResource } from "@/hooks/usePollingResource";
import { cn } from "@/lib/utils";

type AvailabilityVariant = "default" | "compact";

interface AvailabilityStatusProps {
	variant?: AvailabilityVariant;
	className?: string;
}

const statusItems = [
	{ key: "internship", label: "Internship" },
	{ key: "freelance", label: "Freelance" },
	{ key: "fullTime", label: "Full-time" },
] as const;

async function fetchAvailability(): Promise<AvailabilityApiResponse> {
	const res = await fetch("/api/availability", {
		cache: "no-store",
	});
	const payload = (await res.json()) as AvailabilityApiResponse;

	if (!res.ok) {
		return {
			data: payload?.data ?? null,
			error: payload?.error ?? `Failed to load availability (HTTP ${res.status}).`,
			code: payload?.code ?? "AVAILABILITY_FETCH_FAILED",
		};
	}

	return payload;
}

function getRelativeTime(lastUpdated: number | null) {
	if (!lastUpdated) return "Checking now...";
	const diffSeconds = Math.floor((Date.now() - lastUpdated) / 1000);
	if (diffSeconds < 5) return "Updated just now";
	if (diffSeconds < 60) return `Updated ${diffSeconds}s ago`;
	const diffMinutes = Math.floor(diffSeconds / 60);
	return `Updated ${diffMinutes}m ago`;
}

export default function AvailabilityStatus({ variant = "default", className }: AvailabilityStatusProps) {
	const availabilityFetcher = useCallback(async () => {
		const result = await fetchAvailability();
		return {
			data: result.data,
			error: result.error,
		};
	}, []);

	const { data: availabilityState, error: pollingError, isLoading, lastUpdated } = usePollingResource(availabilityFetcher, {
		intervalMs: AVAILABILITY_POLL_INTERVAL_MS,
		immediate: true,
	});

	const data: AvailabilityData | null = availabilityState?.data ?? null;
	const error = availabilityState?.error ?? pollingError;
	const updatedLabel = useMemo(() => getRelativeTime(lastUpdated), [lastUpdated]);
	const statusClasses = variant === "compact" ? "px-2 py-1 text-[11px]" : "px-2.5 py-1 text-xs";

	return (
		<div
			className={cn(
				"rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-100/70 dark:bg-zinc-900/50 p-3 space-y-3",
				className
			)}>
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<span className={cn("inline-flex h-2.5 w-2.5 rounded-full", isLoading ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
					<p className="text-sm font-semibold tracking-tight">Availability Status</p>
				</div>
				<span className="text-[11px] text-zinc-500 dark:text-zinc-400">Real-time</span>
			</div>

			<div className="flex flex-wrap gap-2">
				{statusItems.map((item) => {
					const isAvailable = data ? data.statuses[item.key] : false;
					return (
						<motion.span
							key={`${item.key}-${isAvailable ? "available" : "unavailable"}`}
							initial={{ opacity: 0, y: 6, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							transition={{ duration: 0.22, ease: "easeOut" }}
							className={cn(
								"inline-flex items-center rounded-full border font-medium transition-colors duration-300 ease-out",
								statusClasses,
								isAvailable
									? "border-emerald-300/80 bg-emerald-100/70 text-emerald-800 dark:border-emerald-700/70 dark:bg-emerald-900/30 dark:text-emerald-300"
									: "border-zinc-300/80 bg-zinc-200/70 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
							)}>
							{item.label}: {isAvailable ? "Available" : "Unavailable"}
						</motion.span>
					);
				})}
			</div>

			<div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
				<p>
					Estimated response: <span className="font-medium text-zinc-800 dark:text-zinc-200">{data?.responseTimeEstimate ?? "Calculating..."}</span>
				</p>
				<p>
					{updatedLabel}
					{data?.timezone ? ` • ${data.timezone}` : ""}
				</p>
				{error ? <p className="text-amber-700 dark:text-amber-300">{error}</p> : null}
			</div>
		</div>
	);
}
