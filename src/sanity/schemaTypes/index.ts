import { type SchemaTypeDefinition } from "sanity";
import { postType } from "./post";
import { caseStudyType } from "./caseStudy";
import { architectureGraphEdgeType, architectureGraphNodeType, architectureGraphType } from "./architectureGraph";
import { siteSettingsType } from "./siteSettings";
import { metricDefinitionType } from "./metricDefinition";
import { metricSnapshotType } from "./metricSnapshot";
import { kpiTargetType } from "./kpiTarget";
import { dashboardWidgetType } from "./dashboardWidget";
import { syncLogType } from "./syncLog";

export const schema: { types: SchemaTypeDefinition[] } = {
	types: [
		postType,
		caseStudyType,
		siteSettingsType,
		metricDefinitionType,
		metricSnapshotType,
		kpiTargetType,
		dashboardWidgetType,
		syncLogType,
		architectureGraphType,
		architectureGraphNodeType,
		architectureGraphEdgeType,
	],
};
