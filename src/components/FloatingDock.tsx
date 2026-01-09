"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, User, BookOpen, FileText, Mail, LucideIcon } from "lucide-react";

interface NavItem {
	label: string;
	href: string;
	icon: LucideIcon;
}

const navItems: NavItem[] = [
	{ label: "Home", href: "/", icon: Home },
	{ label: "About", href: "/about", icon: User },
	{ label: "Blog", href: "/blog", icon: BookOpen },
	{ label: "Resume", href: "/resume", icon: FileText },
	{ label: "Contact", href: "/contact", icon: Mail },
];

export function FloatingDock() {
	const pathname = usePathname();

	return (
		<motion.nav initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
			<div className="flex items-center gap-1 md:gap-2 px-3 py-2 md:px-4 md:py-3 rounded-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200/50 dark:border-white/10 shadow-lg shadow-zinc-200/50 dark:shadow-black/30">
				{navItems.map((item) => {
					const isActive = pathname === item.href;
					const Icon = item.icon;

					return (
						<Link key={item.href} href={item.href}>
							<motion.div
								whileHover={{ scale: 1.2, y: -4 }}
								whileTap={{ scale: 0.95 }}
								transition={{ type: "spring", stiffness: 400, damping: 17 }}
								className={`
                  relative flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full cursor-pointer
                  transition-colors duration-200
                  ${isActive ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}
                `}>
								<Icon className="w-5 h-5 flex-shrink-0" />
								{/* Label - Hidden on mobile, visible on md+ */}
								<span className="hidden md:inline text-sm font-medium">{item.label}</span>

								{/* Active indicator dot for mobile */}
								{isActive && <motion.div layoutId="activeIndicator" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-zinc-900 dark:bg-white md:hidden" />}
							</motion.div>
						</Link>
					);
				})}
			</div>
		</motion.nav>
	);
}
