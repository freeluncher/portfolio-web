"use client";

import ProjectCard from "./ProjectCard";
import { useEffect, useState } from "react";

interface Project {
	id: number;
	name: string;
	description: string | null;
	stargazers_count: number;
	forks_count: number;
	html_url: string;
	language: string | null;
}

interface ProjectsResult {
	projects: Project[];
	error: string | null;
}

async function fetchProjects(): Promise<ProjectsResult> {
	const res = await fetch("/api/github/projects", {
		cache: "no-store",
	});

	if (!res.ok) {
		return {
			projects: [],
			error: `Failed to Load Projects (HTTP ${res.status}).`,
		};
	}

	return (await res.json()) as ProjectsResult;
}

export default function Projects() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const load = async () => {
			try {
				const result = await fetchProjects();
				if (!isMounted) return;
				setProjects(result.projects);
				setError(result.error);
			} catch (err) {
				if (!isMounted) return;
				console.error("Projects Polling Error:", err);
				setError("Failed to fetch GitHub data at this time.");
			}
		};

		void load();
		const intervalId = window.setInterval(() => {
			void load();
		}, 60000);

		return () => {
			isMounted = false;
			window.clearInterval(intervalId);
		};
	}, []);

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
			{projects.length > 0 ? (
				projects.map((project: Project) => <ProjectCard key={project.id} project={project} />)
			) : (
				<div className="sm:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100/60 dark:bg-zinc-900/50 px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">
					{error || "No public projects to display."}
				</div>
			)}
		</div>
	);
}
