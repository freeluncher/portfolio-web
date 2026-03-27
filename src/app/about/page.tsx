"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BentoGrid, BentoCard } from "@/components/BentoGrid";
import { FloatingDock } from "@/components/FloatingDock";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Cog, Code2, Brain, Rocket, GraduationCap, Wrench } from "lucide-react";

export default function AboutPage() {
	return (
		<main className="min-h-screen bg-zinc-50 dark:bg-[#0f0f0f] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 pb-24">
			<div className="fixed top-6 right-6 z-50">
				<ThemeToggle />
			</div>
			<FloatingDock />

			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="py-12 md:py-20">
				<BentoGrid>
					{/* Hero Header */}
					<BentoCard colSpan={3} className="text-center">
						<Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4 transition-colors">
							<ArrowLeft className="w-4 h-4" />
							Back to Home
						</Link>
						<div className="flex items-center justify-center gap-3 mb-4">
							<Cog className="w-10 h-10 text-zinc-400" />
							<span className="text-3xl">→</span>
							<Code2 className="w-10 h-10 text-blue-500" />
						</div>
						<h1 className="text-4xl md:text-5xl font-bold mb-4">From Machines to Code</h1>
						<p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">A fresh graduate with an engineering mindset, now growing as a fullstack developer.</p>
					</BentoCard>

					{/* Card 1: The Bio */}
					<BentoCard colSpan={2} rowSpan={2}>
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 rounded-xl bg-blue-500/10">
								<Code2 className="w-6 h-6 text-blue-500" />
							</div>
							<h2 className="text-xl font-bold">The Bio</h2>
						</div>
						<div className="space-y-4 text-zinc-600 dark:text-zinc-400">
							<p className="text-lg leading-relaxed">
								I&apos;m <span className="text-zinc-900 dark:text-zinc-100 font-semibold">Gandhi Satria Dewa</span>, a fresh graduate who is building a career in fullstack development.
							</p>
							<p className="leading-relaxed">
								I graduated from <span className="text-zinc-900 dark:text-zinc-100">Mechanical Engineering</span>, then shifted my focus to software because I enjoy solving problems that impact real users.
							</p>
							<p className="leading-relaxed">
								I may be early in my journey, but I work seriously on fundamentals: clean code, clear structure, and continuous learning.
							</p>
						</div>
					</BentoCard>

					{/* Card 2: Education */}
					<BentoCard className="flex flex-col">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 rounded-xl bg-green-500/10">
								<GraduationCap className="w-6 h-6 text-green-500" />
							</div>
							<h2 className="text-lg font-bold">Education</h2>
						</div>
						<div className="flex-1 flex flex-col justify-center">
							<p className="font-semibold text-lg mb-1">D3 Mechanical Engineering</p>
							<p className="text-sm text-zinc-500 dark:text-zinc-400">Politeknik Negeri Semarang</p>
							<p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">POLINES</p>
						</div>
					</BentoCard>

					{/* Card 3: Tech Stack */}
					<BentoCard>
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 rounded-xl bg-purple-500/10">
								<Wrench className="w-6 h-6 text-purple-500" />
							</div>
							<h2 className="text-lg font-bold">Tech Arsenal</h2>
						</div>
						<div className="flex flex-wrap gap-2">
							{["Next.js", "React", "TypeScript", "Tailwind", "Sanity", "Node.js", "PostgreSQL"].map((tech) => (
								<span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800">
									{tech}
								</span>
							))}
						</div>
					</BentoCard>

					{/* Card 4: The Journey */}
					<BentoCard colSpan={2}>
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 rounded-xl bg-amber-500/10">
								<Cog className="w-6 h-6 text-amber-500" />
							</div>
							<h2 className="text-xl font-bold">The Journey</h2>
						</div>
						<div className="space-y-3 text-zinc-600 dark:text-zinc-400">
							<p className="leading-relaxed">
								Mechanical Engineering trained me to think in systems, pay attention to details, and stay calm when debugging complex issues.
							</p>
							<p className="leading-relaxed">
								When I started building web apps, that mindset carried over naturally. I enjoy turning ideas into features, then improving them through feedback and iteration.{" "}
								<span className="text-zinc-900 dark:text-zinc-100 font-medium">Same mindset, new playground.</span>
							</p>
						</div>
					</BentoCard>

					{/* Card 5: Engineering Mindset */}
					<BentoCard>
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 rounded-xl bg-red-500/10">
								<Brain className="w-6 h-6 text-red-500" />
							</div>
							<h2 className="text-lg font-bold">Engineering Mindset</h2>
						</div>
						<ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
							<li className="flex items-start gap-2">
								<span className="text-green-500 mt-0.5">✓</span>
								<span>
									<span className="text-zinc-900 dark:text-zinc-100 font-medium">Ownership</span> - I take responsibility for the quality of my work
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-green-500 mt-0.5">✓</span>
								<span>
									<span className="text-zinc-900 dark:text-zinc-100 font-medium">Growth mindset</span> - Fast learner and open to feedback
								</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-green-500 mt-0.5">✓</span>
								<span>
									<span className="text-zinc-900 dark:text-zinc-100 font-medium">Collaboration</span> - Comfortable working with teams and adapting quickly
								</span>
							</li>
						</ul>
					</BentoCard>

					{/* Card 6: Current Mission */}
					<BentoCard colSpan={2}>
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 rounded-xl bg-cyan-500/10">
								<Rocket className="w-6 h-6 text-cyan-500" />
							</div>
							<h2 className="text-xl font-bold">Current Mission</h2>
						</div>
						<div className="space-y-3 text-zinc-600 dark:text-zinc-400">
							<p className="leading-relaxed">
								Right now, I am focused on becoming a reliable <span className="text-zinc-900 dark:text-zinc-100 font-medium">fullstack developer</span> who can contribute from day one. My learning priorities are:
							</p>
							<ul className="grid grid-cols-2 gap-2 text-sm">
								<li className="flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
									Frontend architecture
								</li>
								<li className="flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
									Backend fundamentals
								</li>
								<li className="flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
									API design and integration
								</li>
								<li className="flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
									Testing and code quality
								</li>
							</ul>
						</div>
					</BentoCard>

					{/* CTA Card */}
					<BentoCard className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
						<p className="text-lg font-medium mb-4">Open to internship and junior fullstack opportunities.</p>
						<Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium hover:opacity-90 transition-opacity">
							Contact Me
						</Link>
					</BentoCard>
				</BentoGrid>
			</motion.div>
		</main>
	);
}
