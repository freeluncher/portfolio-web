"use client";

import { cn } from "@/lib/utils";
import { Github, Instagram, Linkedin, Mail, Music2, PhoneIcon } from "lucide-react";

interface SocialLinksProps {
	variant?: "default" | "compact";
	className?: string;
}

const socials = [
	{
		label: "GitHub",
		href: "https://github.com/freeluncher",
		icon: Github,
		isExternal: true,
	},
	{
		label: "LinkedIn",
		href: "https://www.linkedin.com/in/gandhi-satria-dewa",
		icon: Linkedin,
		isExternal: true,
	},
	{
		label: "Instagram",
		href: "https://www.instagram.com/gasawadev",
		icon: Instagram,
		isExternal: true,
	},
	{
		label: "TikTok",
		href: "https://www.tiktok.com/@gans.dev",
		icon: Music2,
		isExternal: true,
	},
    {   label: "WhatsApp", href: "https://wa.me/62895414954962",
        icon: PhoneIcon,
        isExternal: true },
	{
		label: "Contact",
		href: "mailto:gandhisatriadewa06@gmail.com",
		icon: Mail,
		isExternal: false,
	},
] as const;

export default function SocialLinks({ variant = "default", className }: SocialLinksProps) {
	const baseButtonClass = variant === "compact" ? "px-4 py-2.5 rounded-xl text-sm" : "px-5 py-2.5 rounded-lg text-sm";

	return (
		<div className={cn("flex flex-wrap items-center gap-3", className)}>
			{socials.map((social) => {
				const Icon = social.icon;
				const isContact = social.label === "Contact";

				return (
					<a
						key={social.label}
						href={social.href}
						target={social.isExternal ? "_blank" : undefined}
						rel={social.isExternal ? "noopener noreferrer" : undefined}
						className={cn(
							"inline-flex items-center gap-2 font-medium transition-all",
							isContact
								? "bg-primary text-zinc-100 hover:opacity-80 border border-primary shadow-sm dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-primary/90 dark:border-primary"
								: "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100",
							baseButtonClass
						)}>
						<Icon className="w-4 h-4" />
						<span>{social.label}</span>
					</a>
				);
			})}
		</div>
	);
}
