"use client";

import dynamic from "next/dynamic";

export const LazyWakaStats = dynamic(() => import("@/components/WakaStats"), {
	ssr: false,
});

export const LazyGithubCalendar = dynamic(() => import("@/components/GithubCalendar"), {
	ssr: false,
});

export const LazyProjects = dynamic(() => import("@/components/Projects"), {
	ssr: false,
});
