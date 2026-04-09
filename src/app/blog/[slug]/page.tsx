import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import SiteShell from "@/components/layout/SiteShell";
import { blogPortableTextComponents } from "@/components/portable-text/blogPortableText";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { postBySlugQuery, postSlugsQuery } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { Post } from "@/sanity/lib/types";
import { sanityFetch } from "@/sanity/lib/fetch";

interface Props {
	params: Promise<{ slug: string }>;
}

async function getPost(slug: string): Promise<Post | null> {
	const { data } = await sanityFetch({
		query: postBySlugQuery,
		params: { slug },
		tags: ["posts", `post:${slug}`],
		perspective: "published",
		stega: false,
		cacheMode: "revalidate",
		revalidate: 300,
	});

	return (data as Post | null) ?? null;
}

export async function generateStaticParams() {
	const { data: slugs } = await sanityFetch({
		query: postSlugsQuery,
		tags: ["posts"],
		perspective: "published",
		stega: false,
		cacheMode: "revalidate",
		revalidate: 300,
	});

	return (slugs as string[]).map((slug: string) => ({ slug }));
}

export const revalidate = 0;

export default async function BlogPostPage({ params }: Props) {
	const { slug } = await params;
	const post = await getPost(slug);

	if (!post) {
		notFound();
	}

	return (
		<SiteShell>
			<article className="max-w-3xl mx-auto px-4 py-12 md:py-20">
				{/* Back Link */}
				<Link href="/blog" className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 transition-colors">
					<ArrowLeft className="w-4 h-4" />
					Back to Blog
				</Link>

				{/* Header */}
				<header className="mb-8">
					<h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

					<div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
						{post.publishedAt && (
							<div className="flex items-center gap-1.5">
								<Calendar className="w-4 h-4" />
								<span>
									{new Date(post.publishedAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</span>
							</div>
						)}

						{post.tags && post.tags.length > 0 && (
							<div className="flex items-center gap-2">
								<Tag className="w-4 h-4" />
								<div className="flex gap-2">
									{post.tags.map((tag) => (
										<span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800">
											{tag}
										</span>
									))}
								</div>
							</div>
						)}
					</div>
				</header>

				{/* Main Image */}
				{post.mainImage && (
					<div className="relative w-full h-64 md:h-96 mb-8 rounded-2xl overflow-hidden">
						<Image src={urlFor(post.mainImage).width(1200).height(600).url()} alt={post.title} fill className="object-cover" priority />
					</div>
				)}

				{/* Body Content */}
				<div className="prose prose-zinc dark:prose-invert max-w-none">{post.body && <PortableText value={post.body} components={blogPortableTextComponents} />}</div>
			</article>
		</SiteShell>
	);
}
