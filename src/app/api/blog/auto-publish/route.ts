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
