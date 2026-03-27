"use client";

import { Briefcase } from "lucide-react";

interface Experience {
	id: number;
	role: string;
	company: string;
	period: string;
}

const experiences: Experience[] = [
	{ id: 1, role: "Freelance Full-stack Developer", company: "Gasawadev", period: "2021 - Present" },
	{ id: 2, role: "Maintenance Technician", company: "PT Garuda Food Putra Putri Jaya Tbk.", period: "2023" },
];

export default function Timeline() {
	return (
		<div className="space-y-4">
			{experiences.map((exp) => (
				<div key={exp.id} className="relative pl-4 border-l-2 border-zinc-200 dark:border-zinc-700">
					<h4 className="font-semibold text-sm">{exp.role}</h4>
					<div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
						<Briefcase className="w-3 h-3" />
						<span>{exp.company}</span>
					</div>
					<div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{exp.period}</div>
				</div>
			))}
		</div>
	);
}
