import { defineArrayMember, defineField, defineType } from "sanity";

export const dashboardWidgetType = defineType({
	name: "dashboardWidget",
	title: "Dashboard Widget",
	type: "document",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			validation: (Rule) => Rule.required().min(2).max(80),
		}),
		defineField({
			name: "widgetType",
			title: "Widget Type",
			type: "string",
			options: {
				list: [
					{ title: "KPI Card", value: "kpi-card" },
					{ title: "Line Chart", value: "line-chart" },
					{ title: "Bar Chart", value: "bar-chart" },
					{ title: "Table", value: "table" },
				],
				layout: "radio",
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "metricRefs",
			title: "Metrics",
			type: "array",
			of: [defineArrayMember({ type: "reference", to: [{ type: "metricDefinition" }] })],
			validation: (Rule) => Rule.required().min(1),
		}),
		defineField({
			name: "defaultRangeDays",
			title: "Default Range (Days)",
			type: "number",
			initialValue: 30,
			validation: (Rule) => Rule.required().min(1).max(365),
		}),
		defineField({
			name: "orderRank",
			title: "Order Rank",
			type: "number",
			initialValue: 100,
		}),
		defineField({
			name: "isVisible",
			title: "Visible",
			type: "boolean",
			initialValue: true,
		}),
	],
});