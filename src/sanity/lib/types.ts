import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { PortableTextBlock } from "@portabletext/types";

export interface Post {
	_id: string;
	title: string;
	slug: {
		current: string;
	};
	mainImage?: SanityImageSource;
	publishedAt?: string;
	excerpt?: string;
	body?: PortableTextBlock[];
	tags?: string[];
}

export interface CaseStudy {
	_id: string;
	title: string;
	slug: {
		current: string;
	};
	repoName: string;
	summary: string;
	role: string;
	duration: string;
	year: string;
	problem: string;
	solution: string;
	impact: string[];
	techStack: string[];
	architecture: string[];
	lessons: string[];
	liveUrl?: string;
	featured?: boolean;
	orderRank?: number;
}
