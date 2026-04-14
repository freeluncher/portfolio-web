import { type SchemaTypeDefinition } from "sanity";
import { postType } from "./post";
import { caseStudyType } from "./caseStudy";
import { architectureGraphEdgeType, architectureGraphNodeType, architectureGraphType } from "./architectureGraph";
import { siteSettingsType } from "./siteSettings";

export const schema: { types: SchemaTypeDefinition[] } = {
	types: [postType, caseStudyType, siteSettingsType, architectureGraphType, architectureGraphNodeType, architectureGraphEdgeType],
};
