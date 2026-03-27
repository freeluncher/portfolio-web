"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import SocialLinks from "@/components/SocialLinks";

export default function Hero() {
	return (
		<section className="max-w-3xl mx-auto px-6 pt-24 pb-12 relative">
			{/* Background Texture for "Selling" Point */}
			<div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />

			<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
				{/* Notion-style emoji icon */}
				<div className="text-7xl mb-6 hover:scale-110 transition-transform cursor-pointer origin-left">👨‍💻</div>

				{/* Title */}
				<h1 className="text-5xl font-extrabold mb-4 tracking-tight text-foreground">Gandhi Satria Dewa</h1>

				{/* Subtitle */}
				<div className="flex items-center gap-2 text-muted mb-8 font-medium">
					<span className="text-lg">Full-stack Developer</span>
					<span>•</span>
					<div className="flex items-center gap-1">
						<MapPin className="w-4 h-4" />
						<span>Indonesia</span>
					</div>
				</div>

				{/* Description as Notion block */}
				<div className="space-y-4 text-secondary-foreground text-lg leading-relaxed mb-10 max-w-2xl">
					<p>
						I build modern web applications focusing on <span className="font-semibold text-foreground underline decoration-wavy decoration-blue-400">user experience</span>,{" "}
						<span className="font-semibold text-foreground underline decoration-wavy decoration-purple-400">performance</span>, and{" "}
						<span className="font-semibold text-foreground underline decoration-wavy decoration-green-400">scalability</span>.
					</p>
				</div>

				{/* Social links as clean buttons */}
				<SocialLinks />
			</motion.div>
		</section>
	);
}
