import { NextRequest, NextResponse } from "next/server";

interface GenerateRequestBody {
	prompt?: string;
	autoPublish?: boolean;
	language?: string;
	tone?: string;
	tags?: string[];
}

interface GeneratedArticle {
	title: string;
	excerpt: string;
	body: string;
	tags: string[];
}

const openAiApiKey = process.env.OPENAI_API_KEY;
const openAiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
const automationSecret = process.env.BLOG_AUTOPUBLISH_SECRET;

function parseGeneratedArticle(raw: unknown): GeneratedArticle | null {
	if (!raw || typeof raw !== "object") {
		return null;
	}

	const data = raw as Partial<GeneratedArticle>;
	if (typeof data.title !== "string" || typeof data.excerpt !== "string" || typeof data.body !== "string" || !Array.isArray(data.tags)) {
		return null;
	}

	const tags = data.tags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean);
	if (tags.length === 0) {
		return null;
	}

	return {
		title: data.title.trim(),
		excerpt: data.excerpt.trim(),
		body: data.body.trim(),
		tags,
	};
}

async function generateArticleFromPrompt(payload: GenerateRequestBody): Promise<GeneratedArticle> {
	if (!openAiApiKey) {
		throw new Error("Missing OPENAI_API_KEY.");
	}

	const prompt = payload.prompt?.trim();
	if (!prompt) {
		throw new Error("Field 'prompt' is required.");
	}

	const language = payload.language?.trim() || "Indonesian";
	const tone = payload.tone?.trim() || "professional and practical";

	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${openAiApiKey}`,
		},
		body: JSON.stringify({
			model: openAiModel,
			temperature: 0.7,
			messages: [
				{
					role: "system",
					content:
						"You are a senior technical writer. Return only valid JSON with keys: title, excerpt, body, tags. The body must have at least 3 paragraphs and at least 180 words. Excerpt length must be 60-240 chars. Tags must contain 2-6 short tags.",
				},
				{
					role: "user",
					content: `Write a high-quality blog article in ${language} with a ${tone} tone.\n\nTopic prompt: ${prompt}`,
				},
			],
			response_format: {
				type: "json_object",
			},
		}),
	});

	if (!response.ok) {
		throw new Error(`OpenAI request failed with status ${response.status}.`);
	}

	const completion = (await response.json()) as {
		choices?: Array<{
			message?: {
				content?: string;
			};
		}>;
	};

	const rawContent = completion.choices?.[0]?.message?.content;
	if (!rawContent) {
		throw new Error("AI response is empty.");
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(rawContent);
	} catch {
		throw new Error("AI response is not valid JSON.");
	}

	const article = parseGeneratedArticle(parsed);
	if (!article) {
		throw new Error("AI response format is invalid.");
	}

	if (Array.isArray(payload.tags) && payload.tags.length > 0) {
		const requestedTags = payload.tags.map((tag) => tag.trim()).filter(Boolean);
		if (requestedTags.length > 0) {
			article.tags = requestedTags;
		}
	}

	return article;
}

export async function POST(request: NextRequest) {
	if (!automationSecret) {
		return NextResponse.json({ ok: false, message: "Missing BLOG_AUTOPUBLISH_SECRET." }, { status: 500 });
	}

	let payload: GenerateRequestBody;
	try {
		payload = (await request.json()) as GenerateRequestBody;
	} catch {
		return NextResponse.json({ ok: false, message: "Invalid JSON payload." }, { status: 400 });
	}

	let article: GeneratedArticle;
	try {
		article = await generateArticleFromPrompt(payload);
	} catch (error) {
		return NextResponse.json(
			{ ok: false, message: error instanceof Error ? error.message : "Failed to generate article." },
			{ status: 400 }
		);
	}

	const publishResponse = await fetch(new URL("/api/blog/auto-publish", request.nextUrl.origin), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-blog-automation-secret": automationSecret,
		},
		body: JSON.stringify({
			title: article.title,
			excerpt: article.excerpt,
			body: article.body,
			tags: article.tags,
			autoPublish: payload.autoPublish !== false,
		}),
	});

	const publishResult = (await publishResponse.json()) as Record<string, unknown>;
	if (!publishResponse.ok) {
		return NextResponse.json(
			{
				ok: false,
				message: "Generated content failed auto-publish validation.",
				publishResult,
			},
			{ status: publishResponse.status }
		);
	}

	return NextResponse.json({
		ok: true,
		message: "Article generated and forwarded to auto-publish route.",
		article,
		publishResult,
	});
}
