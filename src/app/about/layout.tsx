import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
	title: "About Gandhi Satria Dewa",
	description:
		"Learn about Gandhi Satria Dewa: background, engineering mindset, and journey from mechanical engineering to fullstack development.",
	alternates: {
		canonical: "/about",
	},
	openGraph: {
		title: "About Gandhi Satria Dewa",
		description:
			"Learn about Gandhi Satria Dewa: background, engineering mindset, and journey from mechanical engineering to fullstack development.",
		type: "profile",
		url: absoluteUrl("/about"),
	},
	twitter: {
		card: "summary_large_image",
		title: "About Gandhi Satria Dewa",
		description:
			"Learn about Gandhi Satria Dewa: background, engineering mindset, and journey from mechanical engineering to fullstack development.",
	},
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
	return children;
}
