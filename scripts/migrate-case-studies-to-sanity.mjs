import dotenv from "dotenv";
import { readFile } from "node:fs/promises";

dotenv.config({ path: ".env.local" });
dotenv.config();

const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-01-09";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset) {
	console.error("Missing Sanity project configuration. Set SANITY_PROJECT_ID/SANITY_DATASET or NEXT_PUBLIC_SANITY_PROJECT_ID/NEXT_PUBLIC_SANITY_DATASET.");
	process.exit(1);
}

if (!token) {
	console.error("Missing SANITY_API_WRITE_TOKEN. Create a write token in Sanity project settings and add it to .env.local.");
	process.exit(1);
}

const raw = await readFile(new URL("./case-studies.seed.json", import.meta.url), "utf-8");
const seedItems = JSON.parse(raw);

if (!Array.isArray(seedItems) || seedItems.length === 0) {
	console.error("Seed file is empty. Add at least one case study item.");
	process.exit(1);
}

const mutations = seedItems.map((item) => ({
	createOrReplace: {
		_id: `caseStudy.${item.slug}`,
		_type: "caseStudy",
		title: item.title,
		slug: { _type: "slug", current: item.slug },
		repoName: item.repoName,
		summary: item.summary,
		role: item.role,
		duration: item.duration,
		year: item.year,
		problem: item.problem,
		solution: item.solution,
		impact: item.impact,
		techStack: item.techStack,
		architecture: item.architecture,
		lessons: item.lessons,
		liveUrl: item.liveUrl,
		featured: Boolean(item.featured),
		orderRank: typeof item.orderRank === "number" ? item.orderRank : undefined,
	},
}));

const endpoint = `https://${projectId}.api.sanity.io/${apiVersion}/data/mutate/${dataset}`;
const response = await fetch(endpoint, {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${token}`,
	},
	body: JSON.stringify({ mutations }),
});

if (!response.ok) {
	const details = await response.text();
	console.error("Sanity migration failed:", details);
	process.exit(1);
}

const result = await response.json();
console.log(`Case studies migrated successfully. Documents upserted: ${mutations.length}`);
console.log(JSON.stringify(result, null, 2));
