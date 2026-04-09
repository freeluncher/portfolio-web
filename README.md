This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Automatic Blog Publish Flow (Sanity + Vercel)

This project includes two production routes:

- `POST /api/blog/auto-publish`: create a Sanity blog post draft and publish it automatically.
- `POST /api/revalidate`: revalidate blog pages after Sanity webhook events.

### 1) Required environment variables

Add these variables in Vercel (Project Settings > Environment Variables) and in `.env.local`:

- `SANITY_API_WRITE_TOKEN`: Sanity token with write permission.
- `BLOG_AUTOPUBLISH_SECRET`: secret for securing `/api/blog/auto-publish`.
- `SANITY_REVALIDATE_SECRET`: secret for securing `/api/revalidate`.
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`

### 2) Create a Sanity write token

1. Open Sanity Manage > Project > API > Tokens.
2. Create a token with write access.
3. Save it to `SANITY_API_WRITE_TOKEN` in Vercel.

### 3) Configure Sanity webhook for cache revalidation

In Sanity Manage > API > Webhooks:

1. URL: `https://YOUR_DOMAIN/api/revalidate`
2. Method: `POST`
3. HTTP header: `x-sanity-webhook-secret: YOUR_SANITY_REVALIDATE_SECRET`
4. Filter:

```groq
_type == "post"
```

5. Projection:

```groq
{
	_type,
	slug
}
```

6. Trigger events: create, update, delete, publish, unpublish.

### 4) Call the auto publish route

Call this route from your AI agent/server process:

`POST https://YOUR_DOMAIN/api/blog/auto-publish`

Header:

- `x-blog-automation-secret: YOUR_BLOG_AUTOPUBLISH_SECRET`

JSON body example:

```json
{
	"title": "Membangun Portfolio Next.js yang Cepat",
	"excerpt": "Panduan singkat optimasi performa untuk portfolio modern.",
	"body": "Paragraf pertama.\n\nParagraf kedua.",
	"tags": ["nextjs", "sanity", "vercel"],
	"autoPublish": true
}
```

If `autoPublish` is omitted, the post is published by default.

### 5) End-to-end behavior

1. Route creates a draft post in Sanity.
2. Route publishes it (unless `autoPublish: false`).
3. Route revalidates `/blog` and `/blog/[slug]` via tag/path.
4. Sanity webhook also triggers `/api/revalidate` for ongoing content edits.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
