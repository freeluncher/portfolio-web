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
