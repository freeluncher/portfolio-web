import { z } from "zod";

export const githubProjectSchema = z
	.object({
		id: z.number(),
		name: z.string(),
		description: z.string().nullable(),
		stargazers_count: z.number(),
		forks_count: z.number(),
		html_url: z.string().url(),
		language: z.string().nullable(),
	})
	.passthrough();

export const githubProjectsSchema = z.array(githubProjectSchema);

export const wakaLanguageSchema = z.object({
	name: z.string(),
	percent: z.number(),
});

export const wakaDailySummarySchema = z.object({
	grand_total: z.object({
		total_seconds: z.number(),
		text: z.string(),
	}),
	languages: z.array(wakaLanguageSchema),
});

export const wakaDataSchema = z.object({
	data: z.array(wakaDailySummarySchema),
});
