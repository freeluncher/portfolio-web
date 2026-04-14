export interface Project {
	id: number;
	name: string;
	description: string | null;
	stargazers_count: number;
	forks_count: number;
	html_url: string;
	language: string | null;
	caseStudySlug?: string;
}

export interface ApiEnvelope<TData, TCode extends string = string> {
	data: TData | null;
	error: string | null;
	code: TCode | null;
}

export type GitHubProjectsErrorCode =
	| "GITHUB_USERNAME_MISSING"
	| "GITHUB_RATE_LIMIT"
	| "GITHUB_TOKEN_INVALID"
	| "GITHUB_INVALID_RESPONSE"
	| "GITHUB_FETCH_FAILED"
	| "GITHUB_CONNECTION_FAILED";

export type GitHubProjectsResponse = ApiEnvelope<{ projects: Project[] }, GitHubProjectsErrorCode>;

export interface Language {
	name: string;
	percent: number;
}

export interface DailySummary {
	grand_total: {
		total_seconds: number;
		text: string;
	};
	languages: Language[];
}

export interface WakaData {
	data: DailySummary[];
}

export type WakaErrorCode =
	| "WAKATIME_API_KEY_MISSING"
	| "WAKATIME_API_KEY_INVALID"
	| "WAKATIME_RATE_LIMIT"
	| "WAKATIME_INVALID_RESPONSE"
	| "WAKATIME_FETCH_FAILED"
	| "WAKATIME_CONNECTION_FAILED";

export type WakaApiResponse = ApiEnvelope<WakaData, WakaErrorCode>;

export interface AvailabilityData {
	statuses: {
		internship: boolean;
		freelance: boolean;
		fullTime: boolean;
	};
	responseTimeEstimate: string;
	timezone: string;
	checkedAt: string;
}

export type AvailabilityErrorCode = "AVAILABILITY_INVALID_CONFIG" | "AVAILABILITY_FETCH_FAILED";

export type AvailabilityApiResponse = ApiEnvelope<AvailabilityData, AvailabilityErrorCode>;

export interface DashboardWidgetMetric {
	_id: string;
	key: string;
	label: string;
	unit: string;
	source: string;
}

export interface DashboardMetricPoint {
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

export interface DashboardWidgetData {
	_id: string;
	title: string;
	widgetType: "kpi-card" | "line-chart" | "bar-chart" | "table";
	defaultRangeDays: number;
	metrics: Array<{
		definition: DashboardWidgetMetric;
		points: DashboardMetricPoint[];
	}>;
}

export interface DashboardApiData {
	requestedDays: number;
	generatedAt: string;
	widgets: DashboardWidgetData[];
}

export type DashboardErrorCode = "DASHBOARD_FETCH_FAILED";

export type DashboardApiResponse = ApiEnvelope<DashboardApiData, DashboardErrorCode>;