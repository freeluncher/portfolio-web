import Link from "next/link";
import Image from "next/image";
import { BentoGrid, BentoCard } from "@/components/BentoGrid";
import { FloatingDock } from "@/components/FloatingDock";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, BookOpen, Calendar } from "lucide-react";
import { client } from "@/sanity/lib/client";
import { postsQuery } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { Post } from "@/sanity/lib/types";

async function getPosts(): Promise<Post[]> {
	return await client.fetch(postsQuery);
}

export default async function BlogPage() {
	const posts = await getPosts();

	return (
		<main className="min-h-screen bg-zinc-50 dark:bg-[#0f0f0f] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 pb-24">
			<div className="fixed top-6 right-6 z-50">
				<ThemeToggle />
			</div>
			<FloatingDock />

			<div className="py-12 md:py-20">
				<BentoGrid>
					{/* Header Card */}
					<BentoCard colSpan={3} className="text-center">
						<Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4 transition-colors">
							<ArrowLeft className="w-4 h-4" />
							Back to Home
						</Link>
						<h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
						<p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">Articles, tutorials, and thoughts on web development.</p>
					</BentoCard>

					{/* Blog Posts */}
					{posts.length > 0 ? (
						posts.map((post, index) => (
							<BentoCard key={post._id} colSpan={index === 0 ? 2 : 1} className="group">
								<Link href={`/blog/${post.slug.current}`} className="block h-full">
									{post.mainImage && (
										<div className="relative w-full h-40 mb-4 rounded-xl overflow-hidden">
											<Image src={urlFor(post.mainImage).width(600).height(400).url()} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
										</div>
									)}
									<div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-2">
										<Calendar className="w-3 h-3" />
										<span>
											{post.publishedAt
												? new Date(post.publishedAt).toLocaleDateString("en-US", {
														year: "numeric",
														month: "short",
														day: "numeric",
													})
												: "Draft"}
										</span>
									</div>
									<h3 className="font-bold text-lg mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{post.title}</h3>
									{post.excerpt && <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">{post.excerpt}</p>}
									{post.tags && post.tags.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{post.tags.slice(0, 3).map((tag) => (
												<span key={tag} className="px-2 py-1 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800">
													{tag}
												</span>
											))}
										</div>
									)}
								</Link>
							</BentoCard>
						))
					) : (
						<BentoCard colSpan={3} className="text-center py-12">
							<BookOpen className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
							<h3 className="font-bold text-xl mb-2">No Posts Yet</h3>
							<p className="text-zinc-500 dark:text-zinc-400">
								Check back soon for new content! Visit{" "}
								<Link href="/admin" className="text-blue-500 hover:underline">
									/admin
								</Link>{" "}
								to create your first post.
							</p>
						</BentoCard>
					)}
				</BentoGrid>
			</div>
		</main>
	);
}
