import { defineField, defineType } from "sanity";

export const caseStudyType = defineType({
	name: "caseStudy",
	title: "Case Study",
	type: "document",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			validation: (Rule) => Rule.required().min(8).max(120),
		}),
		defineField({
			name: "slug",
			title: "Slug",
			type: "slug",
			options: { source: "title", maxLength: 96 },
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "repoName",
			title: "GitHub Repository Name",
			type: "string",
			description: "Repository name only, example: portfolio-web",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "summary",
			title: "Summary",
			type: "text",
			rows: 3,
			validation: (Rule) => Rule.required().min(40).max(280),
		}),
		defineField({
			name: "role",
			title: "Role",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "duration",
			title: "Duration",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "year",
			title: "Year",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "problem",
			title: "Problem",
			type: "text",
			rows: 5,
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "solution",
			title: "Solution",
			type: "text",
			rows: 5,
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "impact",
			title: "Impact",
			type: "array",
			of: [{ type: "string" }],
			validation: (Rule) => Rule.required().min(1),
		}),
		defineField({
			name: "techStack",
			title: "Tech Stack",
			type: "array",
			of: [{ type: "string" }],
			options: { layout: "tags" },
			validation: (Rule) => Rule.required().min(1),
		}),
		defineField({
			name: "architecture",
			title: "Architecture",
			type: "array",
			of: [{ type: "string" }],
			validation: (Rule) => Rule.required().min(1),
		}),
		defineField({
			name: "lessons",
			title: "Key Lessons",
			type: "array",
			of: [{ type: "string" }],
			validation: (Rule) => Rule.required().min(1),
		}),
		defineField({
			name: "liveUrl",
			title: "Live URL",
			type: "url",
		}),
		defineField({
			name: "featured",
			title: "Featured",
			type: "boolean",
			initialValue: true,
		}),
		defineField({
			name: "orderRank",
			title: "Order Rank",
			type: "number",
			description: "Lower number appears first",
		}),
	],
	preview: {
		select: {
			title: "title",
			subtitle: "repoName",
			featured: "featured",
		},
		prepare(selection) {
			const subtitle = selection.featured ? `${selection.subtitle} - featured` : selection.subtitle;
			return {
				title: selection.title,
				subtitle,
			};
		},
	},
});
