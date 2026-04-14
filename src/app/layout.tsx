import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { profile } from "@/lib/profile";
import { siteUrl } from "@/lib/site";
import { Analytics } from "@vercel/analytics/react";
import SpeedInsightsGate from "@/components/SpeedInsightsGate";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const personJsonLd = {
	"@context": "https://schema.org",
	"@type": "Person",
	name: profile.name,
	url: siteUrl,
	sameAs: [profile.socials.linkedin, profile.socials.github, profile.socials.instagram],
	jobTitle: "Software Engineer / Designer / Mechanical Engineer",
	description: profile.bio,
	alumniOf: {
		"@type": "CollegeOrUniversity",
		name: "Politeknik Negeri Semarang",
	},
};

export const metadata: Metadata = {
	title: profile.metadata.title,
	description: profile.metadata.description,
	metadataBase: new URL(siteUrl),
	icons: {
		icon: "/favicon.ico",
		apple: "/favicon.ico",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
			"max-video-preview": -1,
		},
	},
	openGraph: {
		title: profile.metadata.title,
		description: profile.metadata.description,
		url: siteUrl,
		type: "website",
		locale: "en_US",
		siteName: profile.name,
	},
	twitter: {
		card: "summary_large_image",
		title: profile.metadata.title,
		description: profile.metadata.description,
	},
	verification: {
		google: "tyPR1-dHOlXkGnwvP_tuXPIkQHK09YdwsGnkWdIUdug",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
			<head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
					}}
				/>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground transition-colors duration-300`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					{children}
				</ThemeProvider>
				<Analytics />
				<SpeedInsightsGate />
			</body>
		</html>
	);
}
