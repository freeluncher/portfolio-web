import { Star, GitFork, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface ProjectProps {
	name: string;
	description: string | null;
	stargazers_count: number;
	forks_count: number;
	html_url: string;
	language: string | null;
	caseStudySlug?: string;
}

export default function ProjectCard({ project }: { project: ProjectProps }) {
	return (
		<div className="group p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 transition-all">
			<div className="flex items-start justify-between mb-2">
				<h4 className="font-semibold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{project.name}</h4>
				<ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500" />
			</div>
			<p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">{project.description || "No description"}</p>
			<div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500">
				<div className="flex items-center gap-1">
					<div className={`w-2 h-2 rounded-full ${getLanguageColor(project.language)}`} />
					<span>{project.language || "N/A"}</span>
				</div>
				<div className="flex items-center gap-1">
					<Star className="w-3 h-3" />
					<span>{project.stargazers_count}</span>
				</div>
				<div className="flex items-center gap-1">
					<GitFork className="w-3 h-3" />
					<span>{project.forks_count}</span>
				</div>
			</div>

			<div className="mt-4 flex items-center gap-2">
				<Link
					href={project.html_url}
					target="_blank"
					className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 dark:border-zinc-600 px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-zinc-700 transition-colors"
				>
					Repository
					<ArrowUpRight className="w-3 h-3" />
				</Link>

				{project.caseStudySlug && (
					<Link href={`/projects/${project.caseStudySlug}`} className="inline-flex items-center rounded-lg border border-blue-300 dark:border-blue-700 px-2.5 py-1.5 text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
						Case Study
					</Link>
				)}
			</div>
		</div>
	);
}

function getLanguageColor(language: string | null) {
	const colors: Record<string, string> = {
		TypeScript: "bg-blue-500",
		JavaScript: "bg-yellow-500",
		Python: "bg-green-500",
		Rust: "bg-orange-500",
		Go: "bg-cyan-500",
		CSS: "bg-purple-500",
		HTML: "bg-red-500",
	};
	if (!language) return "bg-zinc-500";
	return colors[language] || "bg-zinc-500";
}
