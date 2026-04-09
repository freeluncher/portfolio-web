import "server-only";

import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env/public'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false, // Keep blog content fresh when using ISR, tag-based revalidation, or live updates
})
