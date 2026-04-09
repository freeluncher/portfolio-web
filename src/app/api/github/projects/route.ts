import { NextResponse } from "next/server";
import { profile } from "@/lib/profile";
import { GITHUB_REPOS_LIMIT } from "@/lib/constants";
import { client } from "@/sanity/lib/client";
import { caseStudyRepoSlugMapQuery } from "@/sanity/lib/queries";
import type { GitHubProjectsResponse, Project } from "@/lib/api-types";
import { githubProjectsSchema } from "@/lib/api-schemas";

interface CaseStudyRepoMapItem {
	repoName: string;
	caseStudySlug: string;
}

export const dynamic = "force-dynamic";

function jsonResponse(payload: GitHubProjectsResponse, status = 200) {
	return NextResponse.json(payload, {
		status,
		headers: { "Cache-Control": "no-store" },
	});
}

export async function GET() {
	const token = process.env.GITHUB_TOKEN;
	const username = process.env.GITHUB_USERNAME?.trim() || profile.githubUsername;

	if (!username) {
		return jsonResponse({
			data: { projects: [] },
			error: "GitHub username is not yet configured.",
			code: "GITHUB_USERNAME_MISSING",
		}, 500);
	}

	try {
		const res = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=${GITHUB_REPOS_LIMIT}`, {
			headers: {
				Accept: "application/vnd.github+json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			cache: "no-store",
		});

		if (!res.ok) {
			if (res.status === 403 || res.status === 429) {
				return jsonResponse({
					data: { projects: [] },
					error: "GitHub API rate limit reached. Please try again later.",
					code: "GITHUB_RATE_LIMIT",
				}, 429);
			}

			if (res.status === 401) {
				return jsonResponse({
					data: { projects: [] },
					error: "GitHub token is not valid or has expired.",
					code: "GITHUB_TOKEN_INVALID",
				}, 401);
			}

			return jsonResponse({
				data: { projects: [] },
				error: `Failed to Load Projects (HTTP ${res.status}).`,
				code: "GITHUB_FETCH_FAILED",
			}, 502);
		}

		const rawData: unknown = await res.json();
		const parsedProjects = githubProjectsSchema.safeParse(rawData);
		if (!parsedProjects.success) {
			console.error("Invalid GitHub projects payload", parsedProjects.error.flatten());
			return jsonResponse({
				data: { projects: [] },
				error: "GitHub returned an unexpected response format.",
				code: "GITHUB_INVALID_RESPONSE",
			}, 502);
		}

		const data = parsedProjects.data as Project[];
		let repoMap: Record<string, string> = {};

		try {
			const mappings = await client.fetch<CaseStudyRepoMapItem[]>(caseStudyRepoSlugMapQuery, {}, { cache: "force-cache", next: { revalidate: 300, tags: ["caseStudies"] } });
			repoMap = (mappings || []).reduce<Record<string, string>>((acc, item) => {
				if (item.repoName && item.caseStudySlug) {
					acc[item.repoName.toLowerCase()] = item.caseStudySlug;
				}
				return acc;
			}, {});
		} catch (sanityError) {
			console.error("Failed to load case study mappings from Sanity:", sanityError);
		}

		const projectsWithCaseStudy = (Array.isArray(data) ? data : []).map((project) => ({
			...project,
			caseStudySlug: repoMap[project.name.toLowerCase()],
		}));

		return jsonResponse({
			data: { projects: projectsWithCaseStudy },
			error: null,
			code: null,
		}, 200);
	} catch (error) {
		console.error("GitHub projects API route error:", error);
		return jsonResponse({
			data: { projects: [] },
			error: "Failed to connect to GitHub at this time.",
			code: "GITHUB_CONNECTION_FAILED",
		}, 502);
	}
}
