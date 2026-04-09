import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { ReactNode } from "react";
import SiteShell from "@/components/layout/SiteShell";
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

interface PortableImageValue {
	asset?: { _ref?: string };
	alt?: string;
	caption?: string;
}

interface PortableCodeValue {
	filename?: string;
	code?: string;
}

interface PortableTableRow {
	cells: string[];
}

interface PortableTableValue {
	rows?: PortableTableRow[];
}

interface PortableLinkMark {
	href?: string;
	openInNewTab?: boolean;
}

interface PortableInternalLinkMark {
	refType?: string;
	label?: string;
	fallbackHref?: string;
	slug?: {
		current?: string;
	};
	reference?: {
		slug?: {
			current?: string;
		};
	};
}

interface ChildrenProps {
	children?: ReactNode;
}

// Portable Text components for rendering
const components: PortableTextComponents = {
	types: {
		image: ({ value }: { value: PortableImageValue }) => {
			if (!value?.asset?._ref) return null;
			return (
				<div className="my-8 rounded-xl overflow-hidden">
					<Image src={urlFor(value).width(800).url()} alt={value.alt || "Blog image"} width={800} height={400} className="w-full object-cover" />
					{value.caption && <p className="text-center text-sm text-zinc-500 mt-2">{value.caption}</p>}
				</div>
			);
		},
		code: ({ value }: { value: PortableCodeValue }) => {
			return (
				<div className="my-6 rounded-xl overflow-hidden bg-zinc-900 dark:bg-zinc-950">
					{value.filename && <div className="px-4 py-2 bg-zinc-800 text-zinc-400 text-xs font-mono border-b border-zinc-700">{value.filename}</div>}
					<pre className="p-4 overflow-x-auto">
						<code className="text-sm font-mono text-zinc-100">{value.code}</code>
					</pre>
				</div>
			);
		},
		table: ({ value }: { value: PortableTableValue }) => {
			if (!value?.rows) return null;
			return (
				<div className="my-6 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
					<table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
						<tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
							{value.rows.map((row: PortableTableRow, rowIndex: number) => (
								<tr key={rowIndex} className={rowIndex === 0 ? "bg-zinc-100 dark:bg-zinc-800 font-semibold" : ""}>
									{row.cells.map((cell: string, cellIndex: number) => (
										<td key={cellIndex} className="px-4 py-3 text-sm">
											{cell}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		},
	},
	block: {
		h1: ({ children }: ChildrenProps) => <h1 className="text-3xl font-bold mt-10 mb-5">{children}</h1>,
		h2: ({ children }: ChildrenProps) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
		h3: ({ children }: ChildrenProps) => <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>,
		h4: ({ children }: ChildrenProps) => <h4 className="text-lg font-semibold mt-4 mb-2">{children}</h4>,
		h5: ({ children }: ChildrenProps) => <h5 className="text-base font-semibold mt-3 mb-2">{children}</h5>,
		h6: ({ children }: ChildrenProps) => <h6 className="text-sm font-semibold mt-3 mb-2 uppercase tracking-wide">{children}</h6>,
		blockquote: ({ children }: ChildrenProps) => <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-zinc-600 dark:text-zinc-400">{children}</blockquote>,
		normal: ({ children }: ChildrenProps) => <p className="mb-4 leading-relaxed">{children}</p>,
	},
	list: {
		bullet: ({ children }: ChildrenProps) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
		number: ({ children }: ChildrenProps) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
	},
	listItem: {
		bullet: ({ children }: ChildrenProps) => <li className="leading-relaxed">{children}</li>,
		number: ({ children }: ChildrenProps) => <li className="leading-relaxed">{children}</li>,
	},
	marks: {
		link: ({ children, value }: { children?: ReactNode; value?: PortableLinkMark }) => (
			<a href={value?.href || "#"} target={value?.openInNewTab === false ? undefined : "_blank"} rel={value?.openInNewTab === false ? undefined : "noopener noreferrer"} className="text-blue-500 hover:underline">
				{children}
			</a>
		),
		internalLink: ({ children, value }: { children?: ReactNode; value?: PortableInternalLinkMark }) => {
			const slug = value?.slug?.current || value?.reference?.slug?.current;
			if (!slug && !value?.fallbackHref) return <>{children}</>;

			const href = slug ? (value?.refType === "caseStudy" ? `/projects/${slug}` : `/blog/${slug}`) : value?.fallbackHref || "#";
            const isExternal = /^https?:\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");

			if (isExternal) {
				return (
					<a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" title={value?.label || undefined}>
						{children}
					</a>
				);
			}

			return (
				<Link href={href} className="text-blue-500 hover:underline" title={value?.label || undefined}>
					{children}
				</Link>
			);
		},
		code: ({ children }: ChildrenProps) => <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-sm">{children}</code>,
		strong: ({ children }: ChildrenProps) => <strong className="font-bold">{children}</strong>,
		em: ({ children }: ChildrenProps) => <em className="italic">{children}</em>,
		underline: ({ children }: ChildrenProps) => <span className="underline">{children}</span>,
		"strike-through": ({ children }: ChildrenProps) => <span className="line-through">{children}</span>,
	},
};

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
				<div className="prose prose-zinc dark:prose-invert max-w-none">{post.body && <PortableText value={post.body} components={components} />}</div>
			</article>
		</SiteShell>
	);
}
