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

function readStudioEnv(keys: string[]): string | undefined {
	const processEnv = typeof process !== "undefined" ? process.env : undefined;
	const metaEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

	for (const key of keys) {
		const processValue = processEnv?.[key];
		if (typeof processValue === "string" && processValue.length > 0) {
			return processValue;
		}

		const metaValue = metaEnv?.[key];
		if (typeof metaValue === "string" && metaValue.length > 0) {
			return metaValue;
		}
	}

	return undefined;
}

function assertStudioEnv(value: string | undefined, hint: string): string {
	if (!value) {
		throw new Error(`Missing required Sanity Studio env. Set one of: ${hint}`);
	}
	return value;
}

const studioProjectId = assertStudioEnv(
	readStudioEnv(["SANITY_STUDIO_PROJECT_ID", "NEXT_PUBLIC_SANITY_PROJECT_ID"]),
	"SANITY_STUDIO_PROJECT_ID, NEXT_PUBLIC_SANITY_PROJECT_ID"
);
const studioDataset = assertStudioEnv(
	readStudioEnv(["SANITY_STUDIO_DATASET", "NEXT_PUBLIC_SANITY_DATASET"]),
	"SANITY_STUDIO_DATASET, NEXT_PUBLIC_SANITY_DATASET"
);
const studioApiVersion =
	(readStudioEnv(["SANITY_STUDIO_API_VERSION", "NEXT_PUBLIC_SANITY_API_VERSION"]) || "2026-01-09").replace(/^v/, "");

export default defineConfig({
	basePath: "/admin",
	projectId: studioProjectId,
	dataset: studioDataset,
	vite: {
		envPrefix: ["SANITY_STUDIO_", "NEXT_PUBLIC_"],
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
