"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Box, MapPin } from "lucide-react";
import SocialLinks from "@/components/SocialLinks";
import { cn } from "@/lib/utils";
import { profile } from "@/lib/profile";

interface HeroProps {
	variant?: "default" | "homeCard";
	className?: string;
}

export default function Hero({ variant = "default", className }: HeroProps) {
	if (variant === "homeCard") {
		return (
			<div className={cn("flex h-full flex-col justify-between", className)}>
				<div className="flex flex-col md:flex-row gap-6 md:gap-8">
					<div className="shrink-0">
						<Image src="/foto-profile.jpg" alt={profile.name} width={120} height={120} className="rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 object-cover" />
					</div>

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

						<div className="mt-4">
							<Link
								href="/showcase/3d"
								className="inline-flex items-center gap-2 rounded-lg border border-blue-300 dark:border-blue-700 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
							>
								<Box className="w-4 h-4" />
								View 3D Showcase
							</Link>
						</div>
					</div>
				</div>

				<SocialLinks variant="compact" className="mt-6" />
			</div>
		);
	}

	return (
		<section className={cn("max-w-3xl mx-auto px-6 pt-24 pb-12 relative", className)}>
			{/* Background Texture for "Selling" Point */}
			<div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />

			<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
				{/* Notion-style emoji icon */}
				<div className="text-7xl mb-6 hover:scale-110 transition-transform cursor-pointer origin-left">👨‍💻</div>

				{/* Title */}
				<h1 className="text-5xl font-extrabold mb-4 tracking-tight text-foreground">{profile.name}</h1>

				{/* Subtitle */}
				<div className="flex items-center gap-2 text-muted mb-8 font-medium">
					<span className="text-lg">{profile.headline}</span>
					<span>•</span>
					<div className="flex items-center gap-1">
						<MapPin className="w-4 h-4" />
						<span>{profile.location}</span>
					</div>
				</div>

				{/* Description as Notion block */}
				<div className="space-y-4 text-secondary-foreground text-lg leading-relaxed mb-10 max-w-2xl">
					<p>
						I build modern web applications focusing on <span className="font-semibold text-foreground underline decoration-wavy decoration-blue-400">user experience</span>,{" "}
						<span className="font-semibold text-foreground underline decoration-wavy decoration-purple-400">performance</span>, and{" "}
						<span className="font-semibold text-foreground underline decoration-wavy decoration-green-400">scalability</span>.
					</p>
					<div>
						<Link
							href="/showcase/3d"
							className="inline-flex items-center gap-2 rounded-lg border border-blue-300 dark:border-blue-700 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
						>
							<Box className="w-4 h-4" />
							View 3D Showcase
						</Link>
					</div>
				</div>

				{/* Social links as clean buttons */}
				<SocialLinks />
			</motion.div>
		</section>
	);
}
