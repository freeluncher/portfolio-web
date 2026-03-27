import ProjectCard from "./ProjectCard";

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

async function getProjects() {
	const token = process.env.GITHUB_TOKEN;
	const username = process.env.GITHUB_USERNAME?.trim() || "freeluncher";

	if (!username) {
		return {
			projects: [],
			error: "GitHub username belum dikonfigurasi.",
		} satisfies ProjectsResult;
	}

	try {
		const res = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=4`, {
			headers: {
				Accept: "application/vnd.github+json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			next: { revalidate: 3600 },
		});

		if (!res.ok) {
			if (res.status === 403 || res.status === 429) {
				return {
					projects: [],
					error: "GitHub API rate limit tercapai. Coba lagi beberapa saat.",
				} satisfies ProjectsResult;
			}

			if (res.status === 401) {
				return {
					projects: [],
					error: "GitHub token tidak valid atau sudah kedaluwarsa.",
				} satisfies ProjectsResult;
			}

			return {
				projects: [],
				error: `Gagal memuat proyek (HTTP ${res.status}).`,
			} satisfies ProjectsResult;
		}

		const data = (await res.json()) as Project[];
		return {
			projects: Array.isArray(data) ? data : [],
			error: null,
		} satisfies ProjectsResult;
	} catch (error) {
		console.error("GitHub Fetch Error:", error);
		return {
			projects: [],
			error: "Tidak bisa terhubung ke GitHub saat ini.",
		} satisfies ProjectsResult;
	}
}

export default async function Projects() {
	const { projects, error } = await getProjects();

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
			{projects.length > 0 ? (
				projects.map((project: Project) => <ProjectCard key={project.id} project={project} />)
			) : (
				<div className="sm:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100/60 dark:bg-zinc-900/50 px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">
					{error || "Belum ada proyek publik yang bisa ditampilkan."}
				</div>
			)}
		</div>
	);
}
