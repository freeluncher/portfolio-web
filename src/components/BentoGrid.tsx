"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BentoCardProps {
	children: ReactNode;
	className?: string;
	colSpan?: 1 | 2 | 3;
	rowSpan?: 1 | 2;
}

export function BentoCard({ children, className, colSpan = 1, rowSpan = 1 }: BentoCardProps) {
	const spanClasses = {
		col: {
			1: "md:col-span-1",
			2: "md:col-span-2",
			3: "md:col-span-3",
		},
		row: {
			1: "row-span-1",
			2: "row-span-2",
		},
	};

	return (
		<div
			className={cn(
				// Base styles
				"relative overflow-hidden rounded-2xl p-6",
				// Theme-aware backgrounds
				"bg-white dark:bg-[#1a1a1a]",
				// Theme-aware borders
				"border border-zinc-200 dark:border-zinc-800",
				// Hover effects
				"hover:border-zinc-300 dark:hover:border-zinc-700",
				"transition-all duration-300",
				// Grid spans
				spanClasses.col[colSpan],
				spanClasses.row[rowSpan],
				className
			)}>
			{children}
		</div>
	);
}

interface BentoGridProps {
	children: ReactNode;
	className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
	return <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6", "max-w-6xl mx-auto px-4 md:px-6", className)}>{children}</div>;
}
