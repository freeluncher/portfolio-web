import type { DashboardApiResponse } from "@/lib/api-types";
import { getDashboardApiPayload } from "@/lib/metrics-dashboard";

async function fetchDashboardData(): Promise<DashboardApiResponse> {
	return getDashboardApiPayload(30);
}

export const metadata = {
	title: "Admin Dashboard",
	description: "Website metrics dashboard",
};

export default async function AdminDashboardPage() {
	const payload = await fetchDashboardData();
	const widgets = payload.data?.widgets ?? [];

	return (
		<main className="min-h-screen bg-zinc-50 dark:bg-[#0f0f0f] text-zinc-900 dark:text-zinc-100">
			<div className="mx-auto w-full max-w-6xl px-6 py-12">
				<h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
				<p className="mt-2 text-zinc-600 dark:text-zinc-400">Widget configuration and latest metric points from `/api/metrics/dashboard`.</p>

				{payload.error ? (
					<div className="mt-6 rounded-xl border border-amber-300/70 bg-amber-100/60 dark:border-amber-800 dark:bg-amber-950/40 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
						{payload.error}
					</div>
				) : null}

				<div className="mt-8 grid gap-4 md:grid-cols-2">
					{widgets.map((widget) => (
						<section key={widget._id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
							<div className="flex items-center justify-between gap-2">
								<h2 className="text-lg font-semibold">{widget.title}</h2>
								<span className="text-xs rounded-full px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{widget.widgetType}</span>
							</div>
							<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Default range: {widget.defaultRangeDays} days</p>

							<div className="mt-4 space-y-3">
								{widget.metrics.map((metric) => {
									const latest = metric.points[metric.points.length - 1];
									return (
										<div key={metric.definition._id} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
											<div className="text-sm font-medium">{metric.definition.label}</div>
											<div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Key: {metric.definition.key}</div>
											<div className="mt-2 text-xl font-semibold">{latest ? latest.value : "-"}</div>
											<div className="text-xs text-zinc-500 dark:text-zinc-400">{latest ? new Date(latest.periodStart).toLocaleString() : "No points yet"}</div>
										</div>
									);
								})}
							</div>
						</section>
					))}
				</div>
			</div>
		</main>
	);
}
