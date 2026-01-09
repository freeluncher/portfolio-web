import ProjectCard from "./ProjectCard";

async function getProjects() {
	const token = process.env.GITHUB_TOKEN;
	// TODO: Replace 'torvalds' with the actual username from env or config
	// For now using a placeholder or we can ask the user.
	// The user prompt didn't specify the username, so we'll use a placeholder or try to infer.
	// Let's use a popular user 'shadcn' or similar for demo if not set.
	// But better to fail gracefully or use a variable.
	const username = process.env.GITHUB_USERNAME || "leerob";

	try {
		const res = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=4`, {
			headers: token ? { Authorization: `token ${token}` } : {},
			next: { revalidate: 3600 },
		});

		if (!res.ok) {
			console.error("GitHub API Error:", res.status, res.statusText);
			return [];
		}

		return res.json();
	} catch (error) {
		console.error("GitHub Fetch Error:", error);
		return [];
	}
}

interface Project {
	id: number;
	name: string;
	description: string;
	stargazers_count: number;
	forks_count: number;
	html_url: string;
	language: string;
}

export default async function Projects() {
	const projects = await getProjects();

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
			{Array.isArray(projects) && projects.length > 0 ? projects.map((project: Project) => <ProjectCard key={project.id} project={project} />) : <p className="text-zinc-500 text-sm">No projects found.</p>}
		</div>
	);
}
