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
						{ title: "H1", value: "h1" },
						{ title: "H2", value: "h2" },
						{ title: "H3", value: "h3" },
						{ title: "H4", value: "h4" },
						{ title: "H5", value: "h5" },
						{ title: "H6", value: "h6" },
						{ title: "Quote", value: "blockquote" },
					],
					lists: [
						{ title: "Bullet", value: "bullet" },
						{ title: "Numbered", value: "number" },
						{ title: "Numbered (Reset)", value: "number-restart" },
					],
					marks: {
						decorators: [
							{ title: "Strong", value: "strong" },
							{ title: "Emphasis", value: "em" },
							{ title: "Code", value: "code" },
							{ title: "Underline", value: "underline" },
							{ title: "Strike", value: "strike-through" },
						],
						annotations: [
							defineField({
								name: "link",
								type: "object",
								title: "Link",
								fields: [
									defineField({
										name: "href",
										type: "url",
										title: "URL",
										validation: (Rule) => Rule.uri({
											scheme: ["http", "https", "mailto", "tel"],
										}),
									}),
									defineField({
										name: "openInNewTab",
										type: "boolean",
										title: "Open in new tab",
										initialValue: true,
									}),
								],
							}),
							defineField({
								name: "internalLink",
								type: "object",
								title: "Internal Link",
								validation: (Rule) =>
									Rule.custom((value) => {
										if (!value || typeof value !== "object") {
											return "Set at least a reference or a fallback URL.";
										}

										const linkValue = value as { reference?: unknown; fallbackHref?: string };
										if (linkValue.reference || linkValue.fallbackHref) {
											return true;
										}

										return "Set at least a reference or a fallback URL.";
									}),
								fields: [
									defineField({
										name: "label",
										type: "string",
										title: "Label (optional)",
										description: "Shown in editor preview when set.",
									}),
									defineField({
										name: "reference",
										type: "reference",
										title: "Reference",
										to: [{ type: "post" }, { type: "caseStudy" }],
									}),
									defineField({
										name: "fallbackHref",
										type: "url",
										title: "Fallback URL",
										description: "Used if a reference is not selected.",
										validation: (Rule) =>
											Rule.uri({
												scheme: ["http", "https", "mailto", "tel"],
											}),
									}),
								],
								preview: {
									select: {
										label: "label",
										refTitle: "reference.title",
										refSlug: "reference.slug.current",
										refType: "reference._type",
										fallbackHref: "fallbackHref",
									},
									prepare(selection) {
										const title = selection.label || selection.refTitle || "Internal link";
										const targetFromRef =
											selection.refType && selection.refSlug
												? selection.refType === "caseStudy"
													? `/projects/${selection.refSlug}`
													: `/blog/${selection.refSlug}`
												: undefined;
										const subtitle = targetFromRef || selection.fallbackHref || "Target not set";
										return {
											title,
											subtitle,
										};
									},
								},
							}),
						],
					},
				},
				defineField({
					name: "image",
					type: "image",
					title: "Image",
					options: { hotspot: true },
					fields: [
						defineField({
							name: "alt",
							type: "string",
							title: "Alternative text",
						}),
						defineField({
							name: "caption",
							type: "string",
							title: "Caption",
						}),
					],
				}),
				defineField({
					name: "code",
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
				}),
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
		defineField({
			name: "scholarlyArticleRef",
			title: "Scholarly Article Reference (ETD/Thesis)",
			type: "object",
			description: "Link to ETD (Electronic Thesis & Dissertation) or academic paper",
			fields: [
				defineField({
					name: "url",
					title: "ETD/Paper URL",
					type: "url",
					validation: (Rule) => Rule.uri({
						scheme: ["http", "https"],
					}),
				}),
				defineField({
					name: "institutionName",
					title: "Institution Name",
					type: "string",
					description: "e.g., Politeknik Negeri Semarang",
				}),
				defineField({
					name: "authors",
					title: "Authors",
					type: "array",
					of: [{ type: "string" }],
					description: "Author names of the thesis/paper",
				}),
				defineField({
					name: "yearPublished",
					title: "Year Published",
					type: "number",
					description: "Publication year of the thesis/paper",
				}),
			],
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
