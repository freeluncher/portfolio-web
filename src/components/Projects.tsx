"use client";

import ProjectCard from "./ProjectCard";
import { useCallback } from "react";
import type { GitHubProjectsResponse, Project } from "@/lib/api-types";
import { usePollingResource } from "@/hooks/usePollingResource";
import { PROJECTS_POLL_INTERVAL_MS } from "@/lib/constants";

async function fetchProjects(): Promise<GitHubProjectsResponse> {
	const res = await fetch("/api/github/projects", {
		cache: "no-store",
	});
	const payload = (await res.json()) as GitHubProjectsResponse;

	if (!res.ok) {
		return {
			data: payload?.data ?? { projects: [] },
			error: payload?.error ?? `Failed to Load Projects (HTTP ${res.status}).`,
			code: payload?.code ?? "GITHUB_FETCH_FAILED",
		};
	}

	return payload;
}

export default function Projects() {
	const projectsFetcher = useCallback(async () => {
		const result = await fetchProjects();
		return {
			projects: result.data?.projects ?? [],
			error: result.error,
		};
	}, []);

	const { data: projectsState, error: pollingError } = usePollingResource(projectsFetcher, {
		intervalMs: PROJECTS_POLL_INTERVAL_MS,
		immediate: true,
	});

	const projects: Project[] = projectsState?.projects ?? [];
	const error = projectsState?.error ?? pollingError;

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
