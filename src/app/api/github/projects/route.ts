import { NextResponse } from "next/server";
import { profile } from "@/lib/profile";

interface Project {
	id: number;
	name: string;
	description: string | null;
	stargazers_count: number;
	forks_count: number;
	html_url: string;
	language: string | null;
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
		return NextResponse.json(
			{
				projects: Array.isArray(data) ? data : [],
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
