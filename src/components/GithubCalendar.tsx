"use client";

import { GitHubCalendar } from "react-github-calendar";

export default function GithubCalendarComponent() {
	return (
		<div className="overflow-x-auto">
			<GitHubCalendar username="freeluncher" colorScheme="dark" blockSize={10} blockMargin={4} fontSize={14} />
		</div>
	);
}
