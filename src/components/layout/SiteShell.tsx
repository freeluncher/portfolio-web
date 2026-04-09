import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FloatingDock } from "@/components/FloatingDock";
import { cn } from "@/lib/utils";

interface SiteShellProps {
	children: ReactNode;
	className?: string;
}

const defaultMainClassName = "min-h-screen bg-zinc-50 dark:bg-[#0f0f0f] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 pb-24";

export default function SiteShell({ children, className }: SiteShellProps) {
	return (
		<main className={cn(defaultMainClassName, className)}>
			<div className="fixed top-6 right-6 z-50">
				<ThemeToggle />
			</div>
			<FloatingDock />
			{children}
		</main>
	);
}
