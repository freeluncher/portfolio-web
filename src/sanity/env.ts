function readEnvValue(keys: string[]): string | undefined {
  const processEnv = typeof process !== "undefined" ? process.env : undefined;
  const metaEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

  for (const key of keys) {
    const processValue = processEnv?.[key];
    if (typeof processValue === "string" && processValue.length > 0) {
      return processValue;
    }

    const metaValue = metaEnv?.[key];
    if (typeof metaValue === "string" && metaValue.length > 0) {
      return metaValue;
    }
  }

  return undefined;
}

function assertValue(v: string | undefined, errorMessage: string): string {
  if (!v) {
    throw new Error(errorMessage);
  }

  return v;
}

function resolveDataset(): string {
  const configuredDataset = readEnvValue(["NEXT_PUBLIC_SANITY_DATASET", "SANITY_STUDIO_DATASET", "VITE_SANITY_DATASET", "SANITY_DATASET"]);
  if (configuredDataset) {
    return configuredDataset;
  }

  // In Studio's browser runtime, env prefixes can be filtered by Vite config.
  // Fall back to the standard Sanity dataset to avoid hard crash on startup.
  if (typeof window !== "undefined") {
    console.warn("Sanity dataset env is missing; using fallback dataset 'production'.");
    return "production";
  }

  throw new Error("Missing Sanity dataset. Set one of: NEXT_PUBLIC_SANITY_DATASET, SANITY_STUDIO_DATASET, or VITE_SANITY_DATASET");
}

export const apiVersion =
  readEnvValue(["NEXT_PUBLIC_SANITY_API_VERSION", "SANITY_STUDIO_API_VERSION", "VITE_SANITY_API_VERSION"]) || "2026-01-09";

export const dataset = resolveDataset();

export const projectId = assertValue(
  readEnvValue(["NEXT_PUBLIC_SANITY_PROJECT_ID", "SANITY_STUDIO_PROJECT_ID", "VITE_SANITY_PROJECT_ID", "SANITY_PROJECT_ID"]),
  "Missing Sanity project ID. Set one of: NEXT_PUBLIC_SANITY_PROJECT_ID, SANITY_STUDIO_PROJECT_ID, or VITE_SANITY_PROJECT_ID"
);
