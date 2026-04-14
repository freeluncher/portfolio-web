import type { Metadata } from "next";
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
import { absoluteUrl } from "@/lib/site";

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const post = await getPost(slug);

	if (!post) {
		return {
			title: "Post Not Found",
			description: "Blog post could not be found.",
		};
	}

	const title = `${post.title} | Blog`;
	const description = post.excerpt || post.title;
	const canonicalPath = `/blog/${post.slug.current}`;

	return {
		title,
		description,
		alternates: {
			canonical: canonicalPath,
		},
		openGraph: {
			title,
			description,
			type: "article",
			url: absoluteUrl(canonicalPath),
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
		},
	};
}

const scholarlyReferenceFallbackBySlug: Record<
	string,
	{
		url: string;
		institutionName: string;
	}
> = {
	"design-and-build-a-briquette-printing-machine-by-modifying-the-screw-conveyor-and-pneumatic": {
		url: "https://etd.polines.ac.id/?p=show_detail&id=14978",
		institutionName: "Politeknik Negeri Semarang",
	},
};

function getResolvedScholarlyReference(post: Post) {
	const fallback = scholarlyReferenceFallbackBySlug[post.slug.current];
	return {
		url: post.scholarlyArticleRef?.url || fallback?.url,
		institutionName: post.scholarlyArticleRef?.institutionName || fallback?.institutionName,
		authors: post.scholarlyArticleRef?.authors,
		yearPublished: post.scholarlyArticleRef?.yearPublished,
	};
}

function generateScholarlyArticleSchema(post: Post) {
	const scholarlyReference = getResolvedScholarlyReference(post);

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
	if (scholarlyReference.url) {
		return {
			...baseSchema,
			isBasedOn: {
				"@context": "https://schema.org",
				"@type": "ScholarlyArticle",
				url: scholarlyReference.url,
				name: scholarlyReference.institutionName || "ETD Document",
				author: scholarlyReference.authors?.map((author) => ({
					"@type": "Person",
					name: author,
				})) || [],
				datePublished: scholarlyReference.yearPublished
					? new Date(scholarlyReference.yearPublished, 0).toISOString()
					: undefined,
				publisher: {
					"@type": "Organization",
					name: scholarlyReference.institutionName || "Academic Institution",
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

	const scholarlyReference = getResolvedScholarlyReference(post);
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
				{scholarlyReference.url && (
					<div className="mb-8 p-4 bg-blue-100 dark:bg-blue-900/40 border border-blue-400/60 dark:border-blue-500/60 rounded-lg shadow-sm">
						<div className="flex items-start gap-3">
							<div className="shrink-0 mt-0.5">
								<svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 0 1 .8 1.6L14.25 8l2.55 3.4A1 1 0 0 1 16 13H6a1 1 0 0 0-1 1v3a1 1 0 1 1-2 0V6z" clipRule="evenodd" />
								</svg>
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Based on Scholarly Work</h3>
								<p className="text-sm text-blue-900 dark:text-blue-100 mb-2">This article is based on an academic research from {scholarlyReference.institutionName || "an academic institution"}.</p>
								{scholarlyReference.authors && scholarlyReference.authors.length > 0 && (
									<p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
										<strong>Authors:</strong> {scholarlyReference.authors.join(", ")}
									</p>
								)}
								<a
									href={scholarlyReference.url}
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
