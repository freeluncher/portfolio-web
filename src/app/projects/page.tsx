import Link from "next/link";
import { ArrowLeft, FolderOpenDot, Rocket } from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/BentoGrid";
import { FloatingDock } from "@/components/FloatingDock";
import { ThemeToggle } from "@/components/ThemeToggle";
import { caseStudiesQuery } from "@/sanity/lib/queries";
import type { CaseStudy } from "@/sanity/lib/types";
import { sanityFetch } from "@/sanity/lib/live";

async function getCaseStudies(): Promise<CaseStudy[]> {
	const { data } = await sanityFetch({
		query: caseStudiesQuery,
		tags: ["caseStudies"],
		perspective: "published",
		stega: false,
	});

	return (data as CaseStudy[]) ?? [];
}

export const revalidate = 0;

export default async function ProjectsPage() {
	const caseStudies = await getCaseStudies();

	return (
		<main className="min-h-screen bg-zinc-50 dark:bg-[#0f0f0f] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 pb-24">
			<div className="fixed top-6 right-6 z-50">
				<ThemeToggle />
			</div>
			<FloatingDock />

			<div className="py-12 md:py-20">
				<BentoGrid>
					<BentoCard colSpan={3} className="text-center">
						<Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4 transition-colors">
							<ArrowLeft className="w-4 h-4" />
							Back to Home
						</Link>
						<h1 className="text-4xl md:text-5xl font-bold mb-4">Project Case Studies</h1>
						<p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
							Kumpulan studi kasus project lengkap: konteks masalah, keputusan teknis, arsitektur, hasil, dan pelajaran.
						</p>
					</BentoCard>

					{caseStudies.length > 0 ? (
						caseStudies.map((caseStudy, index) => (
							<BentoCard key={caseStudy._id} colSpan={index % 3 === 0 ? 2 : 1} className="group">
								<Link href={`/projects/${caseStudy.slug.current}`} className="block h-full">
									<div className="flex items-center justify-between gap-2 mb-3">
										<p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 font-semibold">Case Study</p>
										{caseStudy.featured && <span className="text-[11px] rounded-full border border-blue-300 dark:border-blue-700 px-2 py-0.5 text-blue-700 dark:text-blue-300">Featured</span>}
									</div>
									<h2 className="text-xl font-bold mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{caseStudy.title}</h2>
									<p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-4">{caseStudy.summary}</p>
									<div className="flex flex-wrap gap-2 mb-4">
										{caseStudy.techStack.slice(0, 4).map((tech) => (
											<span key={tech} className="px-2 py-1 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800">
												{tech}
											</span>
										))}
									</div>
									<div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
										<Rocket className="w-3.5 h-3.5" />
										<span>{caseStudy.role}</span>
										<span>-</span>
										<span>{caseStudy.year}</span>
									</div>
								</Link>
							</BentoCard>
						))
					) : (
						<BentoCard colSpan={3} className="text-center py-12">
							<FolderOpenDot className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
							<h3 className="font-bold text-xl mb-2">No Case Studies Yet</h3>
							<p className="text-zinc-500 dark:text-zinc-400">
								Tambahkan dokumen caseStudy di
								{" "}
								<Link href="/admin" className="text-blue-500 hover:underline">
									/admin
								</Link>
								{" "}
								agar tampil di halaman ini.
							</p>
						</BentoCard>
					)}
				</BentoGrid>
			</div>
		</main>
	);
}
