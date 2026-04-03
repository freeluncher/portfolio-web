"use client";

import { useEffect, useState } from "react";

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

interface WakaApiResponse {
	data: WakaData | null;
	error: string | null;
}

function formatDuration(totalSeconds: number) {
	const hours = Math.floor(totalSeconds / 3600);
	const mins = Math.floor((totalSeconds % 3600) / 60);
	return { hours, mins, text: `${hours}h ${mins}m` };
}

async function fetchWakaStats(): Promise<WakaApiResponse> {
	const res = await fetch("/api/wakatime", {
		cache: "no-store",
	});

	if (!res.ok) {
		return {
			data: null,
			error: `Failed to Load Coding Activity (HTTP ${res.status}).`,
		};
	}

	return (await res.json()) as WakaApiResponse;
}

export default function WakaStats() {
	const [data, setData] = useState<WakaData | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const load = async () => {
			try {
				const result = await fetchWakaStats();
				if (!isMounted) return;
				setData(result.data);
				setError(result.error);
			} catch (err) {
				if (!isMounted) return;
				console.error("WakaTime Polling Error:", err);
				setError("Failed to fetch WakaTime data.");
			}
		};

		void load();
		const intervalId = window.setInterval(() => {
			void load();
		}, 60000);

		return () => {
			isMounted = false;
			window.clearInterval(intervalId);
		};
	}, []);

	const summaries = data?.data ?? [];

	const todayStats = summaries[summaries.length - 1] || {
		grand_total: { total_seconds: 0, text: "0 mins" },
		languages: [],
	};

	const todaySeconds = todayStats.grand_total.total_seconds;
	const todayText = todayStats.grand_total.text;
	const todayDuration = formatDuration(todaySeconds);

	const weeklySeconds = summaries.reduce((total, day) => total + day.grand_total.total_seconds, 0);
	const weeklyDuration = formatDuration(weeklySeconds);

	// Fallback languages if empty (new day or no coding yet)
	const languages = todayStats.languages.length > 0 ? todayStats.languages : [{ name: "Waiting for data...", percent: 100 }];

	return (
		<div className="space-y-4">
			{error && <div className="rounded-lg border border-amber-300/60 bg-amber-100/40 dark:border-amber-700/60 dark:bg-amber-950/40 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">{error}</div>}

			<div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100/60 dark:bg-zinc-900/40 px-3 py-2">
				<div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">This Week</div>
				<div className="text-lg font-semibold tracking-tight">{weeklyDuration.text}</div>
			</div>

			{/* Coding Time */}
			<div>
				<div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Today</div>
				<div className="text-3xl font-bold tracking-tight">{todayText}</div>
				<div className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-1">
					{todayDuration.hours}h {todayDuration.mins}m
				</div>
			</div>

			{/* Languages */}
			<div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-700">
				{languages.slice(0, 3).map((lang) => (
					<div key={lang.name} className="flex justify-between text-sm items-center">
						<span className="font-medium">{lang.name}</span>
						<span className="text-zinc-500 dark:text-zinc-400">{lang.percent}%</span>
					</div>
				))}
			</div>
		</div>
	);
}
