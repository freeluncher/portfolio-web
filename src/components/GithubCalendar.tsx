"use client";

import dynamic from "next/dynamic";
// @ts-ignore
const GitHubCalendar = dynamic(() => import("react-github-calendar").then((mod) => mod.GitHubCalendar), { ssr: false }) as any;

export default function GithubCalendarComponent() {
	return (
		<div className="overflow-x-auto">
			<GitHubCalendar username="freeluncher" colorScheme="dark" blockSize={10} blockMargin={4} fontSize={14} />
		</div>
	);
}
