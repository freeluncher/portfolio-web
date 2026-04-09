import { NextResponse } from "next/server";
import { profile } from "@/lib/profile";
import { client } from "@/sanity/lib/client";
import { caseStudyRepoMapQuery } from "@/sanity/lib/queries";

interface Project {
	id: number;
	name: string;
	description: string | null;
	stargazers_count: number;
	forks_count: number;
	html_url: string;
	language: string | null;
	caseStudySlug?: string;
}

interface CaseStudyRepoMapItem {
	repoName: string;
	caseStudySlug: string;
}

export const dynamic = "force-dynamic";

export async function GET() {
	const token = process.env.GITHUB_TOKEN;
	const username = process.env.GITHUB_USERNAME?.trim() || profile.githubUsername;

	if (!username) {
		return NextResponse.json(
			{ projects: [], error: "GitHub username is not yet configured." },
			{ status: 200, headers: { "Cache-Control": "no-store" } }
		);
	}

	try {
		const res = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=4`, {
			headers: {
				Accept: "application/vnd.github+json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			cache: "no-store",
		});

		if (!res.ok) {
			if (res.status === 403 || res.status === 429) {
				return NextResponse.json(
					{ projects: [], error: "GitHub API rate limit reached. Please try again later." },
					{ status: 200, headers: { "Cache-Control": "no-store" } }
				);
			}

			if (res.status === 401) {
				return NextResponse.json(
					{ projects: [], error: "GitHub token is not valid or has expired." },
					{ status: 200, headers: { "Cache-Control": "no-store" } }
				);
			}

			return NextResponse.json(
				{ projects: [], error: `Failed to Load Projects (HTTP ${res.status}).` },
				{ status: 200, headers: { "Cache-Control": "no-store" } }
			);
		}

		const data = (await res.json()) as Project[];
		let repoMap: Record<string, string> = {};

		try {
			const mappings = await client.fetch<CaseStudyRepoMapItem[]>(caseStudyRepoMapQuery);
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

		return NextResponse.json(
			{
				projects: projectsWithCaseStudy,
				error: null,
			},
			{ status: 200, headers: { "Cache-Control": "no-store" } }
		);
	} catch (error) {
		console.error("GitHub projects API route error:", error);
		return NextResponse.json(
			{ projects: [], error: "Failed to connect to GitHub at this time." },
			{ status: 200, headers: { "Cache-Control": "no-store" } }
		);
	}
}
