import { CogIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
	name: "siteSettings",
	title: "Site Settings",
	type: "document",
	icon: CogIcon,
	fields: [
		defineField({
			name: "availability",
			title: "Availability",
			type: "object",
			description: "Controls the live availability badges shown on the homepage and contact page.",
			fields: [
				defineField({
					name: "internship",
					title: "Available for Internship",
					type: "boolean",
					initialValue: true,
				}),
				defineField({
					name: "freelance",
					title: "Available for Freelance",
					type: "boolean",
					initialValue: true,
				}),
				defineField({
					name: "fullTime",
					title: "Available for Full-time",
					type: "boolean",
					initialValue: true,
				}),
			],
		}),
	],
});