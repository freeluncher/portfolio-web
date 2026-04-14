import { defineField, defineType } from "sanity";

export const metricSnapshotType = defineType({
	name: "metricSnapshot",
	title: "Metric Snapshot",
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
			name: "metricKey",
			title: "Metric Key",
			type: "string",
			description: "Denormalized key for faster filtering.",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "periodType",
			title: "Period Type",
			type: "string",
			options: {
				list: [
					{ title: "Hourly", value: "hourly" },
					{ title: "Daily", value: "daily" },
					{ title: "Weekly", value: "weekly" },
					{ title: "Monthly", value: "monthly" },
				],
				layout: "radio",
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "periodStart",
			title: "Period Start",
			type: "datetime",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "periodEnd",
			title: "Period End",
			type: "datetime",
		}),
		defineField({
			name: "value",
			title: "Value",
			type: "number",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "dimensions",
			title: "Dimensions",
			type: "object",
			fields: [
				defineField({ name: "pagePath", title: "Page Path", type: "string" }),
				defineField({ name: "country", title: "Country", type: "string" }),
				defineField({ name: "deviceCategory", title: "Device Category", type: "string" }),
				defineField({ name: "sourceMedium", title: "Source / Medium", type: "string" }),
			],
		}),
		defineField({
			name: "dimensionHash",
			title: "Dimension Hash",
			type: "string",
			readOnly: true,
			hidden: true,
		}),
	],
	preview: {
		select: {
			title: "metricKey",
			periodType: "periodType",
			periodStart: "periodStart",
			value: "value",
		},
		prepare(selection) {
			return {
				title: `${selection.title || "metric"}: ${selection.value ?? "-"}`,
				subtitle: `${selection.periodType || "period"} • ${selection.periodStart || "no date"}`,
			};
		},
	},
});