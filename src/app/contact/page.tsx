"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BentoGrid, BentoCard } from "@/components/BentoGrid";
import { FloatingDock } from "@/components/FloatingDock";
import { ThemeToggle } from "@/components/ThemeToggle";
import { profile } from "@/lib/profile";
import { ArrowLeft, Mail, MessageSquare, MapPin, Send } from "lucide-react";

export default function ContactPage() {
	const [error, setError] = useState<string>("");

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");

		const formData = new FormData(event.currentTarget);
		const name = String(formData.get("name") ?? "").trim();
		const email = String(formData.get("email") ?? "").trim();
		const message = String(formData.get("message") ?? "").trim();
		const website = String(formData.get("website") ?? "").trim();

		if (website) {
			return;
		}

		if (!name || !email || !message) {
			setError("Please complete all required fields.");
			return;
		}

		if (message.length < 10) {
			setError("Message is too short. Please add a bit more detail.");
			return;
		}

		const sanitizedName = name.replace(/[\r\n]/g, " ");
		const sanitizedEmail = email.replace(/[\r\n]/g, " ");
		const sanitizedMessage = message.replace(/[\r\n]/g, "\n");

		const subject = encodeURIComponent(`Portfolio Contact - ${sanitizedName}`);
		const body = encodeURIComponent(`Name: ${sanitizedName}\nEmail: ${sanitizedEmail}\n\n${sanitizedMessage}`);
		window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
	};

	return (
		<main className="min-h-screen bg-zinc-50 dark:bg-[#0f0f0f] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 pb-24">
			<div className="fixed top-6 right-6 z-50">
				<ThemeToggle />
			</div>
			<FloatingDock />

			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="py-12 md:py-20">
				<BentoGrid>
					{/* Header Card */}
					<BentoCard colSpan={3} className="text-center">
						<Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4 transition-colors">
							<ArrowLeft className="w-4 h-4" />
							Back to Home
						</Link>
						<h1 className="text-4xl md:text-5xl font-bold mb-4">Contact</h1>
						<p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">Let&apos;s connect! Feel free to reach out for collaborations or just a chat.</p>
					</BentoCard>

					{/* Contact Info Cards */}
					<BentoCard className="flex flex-col items-center justify-center text-center">
						<Mail className="w-10 h-10 mb-3 text-blue-500" />
						<h3 className="font-bold text-lg mb-2">Email</h3>
						<a href={profile.socials.contact} className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-blue-500 transition-colors">
							{profile.email}
						</a>
					</BentoCard>

					<BentoCard className="flex flex-col items-center justify-center text-center">
						<MapPin className="w-10 h-10 mb-3 text-red-500" />
						<h3 className="font-bold text-lg mb-2">Location</h3>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">{profile.location}</p>
					</BentoCard>

					<BentoCard className="flex flex-col items-center justify-center text-center">
						<MessageSquare className="w-10 h-10 mb-3 text-green-500" />
						<h3 className="font-bold text-lg mb-2">Response Time</h3>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">Within 24 hours</p>
					</BentoCard>

					{/* Contact Form Placeholder */}
					<BentoCard colSpan={3}>
						<h3 className="font-bold text-xl mb-6 flex items-center gap-2">
							<Send className="w-5 h-5" />
							Send a Message
						</h3>
						<form onSubmit={handleSubmit} noValidate className="space-y-4">
							<div className="hidden" aria-hidden="true">
								<label htmlFor="website">Website</label>
								<input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<input name="name" type="text" required maxLength={100} placeholder="Your Name" className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
								<input name="email" type="email" required maxLength={120} placeholder="Your Email" className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
							</div>
							<textarea name="message" required minLength={10} maxLength={2000} placeholder="Your Message" rows={4} className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
							{error ? <p className="text-sm text-red-500">{error}</p> : null}
							<button type="submit" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium hover:opacity-90 transition-opacity">
								<Send className="w-4 h-4" />
								Open Email Draft
							</button>
						</form>
					</BentoCard>
				</BentoGrid>
			</motion.div>
		</main>
	);
}
