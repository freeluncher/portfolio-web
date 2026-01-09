import { groq } from "next-sanity";

// Get all posts sorted by date
export const postsQuery = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    mainImage,
    publishedAt,
    excerpt,
    tags
  }
`;

// Get a single post by slug
export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    mainImage,
    publishedAt,
    excerpt,
    body,
    tags
  }
`;

// Get all post slugs for static generation
export const postSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)][].slug.current
`;
