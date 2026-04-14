import { defineField, defineType } from "sanity";

export const kpiTargetType = defineType({
	name: "kpiTarget",
	title: "KPI Target",
	type: "document",
	fields: [
		defineField({
			name: "metric",
			title: "Metric",
			type: "reference",
			to: [{ type: "metricDefinition" }],
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "periodType",
			title: "Period Type",
			type: "string",
			options: {
				list: [
					{ title: "Daily", value: "daily" },
					{ title: "Weekly", value: "weekly" },
					{ title: "Monthly", value: "monthly" },
				],
				layout: "radio",
			},
			initialValue: "monthly",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "targetValue",
			title: "Target Value",
			type: "number",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "activeFrom",
			title: "Active From",
			type: "date",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "activeTo",
			title: "Active To",
			type: "date",
		}),
		defineField({
			name: "notes",
			title: "Notes",
			type: "text",
			rows: 3,
		}),
	],
});