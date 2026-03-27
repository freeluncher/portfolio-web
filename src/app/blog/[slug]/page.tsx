import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { ReactNode } from "react";
import { FloatingDock } from "@/components/FloatingDock";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { client } from "@/sanity/lib/client";
import { postBySlugQuery, postSlugsQuery } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { Post } from "@/sanity/lib/types";

interface Props {
	params: Promise<{ slug: string }>;
}

async function getPost(slug: string): Promise<Post | null> {
	return await client.fetch(postBySlugQuery, { slug });
}

export async function generateStaticParams() {
	const slugs = await client.fetch(postSlugsQuery);
	return slugs.map((slug: string) => ({ slug }));
}

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
		h2: ({ children }: ChildrenProps) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
		h3: ({ children }: ChildrenProps) => <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>,
		h4: ({ children }: ChildrenProps) => <h4 className="text-lg font-semibold mt-4 mb-2">{children}</h4>,
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
			<a href={value?.href || "#"} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
				{children}
			</a>
		),
		code: ({ children }: ChildrenProps) => <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-sm">{children}</code>,
		strong: ({ children }: ChildrenProps) => <strong className="font-bold">{children}</strong>,
		em: ({ children }: ChildrenProps) => <em className="italic">{children}</em>,
	},
};

export default async function BlogPostPage({ params }: Props) {
	const { slug } = await params;
	const post = await getPost(slug);

	if (!post) {
		notFound();
	}

	return (
		<main className="min-h-screen bg-zinc-50 dark:bg-[#0f0f0f] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 pb-24">
			<div className="fixed top-6 right-6 z-50">
				<ThemeToggle />
			</div>
			<FloatingDock />

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
		</main>
	);
}
