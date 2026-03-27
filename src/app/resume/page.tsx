"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BentoGrid, BentoCard } from "@/components/BentoGrid";
import { FloatingDock } from "@/components/FloatingDock";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Download, Briefcase, GraduationCap, Award } from "lucide-react";

export default function ResumePage() {
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
						<h1 className="text-4xl md:text-5xl font-bold mb-4">Resume</h1>
						<p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-6">My professional experience, education, and certifications.</p>
						<a
							href="mailto:gandhisatriadewa06@gmail.com?subject=Request%20for%20CV%20PDF"
							className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium hover:opacity-90 transition-opacity">
							<Download className="w-4 h-4" />
							Request CV PDF
						</a>
					</BentoCard>

					{/* Resume Section Cards */}
					<BentoCard className="flex flex-col items-center justify-center text-center">
						<Briefcase className="w-10 h-10 mb-3 text-blue-500" />
						<h3 className="font-bold text-lg mb-2">Experience</h3>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">5+ years in web development</p>
					</BentoCard>

					<BentoCard className="flex flex-col items-center justify-center text-center">
						<GraduationCap className="w-10 h-10 mb-3 text-green-500" />
						<h3 className="font-bold text-lg mb-2">Education</h3>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">Computer Science</p>
					</BentoCard>

					<BentoCard className="flex flex-col items-center justify-center text-center">
						<Award className="w-10 h-10 mb-3 text-yellow-500" />
						<h3 className="font-bold text-lg mb-2">Certifications</h3>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">AWS, Google Cloud</p>
					</BentoCard>
				</BentoGrid>
			</motion.div>
		</main>
	);
}
