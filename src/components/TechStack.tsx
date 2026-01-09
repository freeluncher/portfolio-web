"use client";

import { motion } from "framer-motion";

const techs = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL", "Ethers.js", "Figma", "Git", "Docker", "AWS", "GraphQL"];

export default function TechStack() {
	return (
		<div className="w-full overflow-hidden py-8 border-y border-border bg-card/50 backdrop-blur-sm">
			<div className="max-w-3xl mx-auto px-6 mb-4">
				<h3 className="text-sm font-semibold text-muted tracking-wider uppercase">Technologies</h3>
			</div>
			<div className="relative flex">
				<motion.div
					className="flex gap-8 whitespace-nowrap"
					animate={{ x: [0, -1000] }}
					transition={{
						repeat: Infinity,
						ease: "linear",
						duration: 25,
					}}>
					{[...techs, ...techs, ...techs].map((tech, i) => (
						<div key={i} className="text-2xl font-bold text-foreground/20 hover:text-foreground transition-colors cursor-default">
							{tech}
						</div>
					))}
				</motion.div>
			</div>
		</div>
	);
}
