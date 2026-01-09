import { defineField, defineType } from "sanity";

export const postType = defineType({
	name: "post",
	title: "Blog Post",
	type: "document",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "slug",
			title: "Slug",
			type: "slug",
			options: {
				source: "title",
				maxLength: 96,
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "mainImage",
			title: "Main Image",
			type: "image",
			options: {
				hotspot: true,
			},
			fields: [
				{
					name: "alt",
					type: "string",
					title: "Alternative Text",
				},
			],
		}),
		defineField({
			name: "publishedAt",
			title: "Published At",
			type: "datetime",
		}),
		defineField({
			name: "excerpt",
			title: "Excerpt",
			type: "text",
			rows: 3,
			description: "A short summary of the post for previews",
		}),
		defineField({
			name: "body",
			title: "Body",
			type: "array",
			of: [
				{
					type: "block",
					styles: [
						{ title: "Normal", value: "normal" },
						{ title: "H2", value: "h2" },
						{ title: "H3", value: "h3" },
						{ title: "H4", value: "h4" },
						{ title: "Quote", value: "blockquote" },
					],
					marks: {
						decorators: [
							{ title: "Strong", value: "strong" },
							{ title: "Emphasis", value: "em" },
							{ title: "Code", value: "code" },
						],
						annotations: [
							{
								name: "link",
								type: "object",
								title: "Link",
								fields: [
									{
										name: "href",
										type: "url",
										title: "URL",
									},
								],
							},
						],
					},
				},
				{
					type: "image",
					options: { hotspot: true },
					fields: [
						{
							name: "alt",
							type: "string",
							title: "Alternative text",
						},
						{
							name: "caption",
							type: "string",
							title: "Caption",
						},
					],
				},
				{
					type: "code",
					title: "Code Block",
					options: {
						language: "typescript",
						languageAlternatives: [
							{ title: "TypeScript", value: "typescript" },
							{ title: "JavaScript", value: "javascript" },
							{ title: "HTML", value: "html" },
							{ title: "CSS", value: "css" },
							{ title: "JSON", value: "json" },
							{ title: "Python", value: "python" },
							{ title: "Bash", value: "bash" },
						],
						withFilename: true,
					},
				},
				{
					type: "table",
					title: "Table",
				},
			],
		}),
		defineField({
			name: "tags",
			title: "Tags",
			type: "array",
			of: [{ type: "string" }],
			options: {
				layout: "tags",
			},
		}),
	],
	preview: {
		select: {
			title: "title",
			media: "mainImage",
			date: "publishedAt",
		},
		prepare(selection) {
			const { date } = selection;
			return {
				...selection,
				subtitle: date ? new Date(date).toLocaleDateString() : "No date",
			};
		},
	},
});
