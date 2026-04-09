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

const studioProjectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "r7nbfp6c";
const studioDataset = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const studioApiVersion = (process.env.SANITY_STUDIO_API_VERSION || process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-01-09").replace(/^v/, "");

export default defineConfig({
	basePath: "/admin",
	projectId: studioProjectId,
	dataset: studioDataset,
	vite: {
		envPrefix: ["SANITY_STUDIO_", "NEXT_PUBLIC_", "VITE_"],
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
