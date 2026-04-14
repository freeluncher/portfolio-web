import Link from "next/link";

export const metadata = {
	title: "Admin Portal",
	description: "Choose admin destination",
};

export default function AdminPortalPage() {
	return (
		<main className="min-h-screen bg-zinc-50 dark:bg-[#0f0f0f] text-zinc-900 dark:text-zinc-100">
			<div className="mx-auto w-full max-w-4xl px-6 py-16">
				<h1 className="text-3xl md:text-4xl font-bold tracking-tight">Admin Portal</h1>
				<p className="mt-3 text-zinc-600 dark:text-zinc-400">Pilih tujuan admin: kelola konten di Sanity Studio atau lihat dashboard metrik.</p>

				<div className="mt-10 grid gap-4 md:grid-cols-2">
					<Link
						href="/admin/studio"
						className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
					>
						<div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Content</div>
						<div className="mt-2 text-xl font-semibold">Sanity Studio</div>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Create and edit blog posts, case studies, and configuration documents.</p>
					</Link>

					<Link
						href="/admin/dashboard"
						className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
					>
						<div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Metrics</div>
						<div className="mt-2 text-xl font-semibold">Admin Dashboard</div>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Review widget configuration output and live metric payload from API.</p>
					</Link>
				</div>
			</div>
		</main>
	);
}
