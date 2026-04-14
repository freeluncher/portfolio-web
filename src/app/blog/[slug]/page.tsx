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

function generateScholarlyArticleSchema(post: Post) {
	const baseSchema = {
		"@context": "https://schema.org",
		"@type": "ScholarlyArticle",
		headline: post.title,
		description: post.excerpt || post.title,
		datePublished: post.publishedAt,
		dateModified: post.publishedAt,
		image: post.mainImage ? urlFor(post.mainImage).width(1200).height(600).url() : undefined,
		author: {
			"@type": "Person",
			name: "Gasawa Dev",
		},
		keywords: post.tags?.join(", ") || "",
	};

	// Add scholarly article reference if available
	if (post.scholarlyArticleRef?.url) {
		return {
			...baseSchema,
			isBasedOn: {
				"@context": "https://schema.org",
				"@type": "ScholarlyArticle",
				url: post.scholarlyArticleRef.url,
				name: post.scholarlyArticleRef.institutionName || "ETD Document",
				author: post.scholarlyArticleRef.authors?.map((author) => ({
					"@type": "Person",
					name: author,
				})) || [],
				datePublished: post.scholarlyArticleRef.yearPublished
					? new Date(post.scholarlyArticleRef.yearPublished, 0).toISOString()
					: undefined,
				publisher: {
					"@type": "Organization",
					name: post.scholarlyArticleRef.institutionName || "Academic Institution",
				},
			},
		};
	}

	return baseSchema;
}

export default async function BlogPostPage({ params }: Props) {
	const { slug } = await params;
	const post = await getPost(slug);

	if (!post) {
		notFound();
	}

	const schema = generateScholarlyArticleSchema(post);

	return (
		<SiteShell>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(schema),
				}}
			/>
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

				{/* Scholarly Article Reference */}
				{post.scholarlyArticleRef?.url && (
					<div className="mb-8 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
						<div className="flex items-start gap-3">
							<div className="flex-shrink-0 mt-0.5">
								<svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 0 1 .8 1.6L14.25 8l2.55 3.4A1 1 0 0 1 16 13H6a1 1 0 0 0-1 1v3a1 1 0 1 1-2 0V6z" clipRule="evenodd" />
								</svg>
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Based on Scholarly Work</h3>
								<p className="text-sm text-blue-800 dark:text-blue-200 mb-2">This article is based on an academic research from {post.scholarlyArticleRef.institutionName || "an academic institution"}.</p>
								{post.scholarlyArticleRef.authors && post.scholarlyArticleRef.authors.length > 0 && (
									<p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
										<strong>Authors:</strong> {post.scholarlyArticleRef.authors.join(", ")}
									</p>
								)}
								<a
									href={post.scholarlyArticleRef.url}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
								>
									View ETD/Thesis
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
									</svg>
								</a>
							</div>
						</div>
					</div>
				)}

				{/* Main Image */}
				{post.mainImage && (
					<div className="relative w-full h-64 md:h-96 mb-8 rounded-2xl overflow-hidden">
						<Image src={urlFor(post.mainImage).width(1200).height(600).url()} alt={post.title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority />
					</div>
				)}

				{/* Body Content */}
				<div className="prose prose-zinc dark:prose-invert max-w-none">{post.body && <PortableText value={post.body} components={blogPortableTextComponents} />}</div>
			</article>
		</SiteShell>
	);
}
