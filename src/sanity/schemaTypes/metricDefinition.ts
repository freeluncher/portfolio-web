import { defineField, defineType } from "sanity";

export const metricDefinitionType = defineType({
	name: "metricDefinition",
	title: "Metric Definition",
	type: "document",
	fields: [
		defineField({
			name: "key",
			title: "Key",
			type: "string",
			description: "Stable key, for example: sessions, activeUsers, conversionRate.",
			validation: (Rule) => Rule.required().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, { name: "metric key" }),
		}),
		defineField({
			name: "label",
			title: "Label",
			type: "string",
			validation: (Rule) => Rule.required().min(2).max(60),
		}),
		defineField({
			name: "source",
			title: "Source",
			type: "string",
			options: {
				list: [
					{ title: "Google Analytics 4", value: "ga4" },
					{ title: "Search Console", value: "searchConsole" },
					{ title: "Custom", value: "custom" },
				],
				layout: "radio",
			},
			initialValue: "ga4",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "unit",
			title: "Unit",
			type: "string",
			options: {
				list: [
					{ title: "Number", value: "number" },
					{ title: "Percent", value: "percent" },
					{ title: "Duration (seconds)", value: "durationSeconds" },
					{ title: "Currency", value: "currency" },
				],
				layout: "radio",
			},
			initialValue: "number",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "description",
			title: "Description",
			type: "text",
			rows: 3,
		}),
		defineField({
			name: "isActive",
			title: "Active",
			type: "boolean",
			initialValue: true,
		}),
	],
	preview: {
		select: {
			title: "label",
			subtitle: "key",
			source: "source",
		},
		prepare(selection) {
			return {
				title: selection.title,
				subtitle: `${selection.subtitle || "unknown"} • ${selection.source || "custom"}`,
			};
		},
	},
});