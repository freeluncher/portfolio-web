import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

function normalizeEnvValue(value) {
	if (!value) return undefined;
	let normalized = String(value).trim();
	if (!normalized) return undefined;

	normalized = normalized.replace(/\s+\/\/.*$/, "").trim();

	if ((normalized.startsWith('"') && normalized.endsWith('"')) || (normalized.startsWith("'") && normalized.endsWith("'"))) {
		normalized = normalized.slice(1, -1).trim();
	}

	return normalized || undefined;
}

const projectId = normalizeEnvValue(process.env.SANITY_PROJECT_ID) || normalizeEnvValue(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
const dataset = normalizeEnvValue(process.env.SANITY_DATASET) || normalizeEnvValue(process.env.NEXT_PUBLIC_SANITY_DATASET);
const apiVersion = normalizeEnvValue(process.env.NEXT_PUBLIC_SANITY_API_VERSION) || "2026-01-09";
const token = normalizeEnvValue(process.env.SANITY_API_WRITE_TOKEN);
const apiVersionPath = apiVersion.startsWith("v") ? apiVersion : `v${apiVersion}`;

const isDryRun = process.argv.includes("--dry-run");

if (!projectId || !dataset) {
	console.error("Missing Sanity project configuration. Set SANITY_PROJECT_ID/SANITY_DATASET or NEXT_PUBLIC_SANITY_PROJECT_ID/NEXT_PUBLIC_SANITY_DATASET.");
	process.exit(1);
}

if (!token) {
	console.error("Missing SANITY_API_WRITE_TOKEN. Create a write token in Sanity project settings and add it to .env.local.");
	process.exit(1);
}

function toIdSegment(value, fallback) {
	const normalized = String(value || "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 32);

	return normalized || fallback;
}

function createKey(prefix, index) {
	return `${prefix}-${String(index + 1).padStart(2, "0")}`;
}

function summarizeLabel(text, index) {
	const trimmed = String(text || "").trim();
	if (!trimmed) {
		return `Layer ${index + 1}`;
	}

	const delimiterParts = trimmed.split(/[:|-]/).map((part) => part.trim()).filter(Boolean);
	if (delimiterParts.length > 0 && delimiterParts[0].length <= 44) {
		return delimiterParts[0];
	}

	const words = trimmed.split(/\s+/).filter(Boolean);
	const candidate = words.slice(0, 4).join(" ");
	return candidate.length > 0 ? candidate : `Layer ${index + 1}`;
}

function buildGraphFromArchitecture(caseStudy) {
	const architectureItems = Array.isArray(caseStudy.architecture)
		? caseStudy.architecture.map((item) => String(item || "").trim()).filter(Boolean)
		: [];

	const baseItems = architectureItems.length > 0
		? architectureItems
		: [
			"Visitor request enters the application.",
			"Application layer processes request and business logic.",
			"Data layer stores and serves persisted information.",
		];

	const nodes = [];
	const edges = [];

	for (let index = 0; index < baseItems.length; index += 1) {
		const item = baseItems[index];
		const label = summarizeLabel(item, index);
		const architectureId = `arch-${toIdSegment(label, `layer-${index + 1}`)}`;
		const detailId = `detail-${toIdSegment(label, `layer-${index + 1}`)}`;

		nodes.push({
			_type: "architectureGraphNode",
			_key: createKey("arch-node", index),
			id: architectureId,
			kind: "architecture",
			label,
			subtitle: `Layer ${index + 1}`,
			details: item,
			position: {
				x: 44 + index * 240,
				y: 56,
			},
		});

		nodes.push({
			_type: "architectureGraphNode",
			_key: createKey("detail-node", index),
			id: detailId,
			kind: "detail",
			label: `${label} Detail`,
			subtitle: "Detail",
			details: item,
			position: {
				x: 44 + index * 240,
				y: 232,
			},
		});

		edges.push({
			_type: "architectureGraphEdge",
			_key: createKey("detail-edge", index),
			id: `edge-${architectureId}-${detailId}`,
			source: architectureId,
			target: detailId,
			animated: true,
		});

		if (index > 0) {
			const prevLabel = summarizeLabel(baseItems[index - 1], index - 1);
			const prevArchitectureId = `arch-${toIdSegment(prevLabel, `layer-${index}`)}`;
			edges.push({
				_type: "architectureGraphEdge",
				_key: createKey("flow-edge", index),
				id: `edge-${prevArchitectureId}-${architectureId}`,
				source: prevArchitectureId,
				target: architectureId,
				animated: true,
			});
		}
	}

	return {
		_type: "architectureGraph",
		nodes,
		edges,
	};
}

const query = `*[_type == "caseStudy" && (!defined(architectureGraph) || count(coalesce(architectureGraph.nodes, [])) == 0)]{_id, title, architecture}`;
const queryEndpoint = `https://${projectId}.api.sanity.io/${apiVersionPath}/data/query/${dataset}?query=${encodeURIComponent(query)}`;

const queryResponse = await fetch(queryEndpoint, {
	headers: {
		Authorization: `Bearer ${token}`,
	},
});

if (!queryResponse.ok) {
	const details = await queryResponse.text();
	console.error("Failed to read case studies:", details);
	process.exit(1);
}

const queryResult = await queryResponse.json();
const caseStudies = Array.isArray(queryResult.result) ? queryResult.result : [];

if (caseStudies.length === 0) {
	console.log("No legacy case studies need architectureGraph migration.");
	process.exit(0);
}

const mutations = caseStudies.map((caseStudy) => ({
	patch: {
		id: caseStudy._id,
		set: {
			architectureGraph: buildGraphFromArchitecture(caseStudy),
		},
	},
}));

if (isDryRun) {
	console.log(`Dry run: ${mutations.length} case studies will be patched with architectureGraph.`);
	console.log(JSON.stringify(mutations.slice(0, 2), null, 2));
	process.exit(0);
}

const mutateEndpoint = `https://${projectId}.api.sanity.io/${apiVersionPath}/data/mutate/${dataset}`;
const mutateResponse = await fetch(mutateEndpoint, {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${token}`,
	},
	body: JSON.stringify({ mutations }),
});

if (!mutateResponse.ok) {
	const details = await mutateResponse.text();
	console.error("Architecture graph migration failed:", details);
	process.exit(1);
}

const mutateResult = await mutateResponse.json();
console.log(`Architecture graph migration completed. Documents updated: ${mutations.length}`);
console.log(JSON.stringify(mutateResult, null, 2));