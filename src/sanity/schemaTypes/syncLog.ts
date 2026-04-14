import { defineField, defineType } from "sanity";

export const syncLogType = defineType({
	name: "syncLog",
	title: "Sync Log",
	type: "document",
	fields: [
		defineField({
			name: "source",
			title: "Source",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "startedAt",
			title: "Started At",
			type: "datetime",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "finishedAt",
			title: "Finished At",
			type: "datetime",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "status",
			title: "Status",
			type: "string",
			options: {
				list: [
					{ title: "Success", value: "success" },
					{ title: "Failed", value: "failed" },
				],
				layout: "radio",
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "rowsWritten",
			title: "Rows Written",
			type: "number",
			initialValue: 0,
		}),
		defineField({
			name: "errorMessage",
			title: "Error Message",
			type: "text",
			rows: 4,
		}),
	],
	preview: {
		select: {
			title: "source",
			status: "status",
			finishedAt: "finishedAt",
			rowsWritten: "rowsWritten",
		},
		prepare(selection) {
			return {
				title: `${selection.title || "sync"} • ${selection.status || "unknown"}`,
				subtitle: `${selection.finishedAt || "no date"} • rows: ${selection.rowsWritten ?? 0}`,
			};
		},
	},
});