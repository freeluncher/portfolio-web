"use client";

import { GitHubCalendar } from "react-github-calendar";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { profile } from "@/lib/profile";

export default function GithubCalendarComponent() {
	const { resolvedTheme } = useTheme();
	const colorScheme = resolvedTheme === "dark" ? "dark" : "light";
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		const intervalId = window.setInterval(() => {
			setRefreshKey((prev) => prev + 1);
		}, 300000);

		return () => {
			window.clearInterval(intervalId);
		};
	}, []);

	return (
		<div className="overflow-x-auto">
			<GitHubCalendar key={refreshKey} username={profile.githubUsername} colorScheme={colorScheme} blockSize={10} blockMargin={4} fontSize={14} />
		</div>
	);
}
