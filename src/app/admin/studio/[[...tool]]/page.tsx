/**
 * This route mounts the built-in authoring environment using Sanity Studio.
 * All nested routes under /admin/studio are handled by this optional catch-all route.
 */

import { NextStudio } from "next-sanity/studio";
import config from "../../../../../sanity.config";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
	return <NextStudio config={config} />;
}
