"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BentoGrid, BentoCard } from "@/components/BentoGrid";
import { FloatingDock } from "@/components/FloatingDock";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, User, Heart, Coffee } from "lucide-react";

export default function AboutPage() {
	return (
		<main className="min-h-screen bg-zinc-50 dark:bg-[#0f0f0f] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 pb-24">
			<div className="fixed top-6 right-6 z-50">
				<ThemeToggle />
			</div>
			<FloatingDock />

			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="py-12 md:py-20">
				<BentoGrid>
					{/* Header Card */}
					<BentoCard colSpan={3} className="text-center">
						<Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4 transition-colors">
							<ArrowLeft className="w-4 h-4" />
							Back to Home
						</Link>
						<h1 className="text-4xl md:text-5xl font-bold mb-4">About Me</h1>
						<p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">Learn more about my journey, skills, and what drives me as a developer.</p>
					</BentoCard>

					{/* Placeholder Cards */}
					<BentoCard className="flex flex-col items-center justify-center text-center">
						<User className="w-10 h-10 mb-3 text-blue-500" />
						<h3 className="font-bold text-lg mb-2">Background</h3>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">Coming soon...</p>
					</BentoCard>

					<BentoCard className="flex flex-col items-center justify-center text-center">
						<Heart className="w-10 h-10 mb-3 text-red-500" />
						<h3 className="font-bold text-lg mb-2">Passions</h3>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">Coming soon...</p>
					</BentoCard>

					<BentoCard className="flex flex-col items-center justify-center text-center">
						<Coffee className="w-10 h-10 mb-3 text-amber-500" />
						<h3 className="font-bold text-lg mb-2">Hobbies</h3>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">Coming soon...</p>
					</BentoCard>
				</BentoGrid>
			</motion.div>
		</main>
	);
}
