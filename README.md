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

## MCP-Native Blog Publishing Flow (Sanity)

This repository now uses MCP-native publishing for article automation. The publish action is executed directly by Sanity MCP tools from your AI agent session, not through custom API routes.

Active route kept in app:

- `POST /api/revalidate`: revalidate blog pages after Sanity webhook events.

### 1) Configure Sanity MCP in VS Code

1. Run `npx sanity@latest mcp configure`
2. Select VS Code when prompted.
3. Restart VS Code/Copilot chat session.

After setup, your agent can call Sanity MCP tools such as:

- `create_documents_from_markdown`
- `publish_documents`
- `query_documents`

### 2) Required environment variables for app runtime

Keep only runtime variables needed by web app + revalidation:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- `SANITY_REVALIDATE_SECRET`
- `NEXT_PUBLIC_GOOGLE_TAG_ID` (or `NEXT_PUBLIC_GA_MEASUREMENT_ID`)

For analytics sync pipeline (optional, if using `/api/metrics/sync`):

- `METRICS_SYNC_SECRET`
- `SANITY_API_WRITE_TOKEN`

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

### 4) One-prompt workflow from markdown file in VS Code chat

Attach markdown file to chat, then use this prompt:

"Gunakan Sanity MCP tools untuk membuat dan publish artikel blog dari file markdown terlampir. Ikuti langkah ini: (1) create_documents_from_markdown untuk type post, (2) validasi field penting title, slug, excerpt, body, tags, (3) publish_documents untuk draft yang baru dibuat, (4) tampilkan id dokumen, slug, dan URL blog akhir."

### 5) Optional quality gate prompt

For stricter quality checks before publishing, use this add-on in your prompt:

"Sebelum publish, pastikan: title 8-110 karakter, excerpt 60-240 karakter, body minimal 180 kata dan 3 paragraf, tags 2-6 item unik, dan tidak mengandung TODO/TBD/Lorem Ipsum. Jika gagal, jangan publish dan tampilkan daftar masalah."

### 6) Why this is MCP-native

1. Document creation is done by MCP tool calls directly to Sanity workspace.
2. Publishing is done by MCP publish tool directly.
3. No app-level write token endpoint is required for publishing automation.
4. Content operation history stays aligned with MCP action flow.

## Analytics Dashboard Sync Endpoint

This repository now includes a protected endpoint for writing aggregated metrics into Sanity:

- `POST /api/metrics/sync`
- Header: `x-metrics-sync-secret: YOUR_METRICS_SYNC_SECRET`

Payload example:

```json
{
	"source": "ga4",
	"snapshots": [
		{
			"metricKey": "sessions",
			"periodType": "daily",
			"periodStart": "2026-04-14T00:00:00.000Z",
			"periodEnd": "2026-04-14T23:59:59.999Z",
			"value": 128,
			"dimensions": {
				"pagePath": "/blog",
				"deviceCategory": "mobile"
			}
		}
	]
}
```

## Analytics Dashboard Read Endpoint

Use this endpoint to consume widget configuration + time-series points in one response:

- `GET /api/metrics/dashboard`
- Optional query param: `days` (default `30`, min `1`, max `365`)

Example:

```text
/api/metrics/dashboard?days=30
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
