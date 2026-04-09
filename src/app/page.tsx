import { BentoGrid, BentoCard } from "@/components/BentoGrid";
import GithubCalendarComponent from "@/components/GithubCalendar";
import WakaStats from "@/components/WakaStats";
import Projects from "@/components/Projects";
import Timeline from "@/components/Timeline";
import Hero from "@/components/Hero";
import SiteShell from "@/components/layout/SiteShell";
import { profile } from "@/lib/profile";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
	return (
		<SiteShell>
			{/* Bento Grid Layout */}
			<div className="py-12 md:py-20">
				<BentoGrid>
					{/* SEO Content Card */}
					<BentoCard colSpan={3} className="space-y-3 bg-zinc-100/50 dark:bg-zinc-900/40 border-zinc-200/70 dark:border-zinc-800/70">
						<h2 className="text-lg md:text-xl font-semibold tracking-tight">Gandhi Satria Dewa Portfolio</h2>
						<p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
							A concise portfolio summary is shown here for quick scanning.
							 The complete context about my full-stack approach, case-study thinking, and delivery process is available below.
						</p>

						<div className="flex flex-wrap gap-2 pt-1">
							<Link href="/about" className="text-xs font-medium rounded-full border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">About</Link>
							<Link href="/projects" className="text-xs font-medium rounded-full border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">Projects</Link>
							<Link href="/blog" className="text-xs font-medium rounded-full border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">Blog</Link>
							<Link href="/resume" className="text-xs font-medium rounded-full border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">Resume</Link>
							<Link href="/contact" className="text-xs font-medium rounded-full border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">Contact</Link>
							<Link href="/showcase/3d" className="text-xs font-medium rounded-full border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">3D Showcase</Link>
						</div>

						<details className="group rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 p-3">
							<summary className="cursor-pointer list-none text-xs md:text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Read full portfolio overview
							</summary>
							<div className="mt-3 space-y-3">
								<p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
									Welcome to the Gandhi Satria Dewa Portfolio, a focused collection of web engineering work built with a product mindset.
									This home page highlights the way I design, build, and improve digital experiences from idea to production.
									My work combines full-stack implementation, careful UI composition, practical architecture decisions, and reliable delivery.
									I treat each feature as a user problem first, not just a coding task, and I prioritize maintainability so products can evolve quickly.
								</p>
								<p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
									In this portfolio, you can explore selected case studies that explain goals, trade-offs, technical constraints, and measurable impact.
									I document why a solution was chosen, what alternatives were considered, and how the final implementation performs in real scenarios.
									The projects span modern frontend development, backend integration, API design, content modeling, and deployment workflows.
									I also include lessons learned so the portfolio is useful for recruiters, collaborators, and engineering teams who care about process as much as output.
								</p>
								<p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
									Beyond static showcases, this site includes live activity signals and an evolving roadmap, because software quality is not a one-time event.
									I regularly refactor code, tighten type safety, improve caching strategy, and optimize performance to keep the experience fast and stable.
									If you are looking for a developer who can balance product thinking, clean code, and execution speed, this portfolio is designed to give that complete picture.
								</p>
							</div>
						</details>
					</BentoCard>

					{/* Hero Card - Large */}
					<BentoCard colSpan={2} rowSpan={2} className="flex flex-col justify-between">
						<Hero variant="homeCard" />
					</BentoCard>

					{/* Tech Stack Card */}
					<BentoCard className="flex flex-col justify-center items-center text-center">
						<Sparkles className="w-8 h-8 mb-3 text-yellow-500" />
						<h2 className="font-bold text-lg mb-2">Tech Stack</h2>
						<div className="flex flex-wrap justify-center gap-2">
							{["Next.js", "React", "TypeScript", "Tailwind"].map((tech) => (
								<span key={tech} className="px-3 py-1 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 font-medium">
									{tech}
								</span>
							))}
						</div>
					</BentoCard>

					{/* Coding Stats Card */}
					<BentoCard>
						<h2 className="font-bold text-lg mb-4 flex items-center gap-2">
							<span>📊</span> Live Activity
						</h2>
						<WakaStats />
					</BentoCard>

					{/* GitHub Calendar - Wide */}
					<BentoCard colSpan={2}>
						<h2 className="font-bold text-lg mb-4 flex items-center gap-2">
							<span>🌱</span> GitHub Contributions
						</h2>
						<GithubCalendarComponent />
					</BentoCard>

					{/* Experience Card */}
					<BentoCard rowSpan={2}>
						<h2 className="font-bold text-lg mb-4 flex items-center gap-2">
							<span>💼</span> Experience
						</h2>
						<Timeline />
					</BentoCard>

					{/* Projects - Wide */}
					<BentoCard colSpan={2}>
						<div className="mb-4 flex items-center justify-between gap-2">
							<h2 className="font-bold text-lg flex items-center gap-2">
								<span>🚀</span> Featured Projects
							</h2>
							<Link href="/projects" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
								View all case studies
							</Link>
						</div>
						<Projects />
					</BentoCard>
				</BentoGrid>
			</div>

			{/* Footer */}
			<footer className="py-8 text-center text-zinc-500 dark:text-zinc-600 text-sm border-t border-zinc-200 dark:border-zinc-800">
				<p>© {new Date().getFullYear()} {profile.name}. Built with Next.js & Tailwind.</p>
			</footer>
		</SiteShell>
	);
}
