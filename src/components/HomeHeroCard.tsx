import Image from "next/image";
import Link from "next/link";
import { Box, MapPin } from "lucide-react";
import SocialLinks from "@/components/SocialLinks";
import AvailabilityStatus from "@/components/AvailabilityStatus";
import { profile } from "@/lib/profile";

export default function HomeHeroCard() {
	return (
		<div className="flex h-full flex-col justify-between">
			<div className="flex flex-col md:flex-row gap-6 md:gap-8">
				<div className="shrink-0">
					<Image src="/foto-profile.jpg" alt={profile.name} width={120} height={120} className="rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 object-cover" />
				</div>

				<div className="flex-1">
					<h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{profile.name} Portfolio Site</h1>
					<div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-3">
						<span className="text-base font-medium">{profile.headline}</span>
						<span>•</span>
						<div className="flex items-center gap-1">
							<MapPin className="w-4 h-4" />
							<span>{profile.location}</span>
						</div>
					</div>
					<p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">{profile.bio}</p>

					<AvailabilityStatus variant="compact" className="mt-4" />

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
