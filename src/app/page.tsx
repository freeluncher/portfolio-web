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
					{/* Hero Card - Large */}
					<BentoCard colSpan={2} rowSpan={2} className="flex flex-col justify-between">
						<Hero variant="homeCard" />
					</BentoCard>

					{/* Tech Stack Card */}
					<BentoCard className="flex flex-col justify-center items-center text-center">
						<Sparkles className="w-8 h-8 mb-3 text-yellow-500" />
						<h3 className="font-bold text-lg mb-2">Tech Stack</h3>
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
						<h3 className="font-bold text-lg mb-4 flex items-center gap-2">
							<span>📊</span> Live Activity
						</h3>
						<WakaStats />
					</BentoCard>

					{/* GitHub Calendar - Wide */}
					<BentoCard colSpan={2}>
						<h3 className="font-bold text-lg mb-4 flex items-center gap-2">
							<span>🌱</span> GitHub Contributions
						</h3>
						<GithubCalendarComponent />
					</BentoCard>

					{/* Experience Card */}
					<BentoCard rowSpan={2}>
						<h3 className="font-bold text-lg mb-4 flex items-center gap-2">
							<span>💼</span> Experience
						</h3>
						<Timeline />
					</BentoCard>

					{/* Projects - Wide */}
					<BentoCard colSpan={2}>
						<div className="mb-4 flex items-center justify-between gap-2">
							<h3 className="font-bold text-lg flex items-center gap-2">
								<span>🚀</span> Featured Projects
							</h3>
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
