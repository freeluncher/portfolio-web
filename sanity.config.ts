"use client";

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `\src\app\admin\[[...tool]]\page.tsx` route
 */

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { codeInput } from "@sanity/code-input";
import { table } from "@sanity/table";

import { schema } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

function assertStudioEnv(value: string | undefined, name: string): string {
	if (!value) {
		throw new Error(`Missing required Sanity Studio env: ${name}`);
	}
	return value;
}

const studioProjectId = assertStudioEnv(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, "NEXT_PUBLIC_SANITY_PROJECT_ID");
const studioDataset = assertStudioEnv(process.env.NEXT_PUBLIC_SANITY_DATASET, "NEXT_PUBLIC_SANITY_DATASET");
const studioApiVersion = (process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-01-09").replace(/^v/, "");

export default defineConfig({
	basePath: "/admin",
	projectId: studioProjectId,
	dataset: studioDataset,
	vite: {
		envPrefix: ["NEXT_PUBLIC_"],
	},
	// Add and edit the content schema in the './sanity/schemaTypes' folder
	schema,
	plugins: [
		structureTool({ structure }),
		// Vision is for querying with GROQ from inside the Studio
		// https://www.sanity.io/docs/the-vision-plugin
		visionTool({ defaultApiVersion: studioApiVersion }),
		// Code input for syntax-highlighted code blocks
		codeInput(),
		// Table plugin for creating tables
		table(),
	],
});
