import "server-only";

import type { DashboardApiResponse, DashboardWidgetData } from "@/lib/api-types";
import { client } from "@/sanity/lib/client";
import { dashboardWidgetListQuery, metricSnapshotsByKeysSinceQuery } from "@/sanity/lib/queries";

interface DashboardMetricRefRecord {
	_id: string;
	key: string;
	label: string;
	unit: string;
	source: string;
}

interface DashboardWidgetRecord {
	_id: string;
	title: string;
	widgetType: "kpi-card" | "line-chart" | "bar-chart" | "table";
	defaultRangeDays?: number;
	metricRefs?: DashboardMetricRefRecord[];
}

interface MetricSnapshotRecord {
	_id: string;
	metricKey: string;
	periodStart: string;
	periodEnd?: string;
	value: number;
	dimensions?: {
		pagePath?: string;
		country?: string;
		deviceCategory?: string;
		sourceMedium?: string;
	};
}

export function clampDashboardDays(days: number) {
	if (Number.isNaN(days)) return 30;
	return Math.min(Math.max(days, 1), 365);
}

export async function getDashboardApiPayload(requestedDaysInput = 30): Promise<DashboardApiResponse> {
	try {
		const requestedDays = clampDashboardDays(requestedDaysInput);
		const widgets = await client.fetch<DashboardWidgetRecord[]>(dashboardWidgetListQuery, {}, {
			cache: "no-store",
			next: { revalidate: 0 },
		});

		const widgetList = widgets || [];
		if (widgetList.length === 0) {
			return {
				data: {
					requestedDays,
					generatedAt: new Date().toISOString(),
					widgets: [],
				},
				error: null,
				code: null,
			};
		}

		const metricKeys = Array.from(
			new Set(
				widgetList
					.flatMap((widget) => widget.metricRefs || [])
					.map((metric) => metric.key)
					.filter((key): key is string => Boolean(key))
			)
		);

		const startDate = new Date();
		startDate.setDate(startDate.getDate() - requestedDays + 1);
		const start = startDate.toISOString();

		const snapshots = metricKeys.length
			? await client.fetch<MetricSnapshotRecord[]>(
					metricSnapshotsByKeysSinceQuery,
					{ metricKeys, start },
					{ cache: "no-store", next: { revalidate: 0 } }
			  )
			: [];

		const snapshotMap = (snapshots || []).reduce<Record<string, MetricSnapshotRecord[]>>((acc, item) => {
			if (!acc[item.metricKey]) {
				acc[item.metricKey] = [];
			}
			acc[item.metricKey].push(item);
			return acc;
		}, {});

		const payloadWidgets: DashboardWidgetData[] = widgetList.map((widget) => ({
			_id: widget._id,
			title: widget.title,
			widgetType: widget.widgetType,
			defaultRangeDays: widget.defaultRangeDays ?? 30,
			metrics: (widget.metricRefs || []).map((metric) => ({
				definition: metric,
				points: (snapshotMap[metric.key] || []).map((point) => ({
					periodStart: point.periodStart,
					periodEnd: point.periodEnd,
					value: point.value,
					dimensions: point.dimensions,
				})),
			})),
		}));

		return {
			data: {
				requestedDays,
				generatedAt: new Date().toISOString(),
				widgets: payloadWidgets,
			},
			error: null,
			code: null,
		};
	} catch (error) {
		console.error("Metrics dashboard data error:", error);
		return {
			data: null,
			error: "Failed to load dashboard metrics.",
			code: "DASHBOARD_FETCH_FAILED",
		};
	}
}
