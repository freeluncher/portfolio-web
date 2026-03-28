import { BentoGrid, BentoCard } from "@/components/BentoGrid";
import GithubCalendarComponent from "@/components/GithubCalendar";
import WakaStats from "@/components/WakaStats";
import Projects from "@/components/Projects";
import Timeline from "@/components/Timeline";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FloatingDock } from "@/components/FloatingDock";
import SocialLinks from "@/components/SocialLinks";
import { profile } from "@/lib/profile";
import { MapPin, Sparkles } from "lucide-react";
import Image from "next/image";

export default function Home() {
	return (
		<main className="min-h-screen bg-zinc-50 dark:bg-[#0f0f0f] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 pb-24">
			{/* Fixed Theme Toggle */}
			<div className="fixed top-6 right-6 z-50">
				<ThemeToggle />
			</div>

			{/* Floating Dock Navigation */}
			<FloatingDock />

			{/* Bento Grid Layout */}
			<div className="py-12 md:py-20">
				<BentoGrid>
					{/* Hero Card - Large */}
					<BentoCard colSpan={2} rowSpan={2} className="flex flex-col justify-between">
						{/* Profile Section - Image Left, Text Right */}
						<div className="flex flex-col md:flex-row gap-6 md:gap-8">
							{/* Profile Photo */}
							<div className="flex-shrink-0">
								<Image src="/foto-profile.jpg" alt={profile.name} width={120} height={120} className="rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 object-cover" />
							</div>

							{/* Text Content */}
							<div className="flex-1">
								<h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{profile.name}</h1>
								<div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-3">
									<span className="text-base font-medium">{profile.headline}</span>
									<span>•</span>
									<div className="flex items-center gap-1">
										<MapPin className="w-4 h-4" />
										<span>{profile.location}</span>
									</div>
								</div>
								<p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">{profile.bio}</p>
							</div>
						</div>

						{/* Social Links */}
						<SocialLinks variant="compact" className="mt-6" />
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
						<h3 className="font-bold text-lg mb-4 flex items-center gap-2">
							<span>🚀</span> Featured Projects
						</h3>
						<Projects />
					</BentoCard>
				</BentoGrid>
			</div>

			{/* Footer */}
			<footer className="py-8 text-center text-zinc-500 dark:text-zinc-600 text-sm border-t border-zinc-200 dark:border-zinc-800">
				<p>© {new Date().getFullYear()} {profile.name}. Built with Next.js & Tailwind.</p>
			</footer>
		</main>
	);
}
