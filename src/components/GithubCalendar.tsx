"use client";

import { GitHubCalendar } from "react-github-calendar";
import { useTheme } from "next-themes";

export default function GithubCalendarComponent() {
	const { resolvedTheme } = useTheme();
	const colorScheme = resolvedTheme === "dark" ? "dark" : "light";

	return (
		<div className="overflow-x-auto">
			<GitHubCalendar username="freeluncher" colorScheme={colorScheme} blockSize={10} blockMargin={4} fontSize={14} />
		</div>
	);
}
