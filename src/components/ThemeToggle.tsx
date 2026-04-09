"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
	const { setTheme, resolvedTheme } = useTheme();
	const isDark = resolvedTheme === "dark";
	const Icon = isDark ? Sun : Moon;

	return (
		<button
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors"
			aria-label="Toggle theme">
			<Icon className={isDark ? "w-5 h-5 text-orange-400" : "w-5 h-5 text-blue-500"} />
		</button>
	);
}
