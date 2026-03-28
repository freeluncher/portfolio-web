import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { profile } from "@/lib/profile";
import { siteUrl } from "@/lib/site";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: profile.metadata.title,
	description: profile.metadata.description,
	metadataBase: new URL(siteUrl),
	alternates: {
		canonical: "/",
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
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground transition-colors duration-300`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
