import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { groq } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

interface AutoPublishRequestBody {
	title?: string;
	slug?: string;
	excerpt?: string;
	body?: string;
	tags?: string[];
	publishedAt?: string;
	autoPublish?: boolean;
}

interface ContentQualityInput {
	title: string;
	excerpt?: string;
	body?: string;
	tags?: string[];
}

interface PortableTextBlock {
	_key: string;
	_type: "block";
	style: "normal";
	markDefs: [];
	children: Array<{
		_key: string;
		_type: "span";
		text: string;
		marks: [];
	}>;
}

const writeToken = process.env.SANITY_API_WRITE_TOKEN;
const automationSecret = process.env.BLOG_AUTOPUBLISH_SECRET;

const writeClient = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: false,
	token: writeToken,
});

function slugify(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

function toPortableTextBlocks(input: string): PortableTextBlock[] {
	const paragraphs = input
		.split(/\n\n+/)
		.map((p) => p.trim())
		.filter(Boolean);

	if (paragraphs.length === 0) {
		return [
			{
				_key: crypto.randomUUID(),
				_type: "block",
				style: "normal",
				markDefs: [],
				children: [
					{
						_key: crypto.randomUUID(),
						_type: "span",
						text: "",
						marks: [],
					},
				],
			},
		];
	}

	return paragraphs.map((paragraph) => ({
		_key: crypto.randomUUID(),
		_type: "block",
		style: "normal",
		markDefs: [],
		children: [
			{
				_key: crypto.randomUUID(),
				_type: "span",
				text: paragraph,
				marks: [],
			},
		],
	}));
}

function countWords(input: string): number {
	return input
		.trim()
		.split(/\s+/)
		.filter(Boolean).length;
}

function validateContentQuality(input: ContentQualityInput): string[] {
	const issues: string[] = [];
	const titleLength = input.title.trim().length;

	if (titleLength < 8 || titleLength > 110) {
		issues.push("Title must be between 8 and 110 characters.");
	}

	if (!input.excerpt || input.excerpt.trim().length < 60 || input.excerpt.trim().length > 240) {
		issues.push("Excerpt must be between 60 and 240 characters for published posts.");
	}

	const body = (input.body || "").trim();
	const bodyWordCount = countWords(body);
	if (bodyWordCount < 180) {
		issues.push("Body must contain at least 180 words for published posts.");
	}

	const paragraphCount = body
		.split(/\n\n+/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean).length;
	if (paragraphCount < 3) {
		issues.push("Body should contain at least 3 paragraphs.");
	}

	const tags = input.tags || [];
	if (tags.length < 2 || tags.length > 6) {
		issues.push("Tags must contain between 2 and 6 items.");
	}

	const uniqueTags = new Set(tags.map((tag) => tag.toLowerCase()));
	if (uniqueTags.size !== tags.length) {
		issues.push("Tags must not contain duplicates.");
	}

	const placeholderRegex = /(lorem ipsum|\btbd\b|\btodo\b|coming soon)/i;
	if (placeholderRegex.test(`${input.title}\n${input.excerpt || ""}\n${body}`)) {
		issues.push("Content still contains placeholder text (e.g. TODO, TBD, Lorem Ipsum).");
	}

	return issues;
}

async function buildUniqueSlug(preferredSlug: string): Promise<string> {
	const existingCount = await writeClient.fetch<number>(groq`count(*[_type == "post" && slug.current == $slug])`, { slug: preferredSlug });

	if (existingCount === 0) {
		return preferredSlug;
	}

	return `${preferredSlug}-${Date.now()}`;
}

export async function POST(request: NextRequest) {
	if (!automationSecret) {
		return NextResponse.json({ ok: false, message: "Missing BLOG_AUTOPUBLISH_SECRET." }, { status: 500 });
	}

	if (!writeToken) {
		return NextResponse.json({ ok: false, message: "Missing SANITY_API_WRITE_TOKEN." }, { status: 500 });
	}

	const providedSecret = request.headers.get("x-blog-automation-secret") || request.nextUrl.searchParams.get("secret");
	if (!providedSecret || providedSecret !== automationSecret) {
		return NextResponse.json({ ok: false, message: "Invalid secret." }, { status: 401 });
	}

	let payload: AutoPublishRequestBody;
	try {
		payload = (await request.json()) as AutoPublishRequestBody;
	} catch {
		return NextResponse.json({ ok: false, message: "Invalid JSON payload." }, { status: 400 });
	}

	const title = payload.title?.trim();
	if (!title) {
		return NextResponse.json({ ok: false, message: "Field 'title' is required." }, { status: 400 });
	}

	const normalizedSlugInput = slugify(payload.slug?.trim() || title);
	if (!normalizedSlugInput) {
		return NextResponse.json({ ok: false, message: "Unable to generate a valid slug from title." }, { status: 400 });
	}

	const slug = await buildUniqueSlug(normalizedSlugInput);
	const postId = crypto.randomUUID();
	const draftId = `drafts.${postId}`;
	const publishNow = payload.autoPublish !== false;

	const excerpt = payload.excerpt?.trim();
	const bodyText = payload.body?.trim() || "";
	const tags = Array.isArray(payload.tags)
		? payload.tags.map((tag) => tag.trim()).filter(Boolean)
		: undefined;

	if (publishNow) {
		const qualityIssues = validateContentQuality({
			title,
			excerpt,
			body: bodyText,
			tags,
		});

		if (qualityIssues.length > 0) {
			return NextResponse.json(
				{
					ok: false,
					message: "Content quality validation failed. Post was not published.",
					issues: qualityIssues,
				},
				{ status: 422 }
			);
		}
	}

	const draftDoc = {
		_id: draftId,
		_type: "post",
		title,
		slug: {
			_type: "slug",
			current: slug,
		},
		publishedAt: payload.publishedAt || new Date().toISOString(),
		...(excerpt ? { excerpt } : {}),
		...(bodyText ? { body: toPortableTextBlocks(bodyText) } : {}),
		...(tags && tags.length > 0 ? { tags } : {}),
	};

	await writeClient.create(draftDoc);

	if (publishNow) {
		const publishedDoc = {
			...draftDoc,
			_id: postId,
		};

		await writeClient.transaction().createOrReplace(publishedDoc).delete(draftId).commit();
	}

	revalidateTag("posts", "max");
	revalidatePath("/blog");
	revalidateTag(`post:${slug}`, "max");
	revalidatePath(`/blog/${slug}`);

	return NextResponse.json({
		ok: true,
		post: {
			id: publishNow ? postId : draftId,
			slug,
			status: publishNow ? "published" : "draft",
			url: `/blog/${slug}`,
		},
	});
}
