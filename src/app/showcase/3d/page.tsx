import Link from "next/link";
import { ArrowLeft, Box, Cuboid, Sparkles } from "lucide-react";
import SiteShell from "@/components/layout/SiteShell";
import { BentoGrid, BentoCard } from "@/components/BentoGrid";

export default function Showcase3DPage() {
	return (
		<SiteShell>
			<div className="py-12 md:py-20">
				<BentoGrid>
					<BentoCard colSpan={3} className="text-center">
						<Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4 transition-colors">
							<ArrowLeft className="w-4 h-4" />
							Back to Home
						</Link>
						<h1 className="text-4xl md:text-5xl font-bold mb-4">3D Showcase</h1>
						<p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
							Ruang khusus untuk menampilkan portfolio 3D interaktif.
							Konten final akan menampilkan scene, kamera, dan interaksi realtime.
						</p>
					</BentoCard>

					<BentoCard colSpan={2} className="min-h-80 md:min-h-105 flex flex-col items-center justify-center text-center">
						<div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-4">
							<Cuboid className="w-10 h-10 text-zinc-500 dark:text-zinc-300" />
						</div>
						<h2 className="text-2xl font-bold mb-2">3D Canvas Placeholder</h2>
						<p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
							Area ini disiapkan untuk render scene 3D (Three.js / React Three Fiber), termasuk loader model dan kontrol kamera.
						</p>
					</BentoCard>

					<BentoCard className="flex flex-col justify-between">
						<div>
							<p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 font-semibold mb-2">Roadmap</p>
							<h3 className="text-lg font-bold mb-3">Next Steps</h3>
							<ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
								<li>1. Integrasi scene utama 3D</li>
								<li>2. Tambahkan orbit controls + lighting</li>
								<li>3. Optimasi performa untuk mobile</li>
							</ul>
						</div>
						<div className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
							<Sparkles className="w-4 h-4" />
							Experimental Lab
						</div>
					</BentoCard>

					<BentoCard colSpan={3} className="flex items-center justify-between gap-3 flex-wrap">
						<div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
							<Box className="w-4 h-4" />
							<span className="text-sm">Halaman ini adalah skeleton untuk showcase 3D portfolio.</span>
						</div>
						<Link href="/projects" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
							Lihat Project Case Studies
						</Link>
					</BentoCard>
				</BentoGrid>
			</div>
		</SiteShell>
	);
}
