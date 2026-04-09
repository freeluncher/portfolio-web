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

const FALLBACK_STUDIO_PROJECT_ID = "r7nbfp6c";
const FALLBACK_STUDIO_DATASET = "production";

function normalizeEnvValue(value: string | undefined): string | undefined {
	if (!value) return undefined;
	let normalized = value.trim();
	if (!normalized) return undefined;

	// Remove trailing inline comments, e.g. "value" // comment
	normalized = normalized.replace(/\s+\/\/.*$/, "").trim();

	if ((normalized.startsWith('"') && normalized.endsWith('"')) || (normalized.startsWith("'") && normalized.endsWith("'"))) {
		normalized = normalized.slice(1, -1).trim();
	}

	return normalized || undefined;
}

function readStudioEnv(keys: string[]): string | undefined {
	const processEnv = typeof process !== "undefined" ? process.env : undefined;
	const metaEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

	for (const key of keys) {
		const processValue = normalizeEnvValue(processEnv?.[key]);
		if (processValue) {
			return processValue;
		}

		const metaValue = normalizeEnvValue(metaEnv?.[key]);
		if (metaValue) {
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

const studioProjectId =
	readStudioEnv(["SANITY_STUDIO_PROJECT_ID", "NEXT_PUBLIC_SANITY_PROJECT_ID"]) || FALLBACK_STUDIO_PROJECT_ID;
const studioDataset =
	readStudioEnv(["SANITY_STUDIO_DATASET", "NEXT_PUBLIC_SANITY_DATASET"]) || FALLBACK_STUDIO_DATASET;
const studioApiVersion =
	(readStudioEnv(["SANITY_STUDIO_API_VERSION", "NEXT_PUBLIC_SANITY_API_VERSION"]) || "2026-01-09").replace(/^v/, "");

if (!/^[a-z0-9-]+$/.test(studioProjectId)) {
	throw new Error("Invalid Sanity Studio project ID format. Use lowercase letters, numbers, and dashes only.");
}

assertStudioEnv(studioApiVersion, "SANITY_STUDIO_API_VERSION, NEXT_PUBLIC_SANITY_API_VERSION");

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
