async function getWakaTimeStats() {
	const apiKey = process.env.WAKATIME_API_KEY;
	if (!apiKey) {
		return {
			data: null,
			error: "WakaTime belum dikonfigurasi.",
		};
	}

	try {
		const encodedKey = Buffer.from(apiKey).toString("base64");

		// Use summaries endpoint for accurate "Today" stats
		// invalidating cache every 60s for "Live" feel
		const res = await fetch("https://wakatime.com/api/v1/users/current/summaries?start=today&end=today", {
			headers: {
				Authorization: `Basic ${encodedKey}`,
			},
			next: { revalidate: 60 },
		});

		if (!res.ok) {
			if (res.status === 401) {
				return {
					data: null,
					error: "WakaTime API key tidak valid atau sudah kedaluwarsa.",
				};
			}

			if (res.status === 429) {
				return {
					data: null,
					error: "Batas request WakaTime tercapai. Coba lagi sebentar.",
				};
			}

			return {
				data: null,
				error: `Gagal memuat aktivitas coding (HTTP ${res.status}).`,
			};
		}

		return {
			data: (await res.json()) as WakaData,
			error: null,
		};
	} catch (error) {
		console.error("WakaTime Fetch Error:", error);
		return {
			data: null,
			error: "Tidak bisa terhubung ke WakaTime saat ini.",
		};
	}
}

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

export default async function WakaStats() {
	const { data, error } = await getWakaTimeStats();

	const todayStats = data?.data?.[0] || {
		grand_total: { total_seconds: 0, text: "0 mins" },
		languages: [],
	};

	const todaySeconds = todayStats.grand_total.total_seconds;
	const todayText = todayStats.grand_total.text;

	const todayHours = Math.floor(todaySeconds / 3600);
	const todayMins = Math.floor((todaySeconds % 3600) / 60);

	// Fallback languages if empty (new day or no coding yet)
	const languages = todayStats.languages.length > 0 ? todayStats.languages : [{ name: "Waiting for data...", percent: 100 }];

	return (
		<div className="space-y-4">
			{error && <div className="rounded-lg border border-amber-300/60 bg-amber-100/40 dark:border-amber-700/60 dark:bg-amber-950/40 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">{error}</div>}

			{/* Coding Time */}
			<div>
				<div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Today</div>
				<div className="text-3xl font-bold tracking-tight">{todayText}</div>
				<div className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-1">
					{todayHours}h {todayMins}m
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
