import { type SchemaTypeDefinition } from "sanity";
import { postType } from "./post";
import { caseStudyType } from "./caseStudy";
import { architectureGraphEdgeType, architectureGraphNodeType, architectureGraphType } from "./architectureGraph";

export const schema: { types: SchemaTypeDefinition[] } = {
	types: [postType, caseStudyType, architectureGraphType, architectureGraphNodeType, architectureGraphEdgeType],
};
