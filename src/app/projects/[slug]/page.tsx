import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarDays, Hammer, Layers, Lightbulb, TrendingUp, User } from "lucide-react";
import { FloatingDock } from "@/components/FloatingDock";
import { ThemeToggle } from "@/components/ThemeToggle";
import { profile } from "@/lib/profile";
import { absoluteUrl } from "@/lib/site";
import { caseStudyBySlugQuery, caseStudySlugsQuery } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/fetch";
import type { CaseStudy } from "@/sanity/lib/types";

interface Props {
	params: Promise<{ slug: string }>;
}

async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
	const perspective = process.env.NODE_ENV === "development" ? "previewDrafts" : "published";

	const { data } = await sanityFetch({
		query: caseStudyBySlugQuery,
		params: { slug },
		tags: ["caseStudies", `caseStudy:${slug}`],
		perspective,
		stega: false,
	});

	return (data as CaseStudy | null) ?? null;
}

export function generateStaticParams() {
	const perspective = process.env.NODE_ENV === "development" ? "previewDrafts" : "published";

	return sanityFetch({
		query: caseStudySlugsQuery,
		tags: ["caseStudies"],
		perspective,
		stega: false,
	}).then(({ data }) => ((data as string[]) ?? []).map((slug) => ({ slug })));
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const caseStudy = await getCaseStudyBySlug(slug);

	if (!caseStudy) {
		return {
			title: "Case Study Not Found",
			description: "Project case study could not be found.",
		};
	}

	return {
		title: `${caseStudy.title} | Case Study`,
		description: caseStudy.summary,
		alternates: {
			canonical: `/projects/${caseStudy.slug.current}`,
		},
		openGraph: {
			title: `${caseStudy.title} | Case Study`,
			description: caseStudy.summary,
			type: "article",
			url: absoluteUrl(`/projects/${caseStudy.slug.current}`),
		},
		twitter: {
			card: "summary_large_image",
			title: `${caseStudy.title} | Case Study`,
			description: caseStudy.summary,
		},
	};
}

export default async function ProjectCaseStudyPage({ params }: Props) {
	const { slug } = await params;
	const caseStudy = await getCaseStudyBySlug(slug);

	if (!caseStudy) {
		notFound();
	}

	return (
		<main className="min-h-screen bg-zinc-50 dark:bg-[#0f0f0f] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 pb-24">
			<div className="fixed top-6 right-6 z-50">
				<ThemeToggle />
			</div>
			<FloatingDock />

			<article className="max-w-4xl mx-auto px-4 py-12 md:py-20">
				<Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 transition-colors">
					<ArrowLeft className="w-4 h-4" />
					Back to Home
				</Link>

				<header className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 p-6 md:p-8 mb-8">
					<p className="text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold mb-3">Project Case Study</p>
					<h1 className="text-3xl md:text-4xl font-bold mb-4">{caseStudy.title}</h1>
					<p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">{caseStudy.summary}</p>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
						<div className="rounded-xl bg-zinc-100 dark:bg-zinc-800/70 px-4 py-3 flex items-center gap-2">
							<User className="w-4 h-4 text-zinc-500" />
							<span>{caseStudy.role}</span>
						</div>
						<div className="rounded-xl bg-zinc-100 dark:bg-zinc-800/70 px-4 py-3 flex items-center gap-2">
							<CalendarDays className="w-4 h-4 text-zinc-500" />
							<span>{caseStudy.duration}</span>
						</div>
						<div className="rounded-xl bg-zinc-100 dark:bg-zinc-800/70 px-4 py-3 flex items-center gap-2">
							<Hammer className="w-4 h-4 text-zinc-500" />
							<span>{caseStudy.year}</span>
						</div>
					</div>

					<div className="mt-5 flex items-center gap-3">
						<Link href={`https://github.com/${profile.githubUsername}/${caseStudy.repoName}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
							View Repository
							<ArrowUpRight className="w-4 h-4" />
						</Link>
						{caseStudy.liveUrl && (
							<Link href={caseStudy.liveUrl} target="_blank" className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 dark:border-blue-700 px-3 py-2 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
								Live Demo
								<ArrowUpRight className="w-4 h-4" />
							</Link>
						)}
					</div>
				</header>

				<section className="space-y-6">
					<div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6">
						<h2 className="text-xl font-semibold mb-3">Problem</h2>
						<p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{caseStudy.problem}</p>
					</div>

					<div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6">
						<h2 className="text-xl font-semibold mb-3">Solution</h2>
						<p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{caseStudy.solution}</p>
					</div>

					<div className="grid md:grid-cols-2 gap-6">
						<div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6">
							<h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
								<TrendingUp className="w-5 h-5 text-green-500" />
								Impact
							</h2>
							<ul className="space-y-2 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
								{caseStudy.impact.map((item) => (
									<li key={item}>- {item}</li>
								))}
							</ul>
						</div>

						<div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6">
							<h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
								<Layers className="w-5 h-5 text-blue-500" />
								Architecture
							</h2>
							<ul className="space-y-2 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
								{caseStudy.architecture.map((item) => (
									<li key={item}>- {item}</li>
								))}
							</ul>
						</div>
					</div>

					<div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6">
						<h2 className="text-xl font-semibold mb-4">Tech Stack</h2>
						<div className="flex flex-wrap gap-2">
							{caseStudy.techStack.map((tech) => (
								<span key={tech} className="rounded-full px-3 py-1 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
									{tech}
								</span>
							))}
						</div>
					</div>

					<div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6">
						<h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
							<Lightbulb className="w-5 h-5 text-yellow-500" />
							Key Lessons
						</h2>
						<ul className="space-y-2 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
							{caseStudy.lessons.map((item) => (
								<li key={item}>- {item}</li>
							))}
						</ul>
					</div>
				</section>
			</article>
		</main>
	);
}
