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
    body[]{
      ...,
      markDefs[]{
        ...,
        _type == "internalLink" => {
          ...,
          label,
          fallbackHref,
          "slug": reference->slug,
          "refType": reference->_type
        }
      }
    },
    tags,
    scholarlyArticleRef
  }
`;

// Get all post slugs for static generation
export const postSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)][].slug.current
`;

const caseStudyFields = `
  _id,
  title,
  slug,
  repoName,
  summary,
  role,
  duration,
  year,
  problem,
  solution,
  impact,
  techStack,
  architecture,
  lessons,
  liveUrl,
  featured,
  orderRank,
  architectureGraph {
    nodes[] {
      _key,
      id,
      kind,
      label,
      subtitle,
      details,
      position,
      linkedNodeId
    },
    edges[] {
      _key,
      id,
      source,
      target,
      label,
      animated
    }
  }
`;

export const caseStudyListQuery = groq`
  *[_type == "caseStudy" && defined(slug.current)] | order(featured desc, orderRank asc, _createdAt desc) {
    ${caseStudyFields}
  }
`;

export const caseStudyDetailBySlugQuery = groq`
  *[_type == "caseStudy" && slug.current == $slug][0] {
    ${caseStudyFields}
  }
`;

export const caseStudySlugListQuery = groq`
  *[_type == "caseStudy" && defined(slug.current)][].slug.current
`;

export const caseStudyRepoSlugMapQuery = groq`
  *[_type == "caseStudy" && defined(slug.current) && defined(repoName)]{
    "repoName": lower(repoName),
    "caseStudySlug": slug.current
  }
`;

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0]{
    availability{
      internship,
      freelance,
      fullTime
    }
  }
`;

// Backward-compatible aliases for incremental migration.
export const caseStudiesQuery = caseStudyListQuery;
export const caseStudyBySlugQuery = caseStudyDetailBySlugQuery;
export const caseStudySlugsQuery = caseStudySlugListQuery;
export const caseStudyRepoMapQuery = caseStudyRepoSlugMapQuery;
