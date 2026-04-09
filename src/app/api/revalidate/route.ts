import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

interface SanityWebhookBody {
	_type?: string;
	slug?: {
		current?: string;
	};
}

export async function POST(request: Request) {
	const secret = process.env.SANITY_REVALIDATE_SECRET;
	const providedSecret = request.headers.get("x-sanity-webhook-secret") || request.nextUrl.searchParams.get("secret");

	if (!secret) {
		return NextResponse.json({ ok: false, message: "Missing SANITY_REVALIDATE_SECRET." }, { status: 500 });
	}

	if (!providedSecret || providedSecret !== secret) {
		return NextResponse.json({ ok: false, message: "Invalid secret." }, { status: 401 });
	}

	let body: SanityWebhookBody = {};
	try {
		body = (await request.json()) as SanityWebhookBody;
	} catch {
		body = {};
	}

	revalidateTag("posts");
	revalidatePath("/blog");

	const slug = body.slug?.current;
	if (slug) {
		revalidateTag(`post:${slug}`);
		revalidatePath(`/blog/${slug}`);
	}

	return NextResponse.json({
		ok: true,
		revalidated: {
			type: body._type || null,
			slug: slug || null,
		},
	});
}
