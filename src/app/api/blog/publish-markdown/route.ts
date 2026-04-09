import { NextRequest, NextResponse } from "next/server";

interface PublishMarkdownRequestBody {
	markdown?: string;
	autoPublish?: boolean;
}

interface ParsedMarkdownPost {
	title: string;
	slug?: string;
	excerpt?: string;
	tags?: string[];
	publishedAt?: string;
	body: string;
}

const automationSecret = process.env.BLOG_AUTOPUBLISH_SECRET;

function parseFrontmatter(markdown: string): { metadata: Record<string, string>; content: string } {
	if (!markdown.startsWith("---\n")) {
		return { metadata: {}, content: markdown };
	}

	const end = markdown.indexOf("\n---\n", 4);
	if (end === -1) {
		return { metadata: {}, content: markdown };
	}

	const frontmatterRaw = markdown.slice(4, end);
	const content = markdown.slice(end + 5);
	const metadata: Record<string, string> = {};

	for (const line of frontmatterRaw.split("\n")) {
		const separatorIndex = line.indexOf(":");
		if (separatorIndex === -1) {
			continue;
		}

		const key = line.slice(0, separatorIndex).trim();
		const value = line.slice(separatorIndex + 1).trim();
		if (!key || !value) {
			continue;
		}

		metadata[key.toLowerCase()] = value.replace(/^['\"]|['\"]$/g, "");
	}

	return { metadata, content };
}

function parseTags(raw?: string): string[] | undefined {
	if (!raw) {
		return undefined;
	}

	const normalized = raw.trim();
	if (!normalized) {
		return undefined;
	}

	const cleaned = normalized.replace(/^\[/, "").replace(/\]$/, "");
	const tags = cleaned
		.split(",")
		.map((tag) => tag.trim().replace(/^['\"]|['\"]$/g, ""))
		.filter(Boolean);

	return tags.length > 0 ? tags : undefined;
}

function markdownToBodyText(markdown: string): string {
	return markdown
		.replace(/```[\s\S]*?```/g, "")
		.replace(/`([^`]+)`/g, "$1")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
		.replace(/^#{1,6}\s+/gm, "")
		.replace(/^>\s?/gm, "")
		.replace(/^[-*+]\s+/gm, "")
		.replace(/^\d+\.\s+/gm, "")
		.replace(/\*\*([^*]+)\*\*/g, "$1")
		.replace(/\*([^*]+)\*/g, "$1")
		.replace(/\r/g, "")
		.trim();
}

function buildExcerpt(content: string): string {
	const normalized = content.replace(/\n+/g, " ").trim();
	if (normalized.length <= 180) {
		return normalized;
	}

	return `${normalized.slice(0, 177).trim()}...`;
}

function parseMarkdownPost(markdown: string): ParsedMarkdownPost | null {
	const { metadata, content } = parseFrontmatter(markdown.trim());
	const body = markdownToBodyText(content);

	const firstHeading = content
		.split("\n")
		.map((line) => line.trim())
		.find((line) => line.startsWith("# "))
		?.replace(/^#\s+/, "")
		.trim();

	const title = metadata.title || firstHeading;
	if (!title || !body) {
		return null;
	}

	const excerpt = metadata.excerpt || metadata.description || buildExcerpt(body);

	return {
		title,
		slug: metadata.slug,
		excerpt,
		tags: parseTags(metadata.tags),
		publishedAt: metadata.publishedat || metadata.date,
		body,
	};
}

export async function POST(request: NextRequest) {
	if (!automationSecret) {
		return NextResponse.json({ ok: false, message: "Missing BLOG_AUTOPUBLISH_SECRET." }, { status: 500 });
	}

	const providedSecret = request.headers.get("x-blog-automation-secret") || request.nextUrl.searchParams.get("secret");
	if (!providedSecret || providedSecret !== automationSecret) {
		return NextResponse.json({ ok: false, message: "Invalid secret." }, { status: 401 });
	}

	let payload: PublishMarkdownRequestBody;
	try {
		payload = (await request.json()) as PublishMarkdownRequestBody;
	} catch {
		return NextResponse.json({ ok: false, message: "Invalid JSON payload." }, { status: 400 });
	}

	const markdown = payload.markdown?.trim();
	if (!markdown) {
		return NextResponse.json({ ok: false, message: "Field 'markdown' is required." }, { status: 400 });
	}

	const parsed = parseMarkdownPost(markdown);
	if (!parsed) {
		return NextResponse.json(
			{ ok: false, message: "Unable to parse markdown. Ensure it has a title (frontmatter title or '# Heading') and body content." },
			{ status: 400 }
		);
	}

	const autoPublishResponse = await fetch(new URL("/api/blog/auto-publish", request.nextUrl.origin), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-blog-automation-secret": automationSecret,
		},
		body: JSON.stringify({
			title: parsed.title,
			slug: parsed.slug,
			excerpt: parsed.excerpt,
			tags: parsed.tags,
			publishedAt: parsed.publishedAt,
			body: parsed.body,
			autoPublish: payload.autoPublish !== false,
		}),
	});

	const publishResult = (await autoPublishResponse.json()) as Record<string, unknown>;
	if (!autoPublishResponse.ok) {
		return NextResponse.json(
			{
				ok: false,
				message: "Markdown parsed, but publish failed validation.",
				publishResult,
			},
			{ status: autoPublishResponse.status }
		);
	}

	return NextResponse.json({
		ok: true,
		message: "Markdown article parsed and sent to auto-publish.",
		parsed: {
			title: parsed.title,
			slug: parsed.slug || null,
			tags: parsed.tags || [],
		},
		publishResult,
	});
}
